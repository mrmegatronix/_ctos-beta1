
import { TeamMember, CalendarEvent, RosterShift, Booking, StockItem, Supplier, MaintenanceTask, EntertainmentEvent, FunctionBooking, CashUpRecord, FileItem, LeaveRequest, Invoice, Recipe, IncidentReport, LostItem, TVScheduleItem } from './types';
import { addDays, getStartOfWeek } from './utils';

// --- STAFF CONFIGURATION ---
export const TEAM_MEMBERS: TeamMember[] = [
  { 
    id: 'rob', name: 'Robert', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert', color: 'slate', visible: true,
    role: 'Duty Manager', email: 'robert@coasters.com', phone: '021 555 0101', address: '12 Seaside Ave', pinCode: '11' 
  },
  { 
    id: 'bia', name: 'Bianca', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bianca', color: 'rose', visible: true,
    role: 'Duty Manager', email: 'bianca@coasters.com', phone: '021 555 0102', address: '45 Hill St', pinCode: '22'
  },
  { 
    id: 'nic', name: 'Nicole', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nicole', color: 'emerald', visible: true,
    role: 'Duty Manager', email: 'nicole@coasters.com', phone: '021 555 0103', address: '88 Broadway', pinCode: '33'
  },
  { 
    id: 'nik', name: 'Nikko', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nikko', color: 'amber', visible: true,
    role: 'Admin', email: 'nikko@coasters.com', phone: '021 555 0104', address: '23 Quay St', pinCode: '6983'
  },
  { 
    id: 'edd', name: 'Eddie', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eddie', color: 'blue', visible: true,
    role: 'Front of House', email: 'eddie@coasters.com', phone: '021 555 0105', address: '56 Park Rd', pinCode: '55'
  },
  { 
    id: 'jes', name: 'Jess', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jess', color: 'violet', visible: true,
    role: 'Front of House', email: 'jess@coasters.com', phone: '021 555 0106', address: '99 High St', pinCode: '66'
  },
  { 
    id: 'rac', name: 'Racheal', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Racheal', color: 'pink', visible: true,
    role: 'Front of House', email: 'racheal@coasters.com', phone: '021 555 0107', address: '101 Main Rd', pinCode: '77'
  },
  { 
    id: 'car', name: 'Carma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carma', color: 'orange', visible: true,
    role: 'Front of House', email: 'carma@coasters.com', phone: '021 555 0108', address: '77 Beach Rd', pinCode: '88'
  },
];

// --- ROSTER GENERATION ---
const today = new Date();
const currentWeekStart = getStartOfWeek(today); // Returns Monday

const createShift = (
  weekOffset: number, // 0 for current week, 1 for next week
  dayIndex: number,   // 0=Mon, 1=Tue...
  staffId: string, 
  startTime: string,  // "HH.MM" or "HH:MM"
  endTime: string,    // "HH.MM" or "HH:MM" or "Close" or "X"
  role: string = 'FOH'
): RosterShift | null => {
  if (startTime === 'X' || endTime === 'X' || !startTime) return null;

  const parseTime = (t: string) => {
    if (t.toLowerCase().includes('close')) return { h: 23, m: 30 }; // Assume close is 11:30 PM
    const clean = t.replace(':', '.');
    const [h, m] = clean.split('.').map(Number);
    return { h: h || 0, m: m || 0 };
  };

  const startT = parseTime(startTime);
  const endT = parseTime(endTime);

  // Calculate the specific date
  const shiftDate = addDays(currentWeekStart, (weekOffset * 7) + dayIndex);
  
  const start = new Date(shiftDate);
  start.setHours(startT.h, startT.m, 0, 0);

  const end = new Date(shiftDate);
  end.setHours(endT.h, endT.m, 0, 0);
  
  // Handle overnight shifts
  if (endT.h < startT.h) {
      end.setDate(end.getDate() + 1);
  }

  return {
    id: `shift-${weekOffset}-${dayIndex}-${staffId}`,
    staffId,
    start,
    end,
    role
  };
};

