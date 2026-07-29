import re
import datetime

roster_text = """
2026 COASTERS TAVERN -FOH ROSTER
WEEK ENDING
02/08/26
DATE:
27/07/26
28/7/26
29/7/26
30/7/26
31/7/26
01/08/26
2/8/26
DAY
MONDAY
TUESDAY
WEDNESDAY
THURSDAY
FRIDAY
SATURDAY
SUNDAY
ROBERT
12:00-17:00
12.00-23.00
13.00-23.00
X
BIANCA
08:30-15:00
17.00-22.00
830-14.00
8:30-16:00
8.30-16.00
X
NICOLE
15.00-21.00
8.30-14.00
16.00-23.00
X
X
08.30-17.30
8.30-22.00
NIKKO
X
X
17:00-23:00
16:00-23.00
16.00-close
16.00-00.00
15,00-22.00
CARMA
4.30-Close
16.30-21.30
16:00-close
16.00-clase
16:00-close
JESS
17:30-20.30.
13.00-20.00
12-00-20.00
on call
RACHEAL
17.30-20.30?
12.00-16.30
HARSH
16:30-21:00
16.30-close
16.00-close
16:00-close
16.00-close
CL-LOCKLIP
F1-FLOOR SECTION 1
F2 FLOOR SECTION 2
FL-FLOATER (bar & floor)
X= OFF
H-HOLIDAY
DMDUTY MANAGER
WEEK ENDING 26TH
DATE:
03/08/26
04/08/26
05/08/26
06/08/26
07/08/26
08/08/26
09/08/2
DAY
MONDAY
07/07/26
WEDNESDAY
THURSDAY
FRIDAY
SATURDAY
SUNDAY
ROBERT
X
12.00-17.00
12.00-23.00
13.00-23.00
13:00-23:00
12.00-20.00
BIANCA
08.30-15.00
17.00-22.00
8.30-14.00
8.30-16.00
8.30-16.00
NICOLE
15.00-21.00
8.30-14.00
16.00-23.00
X
8.30-17.30
8.30-22.00
NIKKO
17.00-23.00
16.00-23.00
16.00-21.00
16.00-00.00
15.00-20.30
CARMA
4.30-close
16.30-close
16.00-close
16.00-close
16.00-close
JESS
17.30-20.30
on call
RACHEAL
12.00-16.30
HARSH
16.30-21.00
16.30-close
16.00-close
16.00-close
16.00-close
"""

lines = [l.strip() for l in roster_text.split('\n') if l.strip()]

staff_names = ["ROBERT", "BIANCA", "NICOLE", "NIKKO", "CARMA", "JESS", "RACHEAL", "HARSH"]

shifts = []

dates_w1 = ["2026-07-27", "2026-07-28", "2026-07-29", "2026-07-30", "2026-07-31", "2026-08-01", "2026-08-02"]
dates_w2 = ["2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-08", "2026-08-09"]

# Hardcoded data based on the text:
# Week 1
w1_shifts = [
  ("ROBERT", dates_w1[0], "12:00", "17:00"),
  ("ROBERT", dates_w1[1], "12:00", "23:00"),
  ("ROBERT", dates_w1[2], "13:00", "23:00"),
  # ("ROBERT", dates_w1[3], "X"),
  
  ("BIANCA", dates_w1[0], "08:30", "15:00"),
  ("BIANCA", dates_w1[1], "17:00", "22:00"),
  ("BIANCA", dates_w1[2], "08:30", "14:00"),
  ("BIANCA", dates_w1[3], "08:30", "16:00"),
  ("BIANCA", dates_w1[4], "08:30", "16:00"),

  ("NICOLE", dates_w1[0], "15:00", "21:00"),
  ("NICOLE", dates_w1[1], "08:30", "14:00"),
  ("NICOLE", dates_w1[2], "16:00", "23:00"),
  ("NICOLE", dates_w1[5], "08:30", "17:30"),
  ("NICOLE", dates_w1[6], "08:30", "22:00"),

  ("NIKKO", dates_w1[2], "17:00", "23:00"),
  ("NIKKO", dates_w1[3], "16:00", "23:00"),
  ("NIKKO", dates_w1[4], "16:00", "23:30"), # 23:30 for close
  ("NIKKO", dates_w1[5], "16:00", "00:00"),
  ("NIKKO", dates_w1[6], "15:00", "22:00"),
  
  ("CARMA", dates_w1[0], "04:30", "23:30"), # 4:30? maybe 16:30. Let's make it 16:30 for FOH.
  ("CARMA", dates_w1[1], "16:30", "21:30"),
  ("CARMA", dates_w1[2], "16:00", "23:30"),
  ("CARMA", dates_w1[3], "16:00", "23:30"),
  ("CARMA", dates_w1[4], "16:00", "23:30"),

  ("JESS", dates_w1[0], "17:30", "20:30"),
  ("JESS", dates_w1[1], "13:00", "20:00"),
  ("JESS", dates_w1[2], "12:00", "20:00"),
  # JESS on call W1[3]

  ("RACHEAL", dates_w1[0], "17:30", "20:30"),
  ("RACHEAL", dates_w1[1], "12:00", "16:30"),

  ("HARSH", dates_w1[0], "16:30", "21:00"),
  ("HARSH", dates_w1[1], "16:30", "23:30"),
  ("HARSH", dates_w1[2], "16:00", "23:30"),
  ("HARSH", dates_w1[3], "16:00", "23:30"),
  ("HARSH", dates_w1[4], "16:00", "23:30"),
]

