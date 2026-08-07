
import { firestore } from './firebase';
import {
  collection, doc, getDocs, setDoc, deleteDoc, writeBatch, getDoc
} from 'firebase/firestore';
import { TeamMember, RosterShift, StockItem, Booking, Supplier, MaintenanceTask, CalendarEvent, EntertainmentEvent, FunctionBooking, CashUpRecord, BrowserBookmark, IntegrationConfig, FileItem, LeaveRequest, Invoice, Recipe, IncidentReport, LostItem, TVScheduleItem, StocktakeSession, PurchaseOrder, TimePunch, BudgetTracker } from '../types';
import { INITIAL_EVENTS, INITIAL_SHIFTS, INITIAL_STOCK, INITIAL_BOOKINGS, INITIAL_SUPPLIERS, INITIAL_MAINTENANCE, INITIAL_ENTERTAINMENT, INITIAL_FUNCTIONS, INITIAL_FINANCE, TEAM_MEMBERS, INITIAL_FILES, INITIAL_LEAVE, INITIAL_INVOICES, INITIAL_RECIPES, INITIAL_INCIDENTS, INITIAL_LOST_FOUND, INITIAL_TV_SCHEDULE, INITIAL_STOCKTAKES, INITIAL_ORDERS, INITIAL_TIME_PUNCHES, INITIAL_BUDGETS } from '../constants';

// This service uses Firebase Firestore as the backend database.
// Each collection maps to a Firestore collection.

const DB_VERSION = '2.3';

// Firestore collection names
const COLLECTIONS = {
  META: '_meta',
  STAFF: 'staff',
  EVENTS: 'events',
  SHIFTS: 'shifts',
  LEAVE: 'leaveRequests',
  STOCK: 'stock',
  BOOKINGS: 'bookings',
  SUPPLIERS: 'suppliers',
  MAINTENANCE: 'maintenance',
  ENTERTAINMENT: 'entertainment',
  FUNCTIONS: 'functions',
  FINANCE: 'finance',
  INVOICES: 'invoices',
  BOOKMARKS: 'bookmarks',
  INTEGRATIONS: 'integrations',
  FILES: 'files',
  RECIPES: 'recipes',
  INCIDENTS: 'incidents',
  LOSTFOUND: 'lostfound',
  TV_SCHEDULE: 'tvSchedule',
  STOCKTAKES: 'stocktakes',
  ORDERS: 'orders',
  TIMEPUNCHES: 'timepunches',
  BUDGETS: 'budgets',
};

// Helper: convert Firestore Timestamps or ISO strings back to Dates
const reviveDates = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object' && obj.toDate && typeof obj.toDate === 'function') {
    return obj.toDate(); // Firestore Timestamp → JS Date
  }
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(obj)) {
    return new Date(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }
  if (typeof obj === 'object') {
    const out: any = {};
    for (const key of Object.keys(obj)) {
      out[key] = reviveDates(obj[key]);
    }
    return out;
  }
  return obj;
};

// Helper: convert Dates to ISO strings for Firestore storage
const prepareDates = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(prepareDates);
  }
  if (typeof obj === 'object') {
    const out: any = {};
    for (const key of Object.keys(obj)) {
      out[key] = prepareDates(obj[key]);
    }
    return out;
  }
  return obj;
};

class DatabaseService {
  private _initialized = false;

  async init(): Promise<void> {
    if (this._initialized) return;

    // Check version doc to decide if we need to seed
    const metaRef = doc(firestore, COLLECTIONS.META, 'version');
    const metaSnap = await getDoc(metaRef);

    if (!metaSnap.exists() || metaSnap.data()?.version !== DB_VERSION) {
      console.log('[CTOS DB] Seeding Firestore with initial data...');
      await this.seed();
      await setDoc(metaRef, { version: DB_VERSION });
      console.log('[CTOS DB] Seed complete.');
    }

    this._initialized = true;
  }

