import os
import re

branch = os.environ.get("CURRENT_BRANCH", "")

# 1. Update deploy.yml
deploy_file = ".github/workflows/deploy.yml"
with open(deploy_file, "r") as f:
    deploy_text = f.read()

# Make sure we don't duplicate keep_files
if "keep_files: true" not in deploy_text:
    if branch == "main":
        deploy_text = deploy_text.replace("publish_dir: ./dist", "publish_dir: ./dist\n          keep_files: true")
    else:
        deploy_text = deploy_text.replace("publish_dir: ./dist", f"publish_dir: ./dist\n          keep_files: true\n          destination_dir: {branch}")

    with open(deploy_file, "w") as f:
        f.write(deploy_text)
        
# 2. Update vite.config.js
vite_file = "vite.config.js"
if branch != "main" and branch.startswith("115-1-L"):
    with open(vite_file, "r") as f:
        vite_text = f.read()
    
    # Replace base path
    vite_text = re.sub(r"base: '/mandarin-handout-app/.*?',", f"base: '/mandarin-handout-app/{branch}/',", vite_text)
    
    with open(vite_file, "w") as f:
        f.write(vite_text)

print(f"Updated config for {branch}")