w2_shifts = [
  ("ROBERT", dates_w2[1], "12:00", "17:00"),
  ("ROBERT", dates_w2[2], "12:00", "23:00"),
  ("ROBERT", dates_w2[3], "13:00", "23:00"),
  ("ROBERT", dates_w2[4], "13:00", "23:00"),
  ("ROBERT", dates_w2[5], "12:00", "20:00"),

  ("BIANCA", dates_w2[0], "08:30", "15:00"),
  ("BIANCA", dates_w2[1], "17:00", "22:00"),
  ("BIANCA", dates_w2[2], "08:30", "14:00"),
  ("BIANCA", dates_w2[3], "08:30", "16:00"),
  ("BIANCA", dates_w2[4], "08:30", "16:00"),

  ("NICOLE", dates_w2[0], "15:00", "21:00"),
  ("NICOLE", dates_w2[1], "08:30", "14:00"),
  ("NICOLE", dates_w2[2], "16:00", "23:00"),
  ("NICOLE", dates_w2[4], "08:30", "17:30"),
  ("NICOLE", dates_w2[5], "08:30", "22:00"),

  ("NIKKO", dates_w2[0], "17:00", "23:00"),
  ("NIKKO", dates_w2[1], "16:00", "23:00"),
  ("NIKKO", dates_w2[2], "16:00", "21:00"),
  ("NIKKO", dates_w2[3], "16:00", "00:00"),
  ("NIKKO", dates_w2[4], "15:00", "20:30"),

  ("CARMA", dates_w2[0], "16:30", "23:30"),
  ("CARMA", dates_w2[1], "16:30", "23:30"),
  ("CARMA", dates_w2[2], "16:00", "23:30"),
  ("CARMA", dates_w2[3], "16:00", "23:30"),
  ("CARMA", dates_w2[4], "16:00", "23:30"),

  ("JESS", dates_w2[0], "17:30", "20:30"),

  ("RACHEAL", dates_w2[0], "12:00", "16:30"),

  ("HARSH", dates_w2[0], "16:30", "21:00"),
  ("HARSH", dates_w2[1], "16:30", "23:30"),
  ("HARSH", dates_w2[2], "16:00", "23:30"),
  ("HARSH", dates_w2[3], "16:00", "23:30"),
  ("HARSH", dates_w2[4], "16:00", "23:30"),
]

all_shifts = w1_shifts + w2_shifts
shift_code = "export const INITIAL_SHIFTS: RosterShift[] = [\n"
for i, s in enumerate(all_shifts):
    # s is (Name, Date, StartTime, EndTime)
    y, m, d = s[1].split("-")
    sh, sm = s[2].split(":")
    eh, em = s[3].split(":")
    staff_id = "foh-" + s[0].lower()
    
    if s[0] == "NIKKO":
        staff_id = "admin-nikko"

    shift_code += f"""  {{
    id: 'shift-{i}',
    staffId: '{staff_id}',
    start: new Date({y}, {int(m)-1}, {d}, {sh}, {sm}),
    end: new Date({y}, {int(m)-1}, {d}, {eh}, {em}),
    role: 'FOH'
  }},
"""
shift_code += "];\n"

# Create Team Members Code
# we'll keep admin-nikko and demo, plus add the others
members = [
  ("foh-robert", "ROBERT"),
  ("foh-bianca", "BIANCA"),
  ("foh-nicole", "NICOLE"),
  ("foh-carma", "CARMA"),
  ("foh-jess", "JESS"),
  ("foh-racheal", "RACHEAL"),
  ("foh-harsh", "HARSH")
]

members_code = "export const TEAM_MEMBERS: TeamMember[] = [\n"
members_code += """
  {
    id: 'admin-nikko',
    name: 'Nikko',
    email: 'work.nikko@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    color: '#10B981',
    visible: true,
    role: 'Admin',
    pinCode: import.meta.env.VITE_ADMIN_PIN || '5551'
  },
  {
    id: 'demo',
    name: 'demo',
    email: 'demo@coasterstavern.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
    color: '#3B82F6',
    visible: true,
    role: 'Admin',
    pinCode: import.meta.env.VITE_DEMO_PIN || '0001'
  },
"""

colors = ['#EF4444', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#14B8A6', '#F43F5E']
for i, m in enumerate(members):
    members_code += f"""  {{
    id: '{m[0]}',
    name: '{m[1].capitalize()}',
    avatar: '',
    color: '{colors[i]}',
    visible: true,
    role: 'FOH',
    pinCode: '0{i}'
  }},
"""
members_code += "];\n"

# Replace in constants.ts
with open('constants.ts', 'r') as f:
    constants = f.read()

# Replace TEAM_MEMBERS
constants = re.sub(r'export const TEAM_MEMBERS: TeamMember\[\] = \[.*?\];', members_code.strip(), constants, flags=re.DOTALL)

# Replace INITIAL_SHIFTS
constants = re.sub(r'export const INITIAL_SHIFTS: RosterShift\[\] = \[.*?\];', shift_code.strip(), constants, flags=re.DOTALL)

with open('constants.ts', 'w') as f:
    f.write(constants)

print("Constants updated with provided roster data")
