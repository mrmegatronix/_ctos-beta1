import re

with open('App.tsx', 'r') as f:
    content = f.read()

# Update TimeclockView import if needed. It seems to already be imported.
# Find the line: {currentModule === 'timeclock' && <TimeclockView />}
# And replace it with {currentModule === 'timeclock' && <TimeclockView user={activeUser} staff={staff} />}

content = content.replace("{currentModule === 'timeclock' && <TimeclockView />}", "{currentModule === 'timeclock' && activeUser && <TimeclockView user={activeUser} staff={staff} />}")

with open('App.tsx', 'w') as f:
    f.write(content)
