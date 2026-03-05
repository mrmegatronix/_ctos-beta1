
import { TeamMember, CalendarEvent, RosterShift, Booking, StockItem, Supplier, MaintenanceTask, EntertainmentEvent, FunctionBooking, CashUpRecord, FileItem, LeaveRequest, Invoice, Recipe, IncidentReport, LostItem, TVScheduleItem } from './types';
import { addDays, getStartOfWeek } from './utils';

// --- STAFF CONFIGURATION ---
// --- STAFF CONFIGURATION ---
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'admin-01',
    name: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    color: '#4F46E5',
    visible: true,
    role: 'Admin',
    pinCode: '00'
  },
  {
    id: 'chef-01',
    name: 'Head Chef',
    avatar: 'https://images.unsplash.com/photo-1583394293214-28dea15ee548?w=400&h=400&fit=crop',
    color: '#EF4444',
    visible: true,
    role: 'Head Chef',
    pinCode: '11'
  }
];

// --- ROSTER GENERATION ---
const today = new Date();
const currentWeekStart = getStartOfWeek(today); // Returns Monday

export const INITIAL_SHIFTS: RosterShift[] = [];
export const INITIAL_LEAVE: LeaveRequest[] = [];

// --- OTHER INITIAL DATA ---

export const INITIAL_EVENTS: CalendarEvent[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];

// --- RAW PRODUCT CSV DATA ---
const RAW_PRODUCT_CSV = `ProductID,ProductType,ProductGroup,ProductName,ProductName2,PriceBand,PriceGroup,VATRate,Measure,CostPricePerSKU,GrossSellPrice,BarCode,PLU,PLU2,SKUName,BINNumber,KPText,CommissionPercentage,AllowZeroPrice,UseStandardVAT,AwardCRMPoints,ChargePerMinute,ExcludeFromReceipt,PromptForDescription,SellByWeight,ServiceChargeExempt,PrintToKPStandalone,IsMain,ProductInfo,RezlynxCode,MeasureCostPricePerSKU,ProhibitSalesWhenUnderStocked,IsUseBatchSales,CookTimeSeconds,ShelfLifeSeconds,IsDisplayAfterProduced,IsBatchSalesProduceOnSale,AlcoholPercent,UnitVolume,AllowDiscount,ItemCookCount,SelfServiceFood,SelfServiceDrink,IsChooseLater,KP1,KP2,KP3,KP4,KP5,KP6,KP7,KP8,KP9,KP10,KP11,KP12,KP13,KP14,KP15,KP16,HideMeasureShortNameFromReceipt,ThirdPartyCRMPointsValue,ExtraReceiptText,CRMPointsValue,IsAvailableThroughTevalisAPI,IsAlcohol,CRMCode,ReportCategory,Region,Vintage,StockWarningLevel`;

export const INITIAL_STOCK: StockItem[] = [];
export const INITIAL_SUPPLIERS: Supplier[] = [];
export const INITIAL_MAINTENANCE: MaintenanceTask[] = [];
export const INITIAL_ENTERTAINMENT: EntertainmentEvent[] = [];
export const INITIAL_FUNCTIONS: FunctionBooking[] = [];
export const INITIAL_FINANCE: CashUpRecord[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_RECIPES: Recipe[] = [];
export const INITIAL_INCIDENTS: IncidentReport[] = [];
export const INITIAL_LOST_FOUND: LostItem[] = [];
export const INITIAL_TV_SCHEDULE: TVScheduleItem[] = [];

export const SOCIAL_LINKS = [];

export const HOURS: number[] = Array.from({ length: 24 }, (_, i) => i);

export const INITIAL_FILES: FileItem[] = [];
