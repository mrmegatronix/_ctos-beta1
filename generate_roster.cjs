const fs = require('fs');

const staff = [
    {
        "id": "admin-nikko",
        "name": "Nikko",
        "email": "work.nikko@gmail.com",
        "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
        "color": "#10B981",
        "visible": true,
        "role": "Admin",
        "pinCode_expr": "import.meta.env.VITE_ADMIN_PIN || '5551'"
    },
    {
        "id": "foh-robert",
        "name": "Robert",
        "avatar": "",
        "color": "#EF4444",
        "visible": true,
        "role": "Front of House",
        "pinCode": "00"
    },
    {
        "id": "foh-bianca",
        "name": "Bianca",
        "avatar": "",
        "color": "#F59E0B",
        "visible": true,
        "role": "Front of House",
        "pinCode": "01"
    },
    {
        "id": "foh-nicole",
        "name": "Nicole",
        "avatar": "",
        "color": "#10B981",
        "visible": true,
        "role": "Front of House",
        "pinCode": "02"
    },
    {
        "id": "foh-carma",
        "name": "Carma",
        "avatar": "",
        "color": "#EC4899",
        "visible": true,
        "role": "Front of House",
        "pinCode": "03"
    },
    {
        "id": "foh-jess",
        "name": "Jess",
        "avatar": "",
        "color": "#8B5CF6",
        "visible": true,
        "role": "Front of House",
        "pinCode": "04"
    },
    {
        "id": "foh-racheal",
        "name": "Racheal",
        "avatar": "",
        "color": "#14B8A6",
        "visible": true,
        "role": "Front of House",
        "pinCode": "05"
    },
    {
        "id": "foh-harsh",
        "name": "Harsh",
        "avatar": "",
        "color": "#F43F5E",
        "visible": true,
        "role": "Front of House",
        "pinCode": "06"
    }
];

