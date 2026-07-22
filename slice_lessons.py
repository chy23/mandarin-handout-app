import json
import re

# Read lessons.js
with open('src/data/lessons.js', 'r') as f:
    text = f.read()

# Find the start of Lesson 4
idx = text.find('  },\n  {\n    "id": "lesson-4"')
if idx != -1:
    new_text = text[:idx] + '  }\n];\n'
    with open('src/data/lessons.js', 'w') as f:
        f.write(new_text)

# Read deploy.yml
with open('.github/workflows/deploy.yml', 'r') as f:
    deploy_text = f.read()

# Update branch
deploy_text = re.sub(r'branches: \[ .* \]', 'branches: [ 115-2-L3 ]', deploy_text)

with open('.github/workflows/deploy.yml', 'w') as f:
    f.write(deploy_text)

print("Data sliced to L1, L2 & L3, and deploy.yml updated to branch 115-2-L3.")
