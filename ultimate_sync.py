import os
import subprocess
import time
import re

def run(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

# 確保我們在 main 分支而且是最新
try:
    run("git checkout main")
    run("git add -A")
    run("git commit -m '補回專屬防護浮水印'")
except:
    pass

# 推送主網址 (總表)
print("\n========== 上傳主網址 (總表) ==========")
try:
    run("git push --set-upstream origin main")
except Exception as e:
    print(f"警告: 推送主網址失敗: {e}")

for i in range(1, 7):
    branch = f"115-1-L{i}"
    print(f"\n========== 處理分支 {branch} ==========")
    
    # 強制從 main 重新建立分支
    try:
        run(f"git branch -D {branch}")
    except:
        pass
    run(f"git checkout -b {branch}")
    
    # 1. 修改 vite.config.js 的 base 路徑
    with open("vite.config.js", "r") as f:
        v = f.read()
    v = re.sub(r"base: \x27/mandarin-handout-app/.*?\x27,", f"base: '/mandarin-handout-app/{branch}/',", v)
    with open("vite.config.js", "w") as f:
        f.write(v)
        
    # 2. 修改 deploy.yml (避免重複 keep_files 並加入 destination_dir)
    with open(".github/workflows/deploy.yml", "r") as f:
        text = f.read()
    
    text = re.sub(r"(keep_files: true\s*)+", "keep_files: true\n", text)
    if "destination_dir" not in text:
        text = text.replace("keep_files: true", f"keep_files: true\n          destination_dir: {branch}")
    else:
        text = re.sub(r"keep_files: true\n\s*destination_dir:.*", f"keep_files: true\n          destination_dir: {branch}", text)
        
    with open(".github/workflows/deploy.yml", "w") as f:
        f.write(text)
            
    # 3. 修改 App.jsx 讓它只顯示 1~N 課
    with open("src/App.jsx", "r") as f:
        app_code = f.read()
    if "import { lessons } from './data/lessons';" in app_code:
        app_code = app_code.replace("import { lessons } from './data/lessons';", f"import {{ lessons as allLessons }} from './data/lessons';\nconst lessons = allLessons.slice(0, {i});")
    with open("src/App.jsx", "w") as f:
        f.write(app_code)
        
    # 提交並強制覆蓋 GitHub
    run("git add -A")
    run(f"git commit -m '自動同步總表並精準切割 {i} 課'")
    run(f"git push origin {branch} --force")
    
    print("等待 35 秒防塞車...")
    time.sleep(35)
    
run("git checkout main")
print("全部修復並上傳完畢！")