const rawShifts = [
    // Week 1
    ["foh-bianca", 2026, 6, 27, 8, 30, 15, 0],
    ["foh-nicole", 2026, 6, 27, 15, 0, 21, 0],
    ["foh-harsh", 2026, 6, 27, 16, 30, 21, 0],
    ["foh-robert", 2026, 6, 28, 12, 0, 17, 0],
    ["foh-bianca", 2026, 6, 28, 17, 0, 22, 0],
    ["foh-nicole", 2026, 6, 28, 8, 30, 14, 0],
    ["foh-carma", 2026, 6, 28, 16, 30, 23, 30],
    ["foh-robert", 2026, 6, 29, 12, 0, 23, 0],
    ["foh-bianca", 2026, 6, 29, 8, 30, 14, 0],
    ["foh-nicole", 2026, 6, 29, 16, 0, 23, 0],
    ["admin-nikko", 2026, 6, 29, 17, 0, 23, 0],
    ["foh-carma", 2026, 6, 29, 16, 30, 21, 30],
    ["foh-robert", 2026, 6, 30, 13, 0, 23, 0],
    ["foh-bianca", 2026, 6, 30, 8, 30, 16, 0],
    ["admin-nikko", 2026, 6, 30, 16, 0, 23, 0],
    ["foh-carma", 2026, 6, 30, 16, 0, 23, 30],
    ["foh-jess", 2026, 6, 30, 17, 30, 20, 30],
    ["foh-racheal", 2026, 6, 30, 17, 30, 20, 30],
    ["foh-harsh", 2026, 6, 30, 16, 30, 23, 30],
    ["foh-bianca", 2026, 6, 31, 8, 30, 16, 0],
    ["admin-nikko", 2026, 6, 31, 16, 0, 23, 30],
    ["foh-carma", 2026, 6, 31, 16, 0, 23, 30],
    ["foh-jess", 2026, 6, 31, 13, 0, 20, 0],
    ["foh-harsh", 2026, 6, 31, 16, 0, 23, 30],
    ["foh-nicole", 2026, 7, 1, 8, 30, 17, 30],
    ["admin-nikko", 2026, 7, 1, 16, 0, 23, 59],
    ["foh-carma", 2026, 7, 1, 16, 0, 23, 30],
    ["foh-jess", 2026, 7, 1, 12, 0, 20, 0],
    ["foh-harsh", 2026, 7, 1, 16, 0, 23, 30],
    ["foh-nicole", 2026, 7, 2, 8, 30, 22, 0],
    ["admin-nikko", 2026, 7, 2, 15, 0, 22, 0],
    ["foh-racheal", 2026, 7, 2, 12, 0, 16, 30],
    ["foh-harsh", 2026, 7, 2, 16, 0, 23, 30],
    // Week 2
    ["foh-bianca", 2026, 7, 3, 8, 30, 15, 0],
    ["foh-nicole", 2026, 7, 3, 15, 0, 21, 0],
    ["foh-harsh", 2026, 7, 3, 16, 30, 21, 0],
    ["foh-robert", 2026, 7, 4, 12, 0, 17, 0],
    ["foh-bianca", 2026, 7, 4, 17, 0, 22, 0],
    ["foh-nicole", 2026, 7, 4, 8, 30, 14, 0],
    ["foh-carma", 2026, 7, 4, 16, 30, 23, 30],
    ["foh-robert", 2026, 7, 5, 12, 0, 23, 0],
    ["foh-bianca", 2026, 7, 5, 8, 30, 14, 0],
    ["foh-nicole", 2026, 7, 5, 16, 0, 23, 0],
    ["admin-nikko", 2026, 7, 5, 17, 0, 23, 0],
    ["foh-carma", 2026, 7, 5, 16, 30, 23, 30],
    ["foh-robert", 2026, 7, 6, 13, 0, 23, 0],
    ["foh-bianca", 2026, 7, 6, 8, 30, 16, 0],
    ["admin-nikko", 2026, 7, 6, 16, 0, 23, 0],
    ["foh-carma", 2026, 7, 6, 16, 0, 23, 30],
    ["foh-jess", 2026, 7, 6, 17, 30, 20, 30],
    ["foh-harsh", 2026, 7, 6, 16, 30, 23, 30],
    ["foh-robert", 2026, 7, 7, 13, 0, 23, 0],
    ["foh-bianca", 2026, 7, 7, 8, 30, 16, 0],
    ["admin-nikko", 2026, 7, 7, 16, 0, 21, 0],
    ["foh-carma", 2026, 7, 7, 16, 0, 23, 30],
    ["foh-harsh", 2026, 7, 7, 16, 0, 23, 30],
    ["foh-robert", 2026, 7, 8, 12, 0, 20, 0],
    ["foh-nicole", 2026, 7, 8, 8, 30, 17, 30],
    ["admin-nikko", 2026, 7, 8, 16, 0, 23, 59],
    ["foh-carma", 2026, 7, 8, 16, 0, 23, 30],
    ["foh-harsh", 2026, 7, 8, 16, 0, 23, 30],
    ["foh-nicole", 2026, 7, 9, 8, 30, 22, 0],
    ["admin-nikko", 2026, 7, 9, 15, 0, 20, 30],
    ["foh-racheal", 2026, 7, 9, 12, 0, 16, 30],
    ["foh-harsh", 2026, 7, 9, 16, 0, 23, 30]
];

let content = fs.readFileSync('constants.ts', 'utf8');

// Replace TEAM_MEMBERS
let teamMembersJs = "export const TEAM_MEMBERS: TeamMember[] = [\n";
for (const member of staff) {
    teamMembersJs += "  {\n";
    for (const [k, v] of Object.entries(member)) {
        if (k === 'pinCode_expr') {
            teamMembersJs += `    pinCode: ${v},\n`;
        } else if (typeof v === 'boolean') {
            teamMembersJs += `    ${k}: ${v},\n`;
        } else if (typeof v === 'string') {
            teamMembersJs += `    ${k}: '${v}',\n`;
        } else {
            teamMembersJs += `    ${k}: ${v},\n`;
        }
    }
    teamMembersJs += "  },\n";
}
teamMembersJs += "];";

content = content.replace(/export const TEAM_MEMBERS: TeamMember\[\] = \[\s*\{[\s\S]*?\}\s*\];/, teamMembersJs);

// Replace INITIAL_SHIFTS
let shiftsJs = "export const INITIAL_SHIFTS: RosterShift[] = [\n";
rawShifts.forEach((shift, i) => {
    const [sid, y, m, d, sh, sm, eh, em] = shift;
    const role = sid.includes("foh") ? "Front of House" : "Admin";
    shiftsJs += `  {
    id: 'shift-${i}',
    staffId: '${sid}',
    start: new Date(${y}, ${m}, ${d}, ${sh}, ${sm}),
    end: new Date(${y}, ${m}, ${d}, ${eh}, ${em}),
    role: '${role}'
  },\n`;
});
shiftsJs += "];";

content = content.replace(/export const INITIAL_SHIFTS: RosterShift\[\] = \[\];/, shiftsJs);

fs.writeFileSync('constants.ts', content);
console.log("Updated constants.ts");
