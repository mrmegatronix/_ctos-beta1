import re

with open('constants.ts', 'r') as f:
    content = f.read()

def replacer(match):
    args = match.group(1)
    # Replace leading zeros in numbers, but preserve single zero
    # e.g., 08 -> 8, 00 -> 0, 01 -> 1
    new_args = re.sub(r'\b0([0-9]+)\b', r'\1', args)
    return f"new Date({new_args})"

new_content = re.sub(r'new Date\(([^)]+)\)', replacer, content)

with open('constants.ts', 'w') as f:
    f.write(new_content)