const rawRosterData = [
  // WEEK 1 (Ending 15th)
  // Robert
  { w: 0, d: 1, id: 'rob', s: '12.00', e: '22.00', role: 'Duty Manager' },
  { w: 0, d: 2, id: 'rob', s: '12.00', e: '23.00', role: 'Duty Manager' },
  { w: 0, d: 3, id: 'rob', s: '13.00', e: '23.00', role: 'Duty Manager' },
  { w: 0, d: 4, id: 'rob', s: '12.00', e: '19.00', role: 'Duty Manager' },
  { w: 0, d: 5, id: 'rob', s: '12.00', e: '19.00', role: 'Duty Manager' },
  { w: 0, d: 6, id: 'rob', s: '12.00', e: '16.00', role: 'Duty Manager' },

  // Bianca
  { w: 0, d: 0, id: 'bia', s: '08.30', e: '16.00', role: 'Duty Manager' },
  { w: 0, d: 1, id: 'bia', s: '16.00', e: '22.00', role: 'Duty Manager' },
  { w: 0, d: 2, id: 'bia', s: '08.30', e: '14.00', role: 'Duty Manager' },
  { w: 0, d: 3, id: 'bia', s: '08.30', e: '16.00', role: 'Duty Manager' },
  { w: 0, d: 4, id: 'bia', s: '08.30', e: '16.00', role: 'Duty Manager' },

  // Nicole
  { w: 0, d: 0, id: 'nic', s: '15.00', e: '21.00', role: 'Duty Manager' },
  { w: 0, d: 1, id: 'nic', s: '08.30', e: '14.00', role: 'Duty Manager' },
  { w: 0, d: 2, id: 'nic', s: '16.00', e: '23.00', role: 'Duty Manager' },
  { w: 0, d: 4, id: 'nic', s: '08.30', e: '16.00', role: 'Duty Manager' }, // Image shows Fri 8.30-16.00
  { w: 0, d: 5, id: 'nic', s: '08.30', e: '17.00', role: 'Duty Manager' },
  { w: 0, d: 6, id: 'nic', s: '08.30', e: '16.30', role: 'Duty Manager' },

  // Nikko
  { w: 0, d: 2, id: 'nik', s: '17.00', e: '23.00', role: 'Admin' },
  { w: 0, d: 3, id: 'nik', s: '16.00', e: '23.00', role: 'Admin' },
  { w: 0, d: 4, id: 'nik', s: '16.00', e: '23.00', role: 'Admin' },
  { w: 0, d: 5, id: 'nik', s: '16.00', e: '00.00', role: 'Admin' },
  { w: 0, d: 6, id: 'nik', s: '16.00', e: '21.30', role: 'Admin' },

  // Eddie
  { w: 0, d: 0, id: 'edd', s: '16.30', e: '21.00' },
  { w: 0, d: 4, id: 'edd', s: '17.00', e: '23.00' },
  { w: 0, d: 5, id: 'edd', s: '17.00', e: '00.00' },
  { w: 0, d: 6, id: 'edd', s: '16.00', e: '21.30' },

  // Carma
  { w: 0, d: 2, id: 'car', s: '17.00', e: '22.00' },
  { w: 0, d: 3, id: 'car', s: '17.00', e: 'Close' },
  { w: 0, d: 4, id: 'car', s: '17.00', e: '21.30' },
  { w: 0, d: 5, id: 'car', s: '17.30', e: '21.30' },
  { w: 0, d: 6, id: 'car', s: '17.00', e: 'Close' },
];

export const INITIAL_SHIFTS: RosterShift[] = rawRosterData
  .map(data => createShift(data.w, data.d, data.id, data.s, data.e, data.role))
  .filter((s): s is RosterShift => s !== null);

export const INITIAL_LEAVE: LeaveRequest[] = [];

// --- OTHER INITIAL DATA ---

const setTime = (d: Date, h: number, m: number) => {
  const newDate = new Date(d);
  newDate.setHours(h, m, 0, 0);
  return newDate;
};

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Manager Meeting',
    start: setTime(today, 10, 0),
    end: setTime(today, 11, 0),
    attendeeIds: ['rob', 'bia'],
    description: 'Weekly sync.',
    isMeeting: true,
    type: 'event'
  },
  {
    id: 'e2',
    title: 'Supply Delivery',
    start: setTime(today, 9, 30),
    end: setTime(today, 10, 0),
    attendeeIds: ['nic'],
    description: 'Beverage delivery check-in.',
    isMeeting: false,
    type: 'event'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', customerName: 'John Smith', time: setTime(today, 19, 0), guests: 4, table: 'T4', phone: '555-0001', status: 'confirmed' },
  { id: 'b2', customerName: 'Alice Wong', time: setTime(today, 19, 30), guests: 2, table: 'T2', phone: '555-0002', status: 'seated' },
  { id: 'b3', customerName: 'Bob Jones', time: setTime(today, 20, 0), guests: 6, table: 'T8', phone: '555-0003', status: 'pending' },
];

