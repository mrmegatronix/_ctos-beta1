
export enum ViewMode {
  DAY = 'Day',
  WEEK = 'Week',
  MONTH = 'Month'
}

export type AppModule = 'dashboard' | 'calendar' | 'roster' | 'bookings' | 'stock' | 'staff' | 'suppliers' | 'maintenance' | 'socials' | 'entertainment' | 'functions' | 'finance' | 'browser' | 'documents' | 'settings' | 'recipes' | 'incidents' | 'lostfound' | 'tvschedule' | 'media' | 'timesheets' | 'stocktake' | 'ordering' | 'timeclock' | 'budgeting' | 'gemini' | 'ctsc' | 'ctmatrix' | 'contacts' | 'email' | 'menus' | 'eodsales' | 'category-hub' | 'pos';

export type AppMode = 'OFFICE' | 'FOH' | 'BOH';

export type AccessLevel = 'master-admin' | 'admin' | 'standard';

export type StaffRole = 'Master Admin' | 'Admin' | 'Duty Manager' | 'Front of House' | 'Head Chef' | 'Chef' | 'Kitchen Hand';

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  color: string;
  visible: boolean;
  role: StaffRole;
  accessLevel?: AccessLevel;
  email?: string;
  phone?: string;
  address?: string;
  pinCode: string; // 4 digit staff PIN code
  hourlyRate?: number;
  isDemo?: boolean;
}

export const isMasterAdmin = (user?: TeamMember | null): boolean => {
  if (!user) return false;
  return user.accessLevel === 'master-admin' || user.id === 'admin-nikko' || user.pinCode === '5551' || user.name.toLowerCase() === 'nikko';
};

export const isAdminOrAbove = (user?: TeamMember | null): boolean => {
  if (!user) return false;
  return isMasterAdmin(user) || user.accessLevel === 'admin' || user.role === 'Duty Manager' || user.role === 'Admin';
};

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  attendeeIds: string[];
  location?: string;
  isMeeting?: boolean;
  source?: 'local' | 'google';
  type?: 'event' | 'shift';
}

export interface RosterShift {
  id: string;
  staffId: string;
  start: Date;
  end: Date;
  role: string; 
  isDemo?: boolean;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  start: Date;
  end: Date;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
}

export interface Booking {
  id: string;
  customerName: string;
  time: Date;
  guests: number;
  table: string;
  phone: string;
  status: 'confirmed' | 'pending' | 'seated' | 'completed';
  notes?: string;
  source?: 'nowbookit' | 'phone' | 'walkin' | 'email';
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  volumeMl?: number; // Total volume in ml (e.g. 1000 for 1L bottle, 50000 for 50L keg)
  minLevel: number; 
  price: number;
  supplierId?: string;
  image?: string;
  allergens?: string[];
  description?: string;
  cost?: number;
  productType?: string;
  barcode?: string;
  expiryDate?: Date;
  location?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  address: string;
  website?: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string; 
  dueDate?: Date;
  createdAt: Date;
  isDemo?: boolean;
}

export interface EntertainmentEvent {
  id: string;
  title: string;
  type: 'Band' | 'DJ' | 'Quiz' | 'Sport';
  date: Date;
  description: string;
  performerName?: string;
  cost?: number;
  status: 'confirmed' | 'pending';
}

export interface TVScheduleItem {
  id: string;
  sport: 'Rugby' | 'League' | 'Cricket' | 'Football' | 'UFC' | 'Basketball' | 'Motorsport' | 'Other';
  match: string;
  channel: string; // e.g. Sky Sport 1
  startTime: Date;
  endTime: Date;
  isLive: boolean;
  notes?: string; // e.g. "Big Screen - Sound On"
}

export interface FunctionBooking {
  id: string;
  eventName: string;
  clientName: string;
  date: Date;
  guests: number;
  area: 'Private Room' | 'Garden' | 'Main Bar';
  depositPaid: boolean;
  requirements: string[]; 
  status: 'enquiry' | 'confirmed' | 'completed';
}

export interface CashUpRecord {
  id: string;
  date: Date;
  staffId: string;
  floatStart: number;
  eftposTotal: number;
  cashTotal: number;
  payouts: number; 
  expectedTotal: number;
  variance: number; 
  notes?: string;
}

export interface Invoice {
  id: string;
  supplierName: string;
  date: Date;
  amount: number;
  type: 'invoice' | 'delivery';
  reference: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'paid';
}

export interface BrowserBookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'doc' | 'sheet' | 'image';
  parentId: string | null;
  size?: string;
  lastModified: Date;
}

export interface Recipe {
  id: string;
  name: string;
  category: 'Cocktail' | 'Food' | 'Coffee' | 'Prep';
  ingredients: string[];
  method: string;
  allergens?: string[];
  glassware?: string;
  garnish?: string;
  image?: string;
}

export interface IncidentReport {
  id: string;
  date: Date;
  staffId: string;
  type: 'Intoxication' | 'Aggression' | 'Injury' | 'Theft' | 'Other';
  description: string;
  actionTaken: string;
  witnesses?: string;
  policeCalled: boolean;
}

export interface LostItem {
  id: string;
  dateFound: Date;
  itemDescription: string;
  locationFound: string;
  foundByStaffId: string;
  status: 'unclaimed' | 'returned' | 'disposed';
  customerName?: string;
  contactDetails?: string;
}

export interface IntegrationConfig {
  tevalis: { connected: boolean; apiKey?: string; siteId?: string; };
  nowBookIt: { connected: boolean; apiKey?: string; venueId?: string; };
  google: { connected: boolean; };
}

