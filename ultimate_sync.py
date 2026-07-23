import subprocess
import time
import re

def run(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

# 先讀取 main 分支的 App.jsx 原始內容，備份起來
run("git checkout main")

try:
    run("git add -A")
    run("git commit -m '同步最新修正'")
except:
    pass

# 讀取 main 的原始 App.jsx（一定要在 checkout main 之後）
with open("src/App.jsx", "r") as f:
    ORIGINAL_APP_JSX = f.read()

print(f"[確認] main 的 App.jsx 開頭: {ORIGINAL_APP_JSX[:150]}")

# 推送主網址 (總表) - 用 --force 確保成功
print("\n========== 上傳主網址 (總表) ==========")
try:
    run("git push origin main --force")
except Exception as e:
    print(f"警告: 推送主網址失敗: {e}")

for i in range(1, 7):
    branch = f"115-1-L{i}"
    print(f"\n========== 處理分支 {branch} ==========")

    # 每次都從 main 重建分支
    run("git checkout main")
    try:
        run(f"git branch -D {branch}")
    except:
        pass
    run(f"git checkout -b {branch}")

    # 1. 修改 vite.config.js 的 base 路徑
    with open("vite.config.js", "r") as f:
        v = f.read()
    v = re.sub(r"base:\s*'/mandarin-handout-app/.*?',", f"base: '/mandarin-handout-app/{branch}/',", v)
    with open("vite.config.js", "w") as f:
        f.write(v)

    # 2. 修改 deploy.yml（每次從 main 版本重建，避免累積問題）
    with open(".github/workflows/deploy.yml", "r") as f:
        deploy = f.read()

    # 移除舊的 destination_dir 與重複 keep_files
    deploy = re.sub(r"\s*destination_dir:.*", "", deploy)
    deploy = re.sub(r"(keep_files: true\s*)+", "keep_files: true\n", deploy)
    # 加上正確的 destination_dir
    deploy = deploy.replace("keep_files: true", f"keep_files: true\n          destination_dir: {branch}")
    # 修正觸發分支
    deploy = re.sub(r"branches: \[.*?\]", f"branches: [ {branch} ]", deploy)
    deploy = re.sub(r"branches:\n      - \S+", f"branches:\n      - {branch}", deploy)

    with open(".github/workflows/deploy.yml", "w") as f:
        f.write(deploy)

    # 3. 從備份的原始 App.jsx 重建，改成只顯示 1~i 課
    # 直接用字串替換（用 ORIGINAL_APP_JSX 確保每次都是乾淨的原版）
    new_app = ORIGINAL_APP_JSX.replace(
        "import { lessons } from './data/lessons';",
        f"import {{ lessons as allLessons }} from './data/lessons';\nconst lessons = allLessons.slice(0, {i});"
    )
    with open("src/App.jsx", "w") as f:
        f.write(new_app)

    # 驗證修改是否正確
    with open("src/App.jsx", "r") as f:
        check = f.read()
    if f"slice(0, {i})" in check:
        print(f"✅ App.jsx 已正確設定為 slice(0, {i})")
    else:
        print(f"❌ 警告！App.jsx 修改失敗，請手動檢查！")

    # 提交並強制推送
    run("git add -A")
    run(f"git commit -m '正確切割：{branch} 顯示第 1 至 {i} 課'")
    run(f"git push origin {branch} --force")

    print(f"等待 35 秒防塞車...")
    time.sleep(35)

run("git checkout main")
print("\n✅ 全部修復並上傳完畢！")