// --- RAW PRODUCT CSV DATA ---
const RAW_PRODUCT_CSV = `ProductID,ProductType,ProductGroup,ProductName,ProductName2,PriceBand,PriceGroup,VATRate,Measure,CostPricePerSKU,GrossSellPrice,BarCode,PLU,PLU2,SKUName,BINNumber,KPText,CommissionPercentage,AllowZeroPrice,UseStandardVAT,AwardCRMPoints,ChargePerMinute,ExcludeFromReceipt,PromptForDescription,SellByWeight,ServiceChargeExempt,PrintToKPStandalone,IsMain,ProductInfo,RezlynxCode,MeasureCostPricePerSKU,ProhibitSalesWhenUnderStocked,IsUseBatchSales,CookTimeSeconds,ShelfLifeSeconds,IsDisplayAfterProduced,IsBatchSalesProduceOnSale,AlcoholPercent,UnitVolume,AllowDiscount,ItemCookCount,SelfServiceFood,SelfServiceDrink,IsChooseLater,KP1,KP2,KP3,KP4,KP5,KP6,KP7,KP8,KP9,KP10,KP11,KP12,KP13,KP14,KP15,KP16,HideMeasureShortNameFromReceipt,ThirdPartyCRMPointsValue,ExtraReceiptText,CRMPointsValue,IsAvailableThroughTevalisAPI,IsAlcohol,CRMCode,ReportCategory,Region,Vintage,StockWarningLevel
1816,Beverage,Aperitif,Aperol,,Master Price Band,Standard,GST,15ml,0,11,,,,,0,,0,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,,,-1,TRUE,FALSE,0,0,FALSE,FALSE,0,0,TRUE,1,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,0,,1,FALSE,FALSE,,Not Set,,,1`;

const parseStockFromCSV = (csv: string): StockItem[] => {
  const lines = csv.trim().split('\n');
  const items: StockItem[] = [];
  
  // Skip header, iterate through lines
  for (let i = 1; i < lines.length; i++) {
     const line = lines[i];
     if (!line.trim()) continue;
     
     // Split CSV respecting simple values (provided CSV is clean enough or has complex quotes handled simply here)
     // Since the data format is consistent, we'll use a regex that matches quoted strings or non-comma sequences
     const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.trim().replace(/^"|"$/g, ''));
     
     if (cols.length < 10) continue; // Skip malformed lines

     const productId = cols[0];
     const category = cols[2];
     const name = cols[3];
     const unit = cols[8];
     const price = Math.max(0, parseFloat(cols[10]) || 0); // Handle -1 prices by setting to 0
     // Try to get minLevel from the very last column if it exists and is a number
     const lastCol = cols[cols.length - 1];
     const minLevel = parseInt(lastCol) || 0; 
     
     // Generate unique ID based on ProductID + Unit (e.g. 1816-15ml)
     const safeUnit = unit.replace(/[^a-zA-Z0-9]/g, '');
     const id = `${productId}-${safeUnit}`;

     items.push({
         id,
         name,
         category,
         quantity: 0, // Reset stock to 0
         unit,
         minLevel,
         price
     });
  }
  return items;
};

export const INITIAL_STOCK: StockItem[] = parseStockFromCSV(RAW_PRODUCT_CSV);

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Gourmet Foods Ltd', contactPerson: 'Dave Green', email: 'orders@gourmetfoods.com', phone: '021 555 9901', category: 'Food', address: '12 Farm Rd, Industrial Park' },
  { id: 'sup2', name: 'City Bevvies Distributors', contactPerson: 'Sarah Stout', email: 'sales@citybevvies.com', phone: '021 555 9902', category: 'Beverage', address: '88 Brewery Lane, City' },
  { id: 'sup3', name: 'Sparkle Industrial Cleaners', contactPerson: 'Jim Shine', email: 'info@sparkle.com', phone: '021 555 9903', category: 'Cleaning', address: '42 Soap Ln, Suburbia' },
  { id: 'sup4', name: 'Tech Solutions POS', contactPerson: 'Support Team', email: 'support@techsol.com', phone: '0800 555 123', category: 'Technology', address: 'Online / Remote' }
];

