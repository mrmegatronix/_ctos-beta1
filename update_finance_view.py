import re

with open('components/FinanceView.tsx', 'r') as f:
    content = f.read()

# Add import
if "import CashUpView" not in content:
    content = content.replace("import React, { useState, useRef } from 'react';", 
                              "import React, { useState, useRef } from 'react';\nimport CashUpView from './CashUpView';")

# Replace activeTab === 'entry'
# It starts at: {activeTab === 'entry' && (
# It ends right before: {activeTab === 'invoices' && (
start_idx = content.find("{activeTab === 'entry' && (")
if start_idx != -1:
    end_idx = content.find("{activeTab === 'invoices' && (", start_idx)
    replacement = "{activeTab === 'entry' && (\n        <CashUpView />\n      )}\n\n      "
    content = content[:start_idx] + replacement + content[end_idx:]
    
with open('components/FinanceView.tsx', 'w') as f:
    f.write(content)

print("Updated FinanceView.tsx to use CashUpView")
