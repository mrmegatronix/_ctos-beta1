
import { TeamMember, CalendarEvent, RosterShift, Booking, StockItem, Supplier, MaintenanceTask, EntertainmentEvent, FunctionBooking, CashUpRecord, FileItem, LeaveRequest, Invoice, Recipe, IncidentReport, LostItem, TVScheduleItem, StocktakeSession, PurchaseOrder, TimePunch, BudgetTracker } from './types';
import { addDays, getStartOfWeek } from './utils';

// --- STAFF CONFIGURATION ---
// --- STAFF CONFIGURATION ---
export const TEAM_MEMBERS: TeamMember[] = [

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
  {
    id: 'foh-robert',
    name: 'Robert',
    avatar: '',
    color: '#EF4444',
    visible: true,
    role: 'Front of House',
    pinCode: '00'
  },
  {
    id: 'foh-bianca',
    name: 'Bianca',
    avatar: '',
    color: '#F59E0B',
    visible: true,
    role: 'Front of House',
    pinCode: '01'
  },
  {
    id: 'foh-nicole',
    name: 'Nicole',
    avatar: '',
    color: '#10B981',
    visible: true,
    role: 'Front of House',
    pinCode: '02'
  },
  {
    id: 'foh-carma',
    name: 'Carma',
    avatar: '',
    color: '#EC4899',
    visible: true,
    role: 'Front of House',
    pinCode: '03'
  },
  {
    id: 'foh-jess',
    name: 'Jess',
    avatar: '',
    color: '#8B5CF6',
    visible: true,
    role: 'Front of House',
    pinCode: '04'
  },
  {
    id: 'foh-racheal',
    name: 'Racheal',
    avatar: '',
    color: '#14B8A6',
    visible: true,
    role: 'Front of House',
    pinCode: '05'
  },
  {
    id: 'foh-harsh',
    name: 'Harsh',
    avatar: '',
    color: '#F43F5E',
    visible: true,
    role: 'Front of House',
    pinCode: '06'
  },
];

// --- ROSTER GENERATION ---
const today = new Date();
const currentWeekStart = getStartOfWeek(today); // Returns Monday