export const INITIAL_MAINTENANCE: MaintenanceTask[] = [
  { id: 'm1', title: 'Fix Walk-in Freezer Handle', description: 'The handle is loose and hard to open from the inside.', status: 'in-progress', priority: 'high', createdAt: addDays(today, -2) },
  { id: 'm2', title: 'Replace Lightbulb in Ladies Room', description: 'Third stall light is flickering constantly.', status: 'pending', priority: 'low', createdAt: addDays(today, -5) },
  { id: 'm3', title: 'Service Espresso Machine', description: 'Routine 6-month service required. Call technician.', status: 'pending', priority: 'medium', dueDate: addDays(today, 7), createdAt: today },
  { id: 'm4', title: 'Deep Clean Grease Trap', description: 'Monthly scheduled cleaning.', status: 'completed', priority: 'medium', dueDate: addDays(today, -1), createdAt: addDays(today, -10) }
];

export const INITIAL_ENTERTAINMENT: EntertainmentEvent[] = [
  { id: 'ent1', title: 'Live Music: The Rollers', type: 'Band', date: setTime(today, 20, 0), description: 'Local rock cover band.', performerName: 'The Rollers', cost: 450, status: 'confirmed' },
  { id: 'ent2', title: 'Tuesday Trivia', type: 'Quiz', date: setTime(addDays(today, 1), 19, 0), description: 'Weekly pub quiz hosted by Mike.', performerName: 'Mike Quizmaster', cost: 150, status: 'confirmed' },
  { id: 'ent3', title: 'Rugby Final', type: 'Sport', date: setTime(addDays(today, 5), 19, 30), description: 'Live on big screen.', status: 'confirmed' }
];

export const INITIAL_FUNCTIONS: FunctionBooking[] = [
  { id: 'f1', eventName: 'Sarah\'s 21st', clientName: 'Sarah Connor', date: setTime(addDays(today, 5), 18, 0), guests: 45, area: 'Private Room', depositPaid: true, requirements: ['Set Menu B', 'Balloon Arch'], status: 'confirmed' },
  { id: 'f2', eventName: 'Corporate Lunch', clientName: 'Tech Corp', date: setTime(addDays(today, 3), 12, 0), guests: 12, area: 'Main Bar', depositPaid: false, requirements: ['Tab Limit $500'], status: 'enquiry' }
];

export const INITIAL_FINANCE: CashUpRecord[] = [
  { id: 'fin1', date: addDays(today, -1), staffId: 'rob', floatStart: 500, eftposTotal: 2450.50, cashTotal: 840.00, payouts: 50.00, expectedTotal: 3740.50, variance: -10.00, notes: 'Missing $10 from Till 2' },
  { id: 'fin2', date: addDays(today, -2), staffId: 'bia', floatStart: 500, eftposTotal: 1890.00, cashTotal: 620.00, payouts: 0, expectedTotal: 3010.00, variance: 0, notes: 'Balanced perfectly.' }
];

export const INITIAL_INVOICES: Invoice[] = [
    { id: 'inv-1', supplierName: 'Gourmet Foods Ltd', date: addDays(today, -2), amount: 1250.50, type: 'invoice', reference: 'INV-9921', status: 'paid' },
    { id: 'inv-2', supplierName: 'City Bevvies', date: today, amount: 890.00, type: 'delivery', reference: 'DEL-442', status: 'pending' }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'r1',
    name: 'Spicy Margarita',
    category: 'Cocktail',
    ingredients: ['45ml Tequila Reposado', '15ml Triple Sec', '30ml Lime Juice', '15ml Agave Syrup', '2 Jalapeno slices'],
    method: 'Muddle jalapeno in shaker. Add liquids and ice. Shake until chilled. Double strain into rocks glass with ice. Garnish with fresh jalapeno slice.',
    glassware: 'Rocks',
    garnish: 'Jalapeno Slice + Chili Salt Rim',
    image: 'https://images.unsplash.com/photo-1570598912132-0ba1dc952b7d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'r2',
    name: 'Classic Beef Burger',
    category: 'Food',
    ingredients: ['1x Brioche Bun', '1x 180g Beef Pattie', '1 slice Swiss Cheese', 'Lettuce', 'Tomato', 'Pickles', 'House Burger Sauce'],
    method: 'Toast bun. Grill pattie to medium-well. Melt cheese on pattie. Assemble: Base, Sauce, Lettuce, Tomato, Pattie, Cheese, Pickles, Lid.',
    allergens: ['Gluten', 'Dairy', 'Egg', 'Mustard'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400'
  }
];

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc1',
    date: addDays(today, -2),
    staffId: 'rob',
    type: 'Intoxication',
    description: 'Male patron in blue shirt showed signs of intoxication (slurred speech, stumbling). Refused service at 9:30 PM.',
    actionTaken: 'Offered water and called a taxi. Customer left peacefully.',
    policeCalled: false
  }
];

