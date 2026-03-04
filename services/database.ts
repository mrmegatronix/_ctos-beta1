
import { firestore } from './firebase';
import {
  collection, doc, getDocs, setDoc, deleteDoc, writeBatch, getDoc
} from 'firebase/firestore';
import { TeamMember, RosterShift, StockItem, Booking, Supplier, MaintenanceTask, CalendarEvent, EntertainmentEvent, FunctionBooking, CashUpRecord, BrowserBookmark, IntegrationConfig, FileItem, LeaveRequest, Invoice, Recipe, IncidentReport, LostItem, TVScheduleItem } from '../types';
import { INITIAL_EVENTS, INITIAL_SHIFTS, INITIAL_STOCK, INITIAL_BOOKINGS, INITIAL_SUPPLIERS, INITIAL_MAINTENANCE, INITIAL_ENTERTAINMENT, INITIAL_FUNCTIONS, INITIAL_FINANCE, TEAM_MEMBERS, INITIAL_FILES, INITIAL_LEAVE, INITIAL_INVOICES, INITIAL_RECIPES, INITIAL_INCIDENTS, INITIAL_LOST_FOUND, INITIAL_TV_SCHEDULE } from '../constants';

// This service uses Firebase Firestore as the backend database.
// Each collection maps to a Firestore collection.

const DB_VERSION = '1.6';

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

  // --- Generic helpers ---

  private async loadCollection<T>(collectionName: string): Promise<T[]> {
    const snap = await getDocs(collection(firestore, collectionName));
    return snap.docs.map(d => reviveDates({ id: d.id, ...d.data() }) as T);
  }

  private async upsert<T extends { id: string }>(
    collectionName: string,
    item: T
  ): Promise<void> {
    const ref = doc(firestore, collectionName, item.id);
    await setDoc(ref, prepareDates({ ...item }));
  }

  private async removeDoc(collectionName: string, id: string): Promise<void> {
    await deleteDoc(doc(firestore, collectionName, id));
  }

  // --- Public API Methods (all async) ---

  async getStaff(): Promise<TeamMember[]> {
    return this.loadCollection<TeamMember>(COLLECTIONS.STAFF);
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

  async getShifts(): Promise<RosterShift[]> {
    return this.loadCollection<RosterShift>(COLLECTIONS.SHIFTS);
  }
  async saveShift(shift: RosterShift): Promise<void> {
    await this.upsert(COLLECTIONS.SHIFTS, shift);
  }

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return this.loadCollection<LeaveRequest>(COLLECTIONS.LEAVE);
  }
  async saveLeaveRequest(request: LeaveRequest): Promise<void> {
    await this.upsert(COLLECTIONS.LEAVE, request);
  }

  async getStock(): Promise<StockItem[]> {
    return this.loadCollection<StockItem>(COLLECTIONS.STOCK);
  }
  async updateStock(id: string, qty: number): Promise<void> {
    const ref = doc(firestore, COLLECTIONS.STOCK, id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      await setDoc(ref, { ...data, quantity: qty });
    }
  }

  async getBookings(): Promise<Booking[]> {
    return this.loadCollection<Booking>(COLLECTIONS.BOOKINGS);
  }

  async getSuppliers(): Promise<Supplier[]> {
    return this.loadCollection<Supplier>(COLLECTIONS.SUPPLIERS);
  }

  async getMaintenance(): Promise<MaintenanceTask[]> {
    return this.loadCollection<MaintenanceTask>(COLLECTIONS.MAINTENANCE);
  }
  async saveMaintenanceTask(task: MaintenanceTask): Promise<void> {
    await this.upsert(COLLECTIONS.MAINTENANCE, task);
  }

  async getEntertainment(): Promise<EntertainmentEvent[]> {
    return this.loadCollection<EntertainmentEvent>(COLLECTIONS.ENTERTAINMENT);
  }

  async getFunctions(): Promise<FunctionBooking[]> {
    return this.loadCollection<FunctionBooking>(COLLECTIONS.FUNCTIONS);
  }
  async saveFunction(func: FunctionBooking): Promise<void> {
    await this.upsert(COLLECTIONS.FUNCTIONS, func);
  }

  async getFinance(): Promise<CashUpRecord[]> {
    return this.loadCollection<CashUpRecord>(COLLECTIONS.FINANCE);
  }

  async getInvoices(): Promise<Invoice[]> {
    return this.loadCollection<Invoice>(COLLECTIONS.INVOICES);
  }
  async saveInvoice(invoice: Invoice): Promise<void> {
    await this.upsert(COLLECTIONS.INVOICES, invoice);
  }

  async getBookmarks(): Promise<BrowserBookmark[]> {
    return this.loadCollection<BrowserBookmark>(COLLECTIONS.BOOKMARKS);
  }

  async getIntegrations(): Promise<IntegrationConfig> {
    const snap = await getDoc(doc(firestore, COLLECTIONS.INTEGRATIONS, 'config'));
    if (snap.exists()) {
      return snap.data() as IntegrationConfig;
    }
    return {
      tevalis: { connected: false },
      nowBookIt: { connected: false },
      google: { connected: false },
    };
  }

  async getFiles(): Promise<FileItem[]> {
    return this.loadCollection<FileItem>(COLLECTIONS.FILES);
  }
  async saveFile(file: FileItem): Promise<void> {
    await this.upsert(COLLECTIONS.FILES, file);
  }

  async getRecipes(): Promise<Recipe[]> {
    return this.loadCollection<Recipe>(COLLECTIONS.RECIPES);
  }

  async getIncidents(): Promise<IncidentReport[]> {
    return this.loadCollection<IncidentReport>(COLLECTIONS.INCIDENTS);
  }
  async saveIncident(report: IncidentReport): Promise<void> {
    await this.upsert(COLLECTIONS.INCIDENTS, report);
  }

  async getLostFound(): Promise<LostItem[]> {
    return this.loadCollection<LostItem>(COLLECTIONS.LOSTFOUND);
  }
  async saveLostItem(item: LostItem): Promise<void> {
    await this.upsert(COLLECTIONS.LOSTFOUND, item);
  }

  async getTVSchedule(): Promise<TVScheduleItem[]> {
    return this.loadCollection<TVScheduleItem>(COLLECTIONS.TV_SCHEDULE);
  }
  async saveTVScheduleItem(item: TVScheduleItem): Promise<void> {
    await this.upsert(COLLECTIONS.TV_SCHEDULE, item);
  }
}

export const db = new DatabaseService();