export interface AIResponse {
  suggestedEvents?: Partial<CalendarEvent>[];
  message: string;
  actions?: 'CREATE' | 'UPDATE' | 'DELETE' | 'NONE';
  relatedEventId?: string;
}

export interface TimeSlot {
  hour: number;
  label: string;
}

export interface MediaSlide {
  id: string;
  name: string;
  url: string;
  type: 'weather' | 'slides' | 'chase-the-ace' | 'billboard';
  isActive: boolean;
  isDemo?: boolean;
}

export interface TimesheetEntry {
  id: string;
  staffId: string;
  date: Date;
  hoursWorked: number;
  notes?: string;
  isVerified: boolean;
  isDemo?: boolean;
}

export interface StocktakeSession {
  id: string;
  date: Date;
  staffId: string;
  status: 'draft' | 'completed';
  items: { stockId: string; expected: number; actual: number; variance: number }[];
  isDemo?: boolean;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  date: Date;
  status: 'draft' | 'sent' | 'received';
  items: { stockId: string; quantity: number; unitPrice: number }[];
  total: number;
  isDemo?: boolean;
}

export interface TimePunch {
  id: string;
  staffId: string;
  type: 'clock-in' | 'start-break' | 'end-break' | 'clock-out';
  timestamp: Date;
  isDemo?: boolean;
}

export interface BudgetTracker {
  id: string;
  period: string; // e.g., '2026-06'
  targetRevenue: number;
  targetCogs: number;
  targetLabour: number;
  actualRevenue: number;
  actualCogs: number;
  actualLabour: number;
  isDemo?: boolean;
}

// Add isDemo to existing interfaces where needed
export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  color: string;
  visible: boolean;
  role: StaffRole;
  email?: string;
  phone?: string;
  address?: string;
  pinCode: string;
  hourlyRate?: number;
  isDemo?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  attendeeIds: string[];
  location?: string;
  isMeeting?: boolean;
  source?: 'local' | 'google';
  type?: 'event' | 'shift';
  isDemo?: boolean;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  volumeMl?: number; // Total volume in ml (e.g. 1000 for 1L bottle, 50000 for 50L keg)
  minLevel: number; 
  price: number;
  supplierId?: string;
  image?: string;
  allergens?: string[];
  description?: string;
  cost?: number;
  productType?: string;
  isDemo?: boolean;
  barcode?: string;
  expiryDate?: Date;
  location?: string;
}

export interface StockMovement {
  id: string;
  stockId: string;
  date: Date;
  quantityChanged: number; // positive for addition, negative for consumption
  type: 'consume' | 'purchase' | 'inventory-correction' | 'transfer';
  staffId: string;
  notes?: string;
  isDemo?: boolean;
}

export interface Booking {
  id: string;
  customerName: string;
  time: Date;
  guests: number;
  table: string;
  phone: string;
  status: 'confirmed' | 'pending' | 'seated' | 'completed';
  notes?: string;
  source?: 'nowbookit' | 'phone' | 'walkin' | 'email';
  isDemo?: boolean;
}


export type Denominations = '100' | '50' | '20' | '10' | '5' | '2' | '1' | '0.5' | '0.2' | '0.1';

export type DenominationCounts = {
  [key in Denominations]: number;
};

export interface TillCounts {
  open: DenominationCounts;
  close: DenominationCounts;
}

export interface TillReconciliation {
  expectedFloat: number;
  counts: TillCounts;
}

export interface SafeCounts {
  denominations: DenominationCounts;
  looseNotes: number;
  looseCoins: number;
  pettyCash: number;
  hoppers?: number;
  gamingTill?: number;
  banking?: number;
}

export interface DetailedCashUpRecord {
  id: string;
  date: string; // ISO date
  tills: {
    fb1: TillReconciliation;
    fb2: TillReconciliation;
    fb3: TillReconciliation;
    gaming: TillReconciliation;
    tab: TillReconciliation;
    crt: TillReconciliation;
  };
  safes: {
    officeOpen: { counts: SafeCounts, float: number, expectedTotal: number };
    gaming: { counts: SafeCounts, float: number, expectedTotal: number };
    tabOffice: { counts: SafeCounts, float: number, expectedTotal: number };
  };
  notes: {
    day: string;
    night: string;
  };
}

export interface Allergen {
  id: string;
  name: string;
  icon?: string;
}

export const STANDARD_ALLERGENS: Allergen[] = [
  { id: 'dairy', name: 'Dairy' },
  { id: 'eggs', name: 'Eggs' },
  { id: 'nuts', name: 'Tree Nuts' },
  { id: 'peanuts', name: 'Peanuts' },
  { id: 'shellfish', name: 'Shellfish' },
  { id: 'fish', name: 'Fish' },
  { id: 'soy', name: 'Soy' },
  { id: 'wheat', name: 'Wheat/Gluten' },
  { id: 'sesame', name: 'Sesame' }
];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  allergens: string[]; // array of allergen IDs
  isAvailable: boolean;
  stockItemId?: string; // ID of the StockItem to deduct from
  deductionMl?: number; // Amount to deduct (e.g., 15 for 15ml, 425 for Pint)
  isDemo?: boolean;
}

export interface Menu {
  id: string;
  title: string;
  items: MenuItem[];
  isActive: boolean;
  isDemo?: boolean;
}

export interface EODSalesData {
  id: string;
  date: Date;
  staffId: string;
  itemsSold: { stockId: string; quantity: number }[];
  isDemo?: boolean;
}
