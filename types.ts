
export enum ViewMode {
  DAY = 'Day',
  WEEK = 'Week',
  MONTH = 'Month'
}

export type AppModule = 'dashboard' | 'calendar' | 'roster' | 'bookings' | 'stock' | 'staff' | 'suppliers' | 'maintenance' | 'socials' | 'entertainment' | 'functions' | 'finance' | 'browser' | 'documents' | 'settings' | 'recipes' | 'incidents' | 'lostfound' | 'tvschedule' | 'media' | 'timesheets';

export type AppMode = 'OFFICE' | 'FOH' | 'BOH';

export type StaffRole = 'Admin' | 'Duty Manager' | 'Front of House' | 'Head Chef' | 'Chef' | 'Kitchen Hand';

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
  pinCode: string; // 2 digit login code
}

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
  source?: 'nowbookit' | 'phone' | 'walkin';
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minLevel: number; 
  price: number;
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
  minLevel: number; 
  price: number;
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
  source?: 'nowbookit' | 'phone' | 'walkin';
  isDemo?: boolean;
}