export const INITIAL_LOST_FOUND: LostItem[] = [
  {
    id: 'lf1',
    dateFound: addDays(today, -1),
    itemDescription: 'Black Umbrella',
    locationFound: 'Under Table 4',
    foundByStaffId: 'edd',
    status: 'unclaimed'
  },
  {
    id: 'lf2',
    dateFound: addDays(today, -5),
    itemDescription: 'iPhone 13 with pink case',
    locationFound: 'Ladies Bathroom',
    foundByStaffId: 'nic',
    status: 'returned',
    customerName: 'Sarah J.',
    contactDetails: 'Returned 14/12'
  }
];

export const INITIAL_TV_SCHEDULE: TVScheduleItem[] = [
  {
    id: 'tv1',
    sport: 'League',
    match: 'Warriors vs Broncos',
    channel: 'Sky Sport 4',
    startTime: setTime(today, 18, 0),
    endTime: setTime(today, 20, 0),
    isLive: true,
    notes: 'Sound On - Main Screen'
  },
  {
    id: 'tv2',
    sport: 'Rugby',
    match: 'Blues vs Crusaders',
    channel: 'Sky Sport 1',
    startTime: setTime(today, 19, 5),
    endTime: setTime(today, 21, 0),
    isLive: true,
    notes: 'Garden Bar TV'
  },
  {
    id: 'tv3',
    sport: 'Cricket',
    match: 'Black Caps vs Australia (T20)',
    channel: 'Sky Sport 2',
    startTime: setTime(today, 14, 0),
    endTime: setTime(today, 17, 30),
    isLive: true
  },
  {
    id: 'tv4',
    sport: 'UFC',
    match: 'UFC 300 Prelims',
    channel: 'Sky Sport Select',
    startTime: setTime(addDays(today, 1), 11, 0),
    endTime: setTime(addDays(today, 1), 15, 0),
    isLive: true,
    notes: 'Booking for Table 4 wants this'
  }
];

export const SOCIAL_LINKS = [
  { platform: 'Instagram', handle: '@coasters_tavern', url: 'https://instagram.com' },
  { platform: 'Facebook', handle: 'Coasters Tavern', url: 'https://facebook.com' },
  { platform: 'Website', handle: 'www.coasterstavern.com', url: 'https://coasterstavern.com' },
  { platform: 'TripAdvisor', handle: 'Coasters Tavern Reviews', url: 'https://tripadvisor.com' },
];

export const HOURS: number[] = Array.from({ length: 24 }, (_, i) => i);

export const INITIAL_FILES: FileItem[] = [
  // Folders
  { id: 'fld-1', name: 'Rosters', type: 'folder', parentId: null, lastModified: new Date() },
  { id: 'fld-2', name: 'Staff List', type: 'folder', parentId: null, lastModified: new Date() },
  { id: 'fld-3', name: 'Document Templates', type: 'folder', parentId: null, lastModified: new Date() },
  { id: 'fld-4', name: 'Band Lists', type: 'folder', parentId: null, lastModified: new Date() },
  
  // Files inside Rosters
  { id: 'fil-1', name: 'Dec_2023_Roster.pdf', type: 'pdf', parentId: 'fld-1', size: '1.2 MB', lastModified: new Date() },
  
  // Files inside Staff List
  { id: 'fil-2', name: 'Staff_Contacts_2024.sheet', type: 'sheet', parentId: 'fld-2', size: '45 KB', lastModified: new Date() },
  
  // Files inside Templates
  { id: 'fil-3', name: 'Incident_Report_Form.doc', type: 'doc', parentId: 'fld-3', size: '250 KB', lastModified: new Date() },
  { id: 'fil-4', name: 'Leave_Request.doc', type: 'doc', parentId: 'fld-3', size: '180 KB', lastModified: new Date() },
  
  // Files inside Band Lists
  { id: 'fil-5', name: 'The_Rollers_Setlist.pdf', type: 'pdf', parentId: 'fld-4', size: '2.5 MB', lastModified: new Date() },
];