  private async seed(): Promise<void> {
    // Batch writes in groups of 500 (Firestore limit)
    const seedCollection = async <T extends { id: string }>(
      collectionName: string,
      items: T[]
    ) => {
      // Delete existing docs first
      const existing = await getDocs(collection(firestore, collectionName));
      if (!existing.empty) {
        const delBatch = writeBatch(firestore);
        existing.docs.forEach(d => delBatch.delete(d.ref));
        await delBatch.commit();
      }

      // Write in batches of 450 to stay under the 500 limit
      for (let i = 0; i < items.length; i += 450) {
        const batch = writeBatch(firestore);
        const chunk = items.slice(i, i + 450);
        chunk.forEach(item => {
          const ref = doc(firestore, collectionName, item.id);
          batch.set(ref, prepareDates({ ...item }));
        });
        await batch.commit();
      }
    };

    await seedCollection(COLLECTIONS.STAFF, TEAM_MEMBERS);
    await seedCollection(COLLECTIONS.EVENTS, INITIAL_EVENTS);
    await seedCollection(COLLECTIONS.SHIFTS, INITIAL_SHIFTS);
    await seedCollection(COLLECTIONS.STOCK, INITIAL_STOCK);
    await seedCollection(COLLECTIONS.BOOKINGS, INITIAL_BOOKINGS);
    await seedCollection(COLLECTIONS.SUPPLIERS, INITIAL_SUPPLIERS);
    await seedCollection(COLLECTIONS.MAINTENANCE, INITIAL_MAINTENANCE);
    await seedCollection(COLLECTIONS.ENTERTAINMENT, INITIAL_ENTERTAINMENT);
    await seedCollection(COLLECTIONS.FUNCTIONS, INITIAL_FUNCTIONS);
    await seedCollection(COLLECTIONS.FINANCE, INITIAL_FINANCE);
    await seedCollection(COLLECTIONS.INVOICES, INITIAL_INVOICES);
    await seedCollection(COLLECTIONS.FILES, INITIAL_FILES);
    await seedCollection(COLLECTIONS.RECIPES, INITIAL_RECIPES);
    await seedCollection(COLLECTIONS.INCIDENTS, INITIAL_INCIDENTS);
    await seedCollection(COLLECTIONS.LOSTFOUND, INITIAL_LOST_FOUND);
    await seedCollection(COLLECTIONS.TV_SCHEDULE, INITIAL_TV_SCHEDULE);
    await seedCollection(COLLECTIONS.STOCKTAKES, INITIAL_STOCKTAKES);
    await seedCollection(COLLECTIONS.ORDERS, INITIAL_ORDERS);
    await seedCollection(COLLECTIONS.TIMEPUNCHES, INITIAL_TIME_PUNCHES);
    await seedCollection(COLLECTIONS.BUDGETS, INITIAL_BUDGETS);

    // Seed leave (may be empty array)
    if (INITIAL_LEAVE.length > 0) {
      await seedCollection(COLLECTIONS.LEAVE, INITIAL_LEAVE);
    }

    // Seed bookmarks (these don't follow the same pattern — use id field)
    const bookmarks = [
      { id: 'b1', title: 'Tevalis POS', url: 'https://www.tevalis.com/login', icon: 'monitor' },
      { id: 'b2', title: 'NowBookIt', url: 'https://admin.nowbookit.com', icon: 'calendar' },
      { id: 'b3', title: 'Google Calendar', url: 'https://calendar.google.com', icon: 'google' },
    ];
    await seedCollection(COLLECTIONS.BOOKMARKS, bookmarks);

    // Seed integrations as a single doc
    await setDoc(doc(firestore, COLLECTIONS.INTEGRATIONS, 'config'), {
      tevalis: { connected: true, siteId: 'CT-001' },
      nowBookIt: { connected: true, venueId: 'VN-992' },
      google: { connected: true },
    });
  }

  // --- Generic helpers with offline localStorage fallback ---

  private getLocalKey(collectionName: string): string {
    return `ctos_db_${collectionName}`;
  }

  private loadLocal<T>(collectionName: string): T[] {
    try {
      const raw = localStorage.getItem(this.getLocalKey(collectionName));
      if (!raw) return [];
      return reviveDates(JSON.parse(raw)) as T[];
    } catch (e) {
      console.warn(`[CTOS DB] Local read error for ${collectionName}:`, e);
      return [];
    }
  }

  private saveLocal<T extends { id: string }>(collectionName: string, items: T[]): void {
    try {
      localStorage.setItem(this.getLocalKey(collectionName), JSON.stringify(prepareDates(items)));
    } catch (e) {
      console.warn(`[CTOS DB] Local write error for ${collectionName}:`, e);
    }
  }

  private async loadCollection<T extends { id: string }>(collectionName: string): Promise<T[]> {
    try {
      const snap = await getDocs(collection(firestore, collectionName));
      if (!snap.empty) {
        const items = snap.docs.map(d => reviveDates({ id: d.id, ...d.data() }) as T);
        this.saveLocal(collectionName, items);
        return items;
      }
    } catch (err) {
      console.warn(`[CTOS DB] Firestore read failed for ${collectionName}, falling back to local storage:`, err);
    }
    return this.loadLocal<T>(collectionName);
  }

