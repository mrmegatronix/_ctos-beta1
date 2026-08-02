from bs4 import BeautifulSoup
import json

with open('/home/zeus/.gemini/antigravity/brain/1766d171-5b88-4d35-bcff-0a38851e29b1/.system_generated/steps/1571/content.md', 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

menus = []

# Looking for menu categories (e.g. starters, mains)
for section in soup.find_all(['h2', 'h3', 'h4']):
    # The menu might be structured in specific divs
    pass

# A generic approach to find food items:
items = soup.find_all(class_=lambda c: c and 'menu-item' in c.lower())
if not items:
    # Maybe try a different class? Let's just print some text to see the structure.
    # Often menus are in ul/li or specific divs.
    print("No menu-item class found. Printing h3s:")
    for h3 in soup.find_all('h3'):
        print(h3.text.strip())
else:
    for item in items:
        print(item.text.strip())

