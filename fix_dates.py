import re

with open('constants.ts', 'r') as f:
    content = f.read()

# Replace any occurrence of ', 0X' or ', 0X,' inside Date with ', X'
def remove_leading_zero(match):
    return re.sub(r'\b0([0-9])\b', r'\1', match.group(0))

new_content = re.sub(r'new Date\([^)]+\)', remove_leading_zero, content)

with open('constants.ts', 'w') as f:
    f.write(new_content)

print("Fixed legacy octal literals")
