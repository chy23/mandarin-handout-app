import os
import subprocess

def run(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

# 確保我們在 main 分支而且是最新
try:
    run("git checkout main")
    run("git add -A")
    run("git commit -m 'save'")
except:
    pass

for i in range(1, 7):
    branch = f"115-1-L{i}"
    print(f"\n========== 處理分支 {branch} ==========")
    
    # 強制從 main 重新建立分支，這樣就完全沒有衝突了！
    try:
        run(f"git branch -D {branch}")
    except:
        pass
    run(f"git checkout -b {branch}")
    
    # 1. 修改 vite.config.js 的 base 路徑
    with open("vite.config.js", "r") as f:
        v = f.read()
    import re
    v = re.sub(r"base: \x27/mandarin-handout-app/.*?\x27,", f"base: '/mandarin-handout-app/{branch}/',", v)
    with open("vite.config.js", "w") as f:
        f.write(v)
        
    # 2. 修改 deploy.yml (加上 keep_files 和 destination_dir)
    with open(".github/workflows/deploy.yml", "r") as f:
        text = f.read()
    if "destination_dir" not in text:
        text = text.replace("publish_dir: ./dist", f"publish_dir: ./dist\n          keep_files: true\n          destination_dir: {branch}")
        with open(".github/workflows/deploy.yml", "w") as f:
            f.write(text)
            
    # 3. 修改 App.jsx 讓它只顯示 1~N 課
    with open("src/App.jsx", "r") as f:
        app_code = f.read()
    # 替換 import
    if "import { lessons } from './data/lessons';" in app_code:
        app_code = app_code.replace("import { lessons } from './data/lessons';", f"import {{ lessons as allLessons }} from './data/lessons';\nconst lessons = allLessons.slice(0, {i});")
    with open("src/App.jsx", "w") as f:
        f.write(app_code)
        
    # 提交並強制覆蓋 GitHub (解決之前的衝突錯誤)
    run("git add -A")
    run(f"git commit -m '自動同步總表並精準切割 {i} 課'")
    run(f"git push origin {branch} --force")
    
    # 休息 30 秒防塞車
    print("等待 30 秒防塞車...")
    import time
    time.sleep(30)
    
run("git checkout main")
print("全部修復完畢！")