export const INITIAL_SHIFTS: RosterShift[] = [
  {
    id: 'shift-0',
    staffId: 'foh-robert',
    start: new Date(2026, 6, 27, 12, 0),
    end: new Date(2026, 6, 27, 17, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-1',
    staffId: 'foh-robert',
    start: new Date(2026, 6, 28, 12, 0),
    end: new Date(2026, 6, 28, 23, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-2',
    staffId: 'foh-robert',
    start: new Date(2026, 6, 29, 13, 0),
    end: new Date(2026, 6, 29, 23, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-3',
    staffId: 'foh-bianca',
    start: new Date(2026, 6, 27, 8, 30),
    end: new Date(2026, 6, 27, 15, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-4',
    staffId: 'foh-bianca',
    start: new Date(2026, 6, 28, 17, 0),
    end: new Date(2026, 6, 28, 22, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-5',
    staffId: 'foh-bianca',
    start: new Date(2026, 6, 29, 8, 30),
    end: new Date(2026, 6, 29, 14, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-6',
    staffId: 'foh-bianca',
    start: new Date(2026, 6, 30, 8, 30),
    end: new Date(2026, 6, 30, 16, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-7',
    staffId: 'foh-bianca',
    start: new Date(2026, 6, 31, 8, 30),
    end: new Date(2026, 6, 31, 16, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-8',
    staffId: 'foh-nicole',
    start: new Date(2026, 6, 27, 15, 0),
    end: new Date(2026, 6, 27, 21, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-9',
    staffId: 'foh-nicole',
    start: new Date(2026, 6, 28, 8, 30),
    end: new Date(2026, 6, 28, 14, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-10',
    staffId: 'foh-nicole',
    start: new Date(2026, 6, 29, 16, 0),
    end: new Date(2026, 6, 29, 23, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-11',
    staffId: 'foh-nicole',
    start: new Date(2026, 7, 1, 8, 30),
    end: new Date(2026, 7, 1, 17, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-12',
    staffId: 'foh-nicole',
    start: new Date(2026, 7, 2, 8, 30),
    end: new Date(2026, 7, 2, 22, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-13',
    staffId: 'admin-nikko',
    start: new Date(2026, 6, 29, 17, 0),
    end: new Date(2026, 6, 29, 23, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-14',
    staffId: 'admin-nikko',
    start: new Date(2026, 6, 30, 16, 0),
    end: new Date(2026, 6, 30, 23, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-15',
    staffId: 'admin-nikko',
    start: new Date(2026, 6, 31, 16, 0),
    end: new Date(2026, 6, 31, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-16',
    staffId: 'admin-nikko',
    start: new Date(2026, 7, 1, 16, 0),
    end: new Date(2026, 7, 1, 0, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-17',
    staffId: 'admin-nikko',
    start: new Date(2026, 7, 2, 15, 0),
    end: new Date(2026, 7, 2, 22, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-18',
    staffId: 'foh-carma',
    start: new Date(2026, 6, 27, 4, 30),
    end: new Date(2026, 6, 27, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-19',
    staffId: 'foh-carma',
    start: new Date(2026, 6, 28, 16, 30),
    end: new Date(2026, 6, 28, 21, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-20',
    staffId: 'foh-carma',
    start: new Date(2026, 6, 29, 16, 0),
    end: new Date(2026, 6, 29, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-21',
    staffId: 'foh-carma',
    start: new Date(2026, 6, 30, 16, 0),
    end: new Date(2026, 6, 30, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-22',
    staffId: 'foh-carma',
    start: new Date(2026, 6, 31, 16, 0),
    end: new Date(2026, 6, 31, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-23',
    staffId: 'foh-jess',
    start: new Date(2026, 6, 27, 17, 30),
    end: new Date(2026, 6, 27, 20, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-24',
    staffId: 'foh-jess',
    start: new Date(2026, 6, 28, 13, 0),
    end: new Date(2026, 6, 28, 20, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-25',
    staffId: 'foh-jess',
    start: new Date(2026, 6, 29, 12, 0),
    end: new Date(2026, 6, 29, 20, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-26',
    staffId: 'foh-racheal',
    start: new Date(2026, 6, 27, 17, 30),
    end: new Date(2026, 6, 27, 20, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-27',
    staffId: 'foh-racheal',
    start: new Date(2026, 6, 28, 12, 0),
    end: new Date(2026, 6, 28, 16, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-28',
    staffId: 'foh-harsh',
    start: new Date(2026, 6, 27, 16, 30),
    end: new Date(2026, 6, 27, 21, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-29',
    staffId: 'foh-harsh',
    start: new Date(2026, 6, 28, 16, 30),
    end: new Date(2026, 6, 28, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-30',
    staffId: 'foh-harsh',
    start: new Date(2026, 6, 29, 16, 0),
    end: new Date(2026, 6, 29, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-31',
    staffId: 'foh-harsh',
    start: new Date(2026, 6, 30, 16, 0),
    end: new Date(2026, 6, 30, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-32',
    staffId: 'foh-harsh',
    start: new Date(2026, 6, 31, 16, 0),
    end: new Date(2026, 6, 31, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-33',
    staffId: 'foh-robert',
    start: new Date(2026, 7, 4, 12, 0),
    end: new Date(2026, 7, 4, 17, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-34',
    staffId: 'foh-robert',
    start: new Date(2026, 7, 5, 12, 0),
    end: new Date(2026, 7, 5, 23, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-35',
    staffId: 'foh-robert',
    start: new Date(2026, 7, 6, 13, 0),
    end: new Date(2026, 7, 6, 23, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-36',
    staffId: 'foh-robert',
    start: new Date(2026, 7, 7, 13, 0),
    end: new Date(2026, 7, 7, 23, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-37',
    staffId: 'foh-robert',
    start: new Date(2026, 7, 8, 12, 0),
    end: new Date(2026, 7, 8, 20, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-38',
    staffId: 'foh-bianca',
    start: new Date(2026, 7, 3, 8, 30),
    end: new Date(2026, 7, 3, 15, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-39',
    staffId: 'foh-bianca',
    start: new Date(2026, 7, 4, 17, 0),
    end: new Date(2026, 7, 4, 22, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-40',
    staffId: 'foh-bianca',
    start: new Date(2026, 7, 5, 8, 30),
    end: new Date(2026, 7, 5, 14, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-41',
    staffId: 'foh-bianca',
    start: new Date(2026, 7, 6, 8, 30),
    end: new Date(2026, 7, 6, 16, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-42',
    staffId: 'foh-bianca',
    start: new Date(2026, 7, 7, 8, 30),
    end: new Date(2026, 7, 7, 16, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-43',
    staffId: 'foh-nicole',
    start: new Date(2026, 7, 3, 15, 0),
    end: new Date(2026, 7, 3, 21, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-44',
    staffId: 'foh-nicole',
    start: new Date(2026, 7, 4, 8, 30),
    end: new Date(2026, 7, 4, 14, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-45',
    staffId: 'foh-nicole',
    start: new Date(2026, 7, 5, 16, 0),
    end: new Date(2026, 7, 5, 23, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-46',
    staffId: 'foh-nicole',
    start: new Date(2026, 7, 7, 8, 30),
    end: new Date(2026, 7, 7, 17, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-47',
    staffId: 'foh-nicole',
    start: new Date(2026, 7, 8, 8, 30),
    end: new Date(2026, 7, 8, 22, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-48',
    staffId: 'admin-nikko',
    start: new Date(2026, 7, 3, 17, 0),
    end: new Date(2026, 7, 3, 23, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-49',
    staffId: 'admin-nikko',
    start: new Date(2026, 7, 4, 16, 0),
    end: new Date(2026, 7, 4, 23, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-50',
    staffId: 'admin-nikko',
    start: new Date(2026, 7, 5, 16, 0),
    end: new Date(2026, 7, 5, 21, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-51',
    staffId: 'admin-nikko',
    start: new Date(2026, 7, 6, 16, 0),
    end: new Date(2026, 7, 6, 0, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-52',
    staffId: 'admin-nikko',
    start: new Date(2026, 7, 7, 15, 0),
    end: new Date(2026, 7, 7, 20, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-53',
    staffId: 'foh-carma',
    start: new Date(2026, 7, 3, 16, 30),
    end: new Date(2026, 7, 3, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-54',
    staffId: 'foh-carma',
    start: new Date(2026, 7, 4, 16, 30),
    end: new Date(2026, 7, 4, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-55',
    staffId: 'foh-carma',
    start: new Date(2026, 7, 5, 16, 0),
    end: new Date(2026, 7, 5, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-56',
    staffId: 'foh-carma',
    start: new Date(2026, 7, 6, 16, 0),
    end: new Date(2026, 7, 6, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-57',
    staffId: 'foh-carma',
    start: new Date(2026, 7, 7, 16, 0),
    end: new Date(2026, 7, 7, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-58',
    staffId: 'foh-jess',
    start: new Date(2026, 7, 3, 17, 30),
    end: new Date(2026, 7, 3, 20, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-59',
    staffId: 'foh-racheal',
    start: new Date(2026, 7, 3, 12, 0),
    end: new Date(2026, 7, 3, 16, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-60',
    staffId: 'foh-harsh',
    start: new Date(2026, 7, 3, 16, 30),
    end: new Date(2026, 7, 3, 21, 0),
    role: 'Front of House'
  },
  {
    id: 'shift-61',
    staffId: 'foh-harsh',
    start: new Date(2026, 7, 4, 16, 30),
    end: new Date(2026, 7, 4, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-62',
    staffId: 'foh-harsh',
    start: new Date(2026, 7, 5, 16, 0),
    end: new Date(2026, 7, 5, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-63',
    staffId: 'foh-harsh',
    start: new Date(2026, 7, 6, 16, 0),
    end: new Date(2026, 7, 6, 23, 30),
    role: 'Front of House'
  },
  {
    id: 'shift-64',
    staffId: 'foh-harsh',
    start: new Date(2026, 7, 7, 16, 0),
    end: new Date(2026, 7, 7, 23, 30),
    role: 'Front of House'
  },
];
export const INITIAL_LEAVE: LeaveRequest[] = [];

// --- OTHER INITIAL DATA ---

export const INITIAL_EVENTS: CalendarEvent[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];

// --- RAW PRODUCT CSV DATA ---
const RAW_PRODUCT_CSV = `ProductID,ProductType,ProductGroup,ProductName,ProductName2,PriceBand,PriceGroup,VATRate,Measure,CostPricePerSKU,GrossSellPrice,BarCode,PLU,PLU2,SKUName,BINNumber,KPText,CommissionPercentage,AllowZeroPrice,UseStandardVAT,AwardCRMPoints,ChargePerMinute,ExcludeFromReceipt,PromptForDescription,SellByWeight,ServiceChargeExempt,PrintToKPStandalone,IsMain,ProductInfo,RezlynxCode,MeasureCostPricePerSKU,ProhibitSalesWhenUnderStocked,IsUseBatchSales,CookTimeSeconds,ShelfLifeSeconds,IsDisplayAfterProduced,IsBatchSalesProduceOnSale,AlcoholPercent,UnitVolume,AllowDiscount,ItemCookCount,SelfServiceFood,SelfServiceDrink,IsChooseLater,KP1,KP2,KP3,KP4,KP5,KP6,KP7,KP8,KP9,KP10,KP11,KP12,KP13,KP14,KP15,KP16,HideMeasureShortNameFromReceipt,ThirdPartyCRMPointsValue,ExtraReceiptText,CRMPointsValue,IsAvailableThroughTevalisAPI,IsAlcohol,CRMCode,ReportCategory,Region,Vintage,StockWarningLevel`;

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Lion Nathan',
    contactPerson: 'John Smith',
    email: 'orders@lionnathan.co.nz',
    phone: '0800 123 456',
    category: 'Beverages',
    address: '123 Brewery Lane, Auckland',
  },
  {
    id: 'sup-2',
    name: 'EuroVintage',
    contactPerson: 'Sarah Jones',
    email: 'orders@eurovintage.co.nz',
    phone: '0800 987 654',
    category: 'Wine & Spirits',
    address: '45 Wine Road, Wellington',
  }
];

export const INITIAL_STOCK: StockItem[] = [
  {
    id: '1816',
    name: 'Aperol',
    category: 'Aperitif',
    quantity: 12,
    unit: 'BTL',
    minLevel: 4,
    price: 11.00,
    supplierId: 'sup-2',
    image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?q=80&w=200&auto=format&fit=crop',
    allergens: [],
    description: 'Aperol is an Italian bitter apéritif made of gentian, rhubarb, and cinchona, among other ingredients.',
    cost: 4.50,
    productType: 'Beverage',
    isDemo: true,
  },
  {
    id: '1817',
    name: 'Campari',
    category: 'Aperitif',
    quantity: 8,
    unit: 'BTL',
    minLevel: 3,
    price: 11.00,
    supplierId: 'sup-2',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=200&auto=format&fit=crop',
    allergens: [],
    description: 'Campari is an Italian alcoholic liqueur, considered an apéritif obtained from the infusion of herbs and fruit.',
    cost: 5.00,
    productType: 'Beverage',
    isDemo: true,
  },
  {
    id: '2003',
    name: 'Corona 0% BTL',
    category: 'Beer',
    quantity: 48,
    unit: 'BTL',
    minLevel: 24,
    price: 11.00,
    supplierId: 'sup-1',
    image: 'https://images.unsplash.com/photo-1614316933393-272e0d37e295?q=80&w=200&auto=format&fit=crop',
    allergens: ['Gluten'],
    description: 'Alcohol-free beer',
    cost: 3.00,
    productType: 'Beverage',
    isDemo: true,
  },
  {
    id: '1622',
    name: 'Corona BTL',
    category: 'Beer',
    quantity: 24,
    unit: 'Bottle Bucket',
    minLevel: 10,
    price: 35.00,
    supplierId: 'sup-1',
    image: 'https://images.unsplash.com/photo-1614316933393-272e0d37e295?q=80&w=200&auto=format&fit=crop',
    allergens: ['Gluten'],
    description: 'Corona beer bottle bucket',
    cost: 15.00,
    productType: 'Beverage',
    isDemo: true,
  },
  {
    id: '1780',
    name: 'DB Draught Quart BTL',
    category: 'Beer',
    quantity: 36,
    unit: 'Each',
    minLevel: 12,
    price: 13.50,
    supplierId: 'sup-1',
    image: '',
    allergens: ['Gluten'],
    description: 'DB Draught Quart Bottle',
    cost: 5.00,
    productType: 'Beverage',
    isDemo: true,
  },
  {
    id: '1685',
    name: 'Emerson\'s Pilsner',
    category: 'Beer',
    quantity: 50,
    unit: 'Pint',
    minLevel: 20,
    price: 13.50,
    supplierId: 'sup-1',
    image: '',
    allergens: ['Gluten'],
    description: 'Emerson\'s Pilsner tap beer',
    cost: 4.50,
    productType: 'Beverage',
    isDemo: true,
  },
  {
    id: '1689',
    name: 'Guinness',
    category: 'Beer',
    quantity: 40,
    unit: 'Pint',
    minLevel: 15,
    price: 12.50,
    supplierId: 'sup-1',
    image: '',
    allergens: ['Gluten'],
    description: 'Guinness tap beer',
    cost: 4.00,
    productType: 'Beverage',
    isDemo: true,
  },
  {
    id: '1690',
    name: 'Mac\'s Cloudy Apple Cider',
    category: 'Cider',
    quantity: 60,
    unit: '12oz',
    minLevel: 20,
    price: 9.00,
    supplierId: 'sup-1',
    image: '',
    allergens: [],
    description: 'Mac\'s Cloudy Apple Cider tap',
    cost: 3.00,
    productType: 'Beverage',
    isDemo: true,
  }
];
export const INITIAL_MAINTENANCE: MaintenanceTask[] = [];
export const INITIAL_ENTERTAINMENT: EntertainmentEvent[] = [];
export const INITIAL_FUNCTIONS: FunctionBooking[] = [];
export const INITIAL_FINANCE: CashUpRecord[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_RECIPES: Recipe[] = [];
export const INITIAL_INCIDENTS: IncidentReport[] = [];
export const INITIAL_LOST_FOUND: LostItem[] = [];
export const INITIAL_TV_SCHEDULE: TVScheduleItem[] = [];
export const INITIAL_STOCKTAKES: StocktakeSession[] = [];
export const INITIAL_ORDERS: PurchaseOrder[] = [];
export const INITIAL_TIME_PUNCHES: TimePunch[] = [];
export const INITIAL_BUDGETS: BudgetTracker[] = [];

export const SOCIAL_LINKS = [];

export const HOURS: number[] = Array.from({ length: 24 }, (_, i) => i);

export const INITIAL_FILES: FileItem[] = [];