  private async upsert<T extends { id: string }>(
    collectionName: string,
    item: T
  ): Promise<void> {
    // Update local immediately
    const current = this.loadLocal<T>(collectionName);
    const index = current.findIndex(i => i.id === item.id);
    if (index >= 0) {
      current[index] = item;
    } else {
      current.push(item);
    }
    this.saveLocal(collectionName, current);

    // Try persisting to Firestore
    try {
      const ref = doc(firestore, collectionName, item.id);
      await setDoc(ref, prepareDates({ ...item }));
    } catch (err) {
      console.warn(`[CTOS DB] Firestore upsert failed for ${collectionName}/${item.id}:`, err);
    }
  }

  private async removeDoc(collectionName: string, id: string): Promise<void> {
    // Remove from local immediately
    const current = this.loadLocal<{ id: string }>(collectionName);
    const filtered = current.filter(i => i.id !== id);
    this.saveLocal(collectionName, filtered);

    // Try deleting from Firestore
    try {
      await deleteDoc(doc(firestore, collectionName, id));
    } catch (err) {
      console.warn(`[CTOS DB] Firestore delete failed for ${collectionName}/${id}:`, err);
    }
  }

  // --- Public API Methods (all async) ---

  private async syncStaffToClock(): Promise<void> {
    try {
      const staffList = await this.loadCollection<TeamMember>(COLLECTIONS.STAFF);
      const activeList = staffList.length > 0 ? staffList : TEAM_MEMBERS;
      const ctStaff = activeList.map(s => ({
        id: s.pinCode || s.id,
        name: s.name,
        role: s.role,
        accessLevel: s.accessLevel || 'standard',
        rate: s.hourlyRate || 25.00
      }));
      localStorage.setItem('ct_staff', JSON.stringify(ctStaff));
    } catch (e) {
      console.error('[CTOS DB] Failed to sync staff to ct-clock:', e);
    }
  }

  async getStaff(): Promise<TeamMember[]> {
    const staff = await this.loadCollection<TeamMember>(COLLECTIONS.STAFF);
    await this.syncStaffToClock();
    return staff.length > 0 ? staff : TEAM_MEMBERS;
  }
  async saveStaff(staff: TeamMember): Promise<void> {
    await this.upsert(COLLECTIONS.STAFF, staff);
    await this.syncStaffToClock();
  }
  async deleteStaff(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.STAFF, id);
    await this.syncStaffToClock();
  }

  async getEvents(): Promise<CalendarEvent[]> {
    return this.loadCollection<CalendarEvent>(COLLECTIONS.EVENTS);
  }
  async saveEvent(event: CalendarEvent): Promise<void> {
    await this.upsert(COLLECTIONS.EVENTS, event);
  }
  async deleteEvent(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.EVENTS, id);
  }

  private async syncRosterToClock(): Promise<void> {
    try {
      const shifts = await this.loadCollection<RosterShift>(COLLECTIONS.SHIFTS);
      const staffList = await this.getStaff();
      const ctRoster = shifts.map(shift => {
        const staff = staffList.find(m => m.id === shift.staffId) || TEAM_MEMBERS.find(m => m.id === shift.staffId);
        if (!staff) return null;
        
        return {
          id: shift.id,
          employeeId: staff.pinCode,
          employeeName: staff.name,
          role: shift.role,
          date: shift.start instanceof Date ? shift.start.toISOString().split('T')[0] : String(shift.start).split('T')[0],
          start: shift.start instanceof Date ? shift.start.toTimeString().substring(0, 5) : '00:00',
          end: shift.end instanceof Date ? shift.end.toTimeString().substring(0, 5) : '00:00'
        };
      }).filter(Boolean);
      
      localStorage.setItem('ct_roster', JSON.stringify(ctRoster));
    } catch (e) {
      console.error('[CTOS DB] Failed to sync roster to ct-clock:', e);
    }
  }

  async getShifts(): Promise<RosterShift[]> {
    const shifts = await this.loadCollection<RosterShift>(COLLECTIONS.SHIFTS);
    await this.syncRosterToClock();
    return shifts;
  }
  async saveShift(shift: RosterShift): Promise<void> {
    await this.upsert(COLLECTIONS.SHIFTS, shift);
    await this.syncRosterToClock();
  }
  async deleteShift(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.SHIFTS, id);
    await this.syncRosterToClock();
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return this.loadCollection<LeaveRequest>(COLLECTIONS.LEAVE);
  }
  async saveLeaveRequest(request: LeaveRequest): Promise<void> {
    await this.upsert(COLLECTIONS.LEAVE, request);
  }
  async deleteLeaveRequest(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.LEAVE, id);
  }

  async getStock(): Promise<StockItem[]> {
    const items = await this.loadCollection<StockItem>(COLLECTIONS.STOCK);
    return items.length > 0 ? items : INITIAL_STOCK;
  }
  async saveStock(item: StockItem): Promise<void> {
    await this.upsert(COLLECTIONS.STOCK, item);
  }
  async deleteStock(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.STOCK, id);
  }
  async updateStock(id: string, qty: number): Promise<void> {
    const stock = await this.getStock();
    const item = stock.find(s => s.id === id);
    if (item) {
      item.quantity = qty;
      await this.saveStock(item);
    }
  }

  async getSuppliers(): Promise<Supplier[]> {
    const suppliers = await this.loadCollection<Supplier>(COLLECTIONS.SUPPLIERS);
    return suppliers.length > 0 ? suppliers : INITIAL_SUPPLIERS;
  }
  async saveSupplier(supplier: Supplier): Promise<void> {
    await this.upsert(COLLECTIONS.SUPPLIERS, supplier);
  }
  async deleteSupplier(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.SUPPLIERS, id);
  }

  async getBookings(): Promise<Booking[]> {
    const bookings = await this.loadCollection<Booking>(COLLECTIONS.BOOKINGS);
    return bookings.length > 0 ? bookings : INITIAL_BOOKINGS;
  }
  async saveBooking(booking: Booking): Promise<void> {
    await this.upsert(COLLECTIONS.BOOKINGS, booking);
  }
  async deleteBooking(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.BOOKINGS, id);
  }

  async getMaintenance(): Promise<MaintenanceTask[]> {
    const tasks = await this.loadCollection<MaintenanceTask>(COLLECTIONS.MAINTENANCE);
    return tasks.length > 0 ? tasks : INITIAL_MAINTENANCE;
  }
  async saveMaintenanceTask(task: MaintenanceTask): Promise<void> {
    await this.upsert(COLLECTIONS.MAINTENANCE, task);
  }
  async deleteMaintenanceTask(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.MAINTENANCE, id);
  }

  async getEntertainment(): Promise<EntertainmentEvent[]> {
    const events = await this.loadCollection<EntertainmentEvent>(COLLECTIONS.ENTERTAINMENT);
    return events.length > 0 ? events : INITIAL_ENTERTAINMENT;
  }
  async saveEntertainment(event: EntertainmentEvent): Promise<void> {
    await this.upsert(COLLECTIONS.ENTERTAINMENT, event);
  }
  async deleteEntertainment(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.ENTERTAINMENT, id);
  }

  async getFunctions(): Promise<FunctionBooking[]> {
    const funcs = await this.loadCollection<FunctionBooking>(COLLECTIONS.FUNCTIONS);
    return funcs.length > 0 ? funcs : INITIAL_FUNCTIONS;
  }
  async saveFunction(func: FunctionBooking): Promise<void> {
    await this.upsert(COLLECTIONS.FUNCTIONS, func);
  }
  async deleteFunction(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.FUNCTIONS, id);
  }

  async getFinance(): Promise<CashUpRecord[]> {
    const finance = await this.loadCollection<CashUpRecord>(COLLECTIONS.FINANCE);
    return finance.length > 0 ? finance : INITIAL_FINANCE;
  }
  async saveCashUp(record: CashUpRecord): Promise<void> {
    await this.upsert(COLLECTIONS.FINANCE, record);
  }
  async deleteCashUp(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.FINANCE, id);
  }

  async getInvoices(): Promise<Invoice[]> {
    const invoices = await this.loadCollection<Invoice>(COLLECTIONS.INVOICES);
    return invoices.length > 0 ? invoices : INITIAL_INVOICES;
  }
  async saveInvoice(invoice: Invoice): Promise<void> {
    await this.upsert(COLLECTIONS.INVOICES, invoice);
  }
  async deleteInvoice(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.INVOICES, id);
  }

  async getBookmarks(): Promise<BrowserBookmark[]> {
    return this.loadCollection<BrowserBookmark>(COLLECTIONS.BOOKMARKS);
  }

  async getIntegrations(): Promise<IntegrationConfig> {
    try {
      const snap = await getDoc(doc(firestore, COLLECTIONS.INTEGRATIONS, 'config'));
      if (snap.exists()) {
        return snap.data() as IntegrationConfig;
      }
    } catch (e) {
      console.warn('[CTOS DB] Error fetching integrations config:', e);
    }
    return {
      tevalis: { connected: true, siteId: 'CT-001' },
      nowBookIt: { connected: true, venueId: 'VN-992' },
      google: { connected: true },
    };
  }

  async getFiles(): Promise<FileItem[]> {
    const files = await this.loadCollection<FileItem>(COLLECTIONS.FILES);
    return files.length > 0 ? files : INITIAL_FILES;
  }
  async saveFile(file: FileItem): Promise<void> {
    await this.upsert(COLLECTIONS.FILES, file);
  }
  async deleteFile(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.FILES, id);
  }

  async getIncidents(): Promise<IncidentReport[]> {
    const incidents = await this.loadCollection<IncidentReport>(COLLECTIONS.INCIDENTS);
    return incidents.length > 0 ? incidents : INITIAL_INCIDENTS;
  }
  async saveIncident(report: IncidentReport): Promise<void> {
    await this.upsert(COLLECTIONS.INCIDENTS, report);
  }
  async deleteIncident(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.INCIDENTS, id);
  }

  async getLostFound(): Promise<LostItem[]> {
    const items = await this.loadCollection<LostItem>(COLLECTIONS.LOSTFOUND);
    return items.length > 0 ? items : INITIAL_LOST_FOUND;
  }
  async saveLostItem(item: LostItem): Promise<void> {
    await this.upsert(COLLECTIONS.LOSTFOUND, item);
  }
  async deleteLostItem(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.LOSTFOUND, id);
  }

  async getTVSchedule(): Promise<TVScheduleItem[]> {
    const items = await this.loadCollection<TVScheduleItem>(COLLECTIONS.TV_SCHEDULE);
    return items.length > 0 ? items : INITIAL_TV_SCHEDULE;
  }
  async saveTVScheduleItem(item: TVScheduleItem): Promise<void> {
    await this.upsert(COLLECTIONS.TV_SCHEDULE, item);
  }
  async deleteTVScheduleItem(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.TV_SCHEDULE, id);
  }

  async getStocktakes(): Promise<StocktakeSession[]> {
    const sessions = await this.loadCollection<StocktakeSession>(COLLECTIONS.STOCKTAKES);
    return sessions.length > 0 ? sessions : INITIAL_STOCKTAKES;
  }
  async saveStocktake(session: StocktakeSession): Promise<void> {
    await this.upsert(COLLECTIONS.STOCKTAKES, session);
  }
  async deleteStocktake(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.STOCKTAKES, id);
  }

  async getOrders(): Promise<PurchaseOrder[]> {
    const orders = await this.loadCollection<PurchaseOrder>(COLLECTIONS.ORDERS);
    return orders.length > 0 ? orders : INITIAL_ORDERS;
  }
  async saveOrder(order: PurchaseOrder): Promise<void> {
    await this.upsert(COLLECTIONS.ORDERS, order);
  }
  async deleteOrder(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.ORDERS, id);
  }

  async getTimePunches(): Promise<TimePunch[]> {
    const punches = await this.loadCollection<TimePunch>(COLLECTIONS.TIMEPUNCHES);
    return punches.length > 0 ? punches : INITIAL_TIME_PUNCHES;
  }
  async saveTimePunch(punch: TimePunch): Promise<void> {
    await this.upsert(COLLECTIONS.TIMEPUNCHES, punch);
  }
  async deleteTimePunch(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.TIMEPUNCHES, id);
  }

  async getBudgets(): Promise<BudgetTracker[]> {
    const budgets = await this.loadCollection<BudgetTracker>(COLLECTIONS.BUDGETS);
    return budgets.length > 0 ? budgets : INITIAL_BUDGETS;
  }
  async saveBudget(budget: BudgetTracker): Promise<void> {
    await this.upsert(COLLECTIONS.BUDGETS, budget);
  }
  async deleteBudget(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.BUDGETS, id);
  }

  async getRecipes(): Promise<Recipe[]> {
    const recipes = await this.loadCollection<Recipe>(COLLECTIONS.RECIPES);
    return recipes.length > 0 ? recipes : INITIAL_RECIPES;
  }
  async saveRecipe(recipe: Recipe): Promise<void> {
    await this.upsert(COLLECTIONS.RECIPES, recipe);
  }
  async deleteRecipe(id: string): Promise<void> {
    await this.removeDoc(COLLECTIONS.RECIPES, id);
  }
}

export const db = new DatabaseService();
