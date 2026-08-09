
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon, 
  Menu, Bell, Settings, Search, Plus, Moon, Sun, Download, LogIn, LogOut,
  Users, ClipboardList, Utensils, Boxes, Share2, LayoutGrid, Truck, Wrench,
  Music, PartyPopper, DollarSign, Globe, Monitor, FileText, FolderOpen, Home,
  BookOpen, ShieldAlert, Umbrella, Tv, Loader2, Clock as ClockIcon, TrendingUp,
  Smartphone, Sliders, Crown, Shield, UploadCloud
} from 'lucide-react';
import { TeamMember, CalendarEvent, ViewMode, UserProfile, AppModule, AppMode, RosterShift, StockItem, Booking, Supplier, MaintenanceTask, EntertainmentEvent, FunctionBooking, CashUpRecord, FileItem, LeaveRequest, Recipe, IncidentReport, LostItem, TVScheduleItem, MediaSlide, TimesheetEntry, isMasterAdmin, isAdminOrAbove } from './types';
import MediaView from './components/MediaView';
import TimesheetsView from './components/TimesheetsView';
import { db } from './services/database';
import { startAutoSync } from './services/sheetSync';
import { startCsvSync } from './services/csvSync';
import { startHourlyPublicScan } from './services/publicSync';
import { PublicFolderUploadModal } from './components/PublicFolderUploadModal';
import { 
  addDays, getStartOfWeek, formatTime, 
  isSameDay, formatDate, generateId 
} from './utils';
import { 
    INITIAL_SHIFTS, 
    INITIAL_EVENTS, 
    INITIAL_BOOKINGS, 
    INITIAL_SUPPLIERS, 
    INITIAL_STOCK, 
    INITIAL_MAINTENANCE,
    INITIAL_TV_SCHEDULE,
    INITIAL_MENUS,
    HOURS, INITIAL_LEAVE, INITIAL_INVOICES, INITIAL_RECIPES, INITIAL_INCIDENTS, INITIAL_LOST_FOUND, INITIAL_FINANCE, TEAM_MEMBERS, INITIAL_FILES, INITIAL_ENTERTAINMENT, INITIAL_FUNCTIONS 
} from './constants';
import EventModal from './components/EventModal';
import AIAssistant from './components/AIAssistant';
import DashboardView from './components/DashboardView';
import RosterView from './components/RosterView';
import StaffDirectory from './components/StaffDirectory';
import FinanceView from './components/FinanceView';
import BookingsView from './components/BookingsView';
import EntertainmentView from './components/EntertainmentView';
import FunctionsView from './components/FunctionsView';
import TVScheduleView from './components/TVScheduleView';
import SettingsView from './components/SettingsView';
import RecipesView from './components/RecipesView';
import StockView from './components/StockView';
import SuppliersView from './components/SuppliersView';
import MaintenanceView from './components/MaintenanceView';
import IncidentLogView from './components/IncidentLogView';
import LostAndFoundView from './components/LostAndFoundView';
import CTSCAppView from './components/CTSCAppView';
import GeminiNotebookView from './components/GeminiNotebookView';
import CTMatrixControlView from './components/CTMatrixControlView';
import BrowserView from './components/BrowserView';
import DocumentsView from './components/DocumentsView';
import LoginScreen from './components/LoginScreen';
import ActionToolbar from './components/ActionToolbar';
import WeatherView from './components/WeatherView';
import CalendarView from './components/CalendarView';
import CategoryHubView, { CategoryHubLink } from './components/CategoryHubView';
import EODSalesView from './components/EODSalesView';
import MenuView from './components/MenuView';
import { parseNaturalLanguageCommand } from './services/geminiService';
import { initGoogleClient, handleGoogleLogin, importGoogleCalendarEvents } from './services/googleService';

import CTClockView from './components/CTClockView';
import StocktakeView from './components/StocktakeView';
import OrderingView from './components/OrderingView';
import BudgetingView from './components/BudgetingView';
import { StocktakeSession, PurchaseOrder, TimePunch, BudgetTracker } from './types';
import { INITIAL_STOCKTAKES, INITIAL_ORDERS, INITIAL_TIME_PUNCHES, INITIAL_BUDGETS } from './constants';

const App: React.FC = () => {
  // Auth & Mode State
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [appMode, setAppMode] = useState<AppMode>('OFFICE');

  // Navigation State
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [currentModule, setCurrentModule] = useState<AppModule>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [stockFilter, setStockFilter] = useState<{type: string, group: string} | null>(null);

  const toggleMenu = (menu: string) => setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Data State (Loaded from Firestore)
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [shifts, setShifts] = useState<RosterShift[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [entertainmentEvents, setEntertainmentEvents] = useState<EntertainmentEvent[]>([]);
  const [functionBookings, setFunctionBookings] = useState<FunctionBooking[]>([]);
  const [financeRecords, setFinanceRecords] = useState<CashUpRecord[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [lostFound, setLostFound] = useState<LostItem[]>([]);
  const [tvSchedule, setTVSchedule] = useState<TVScheduleItem[]>([]);
  const [mediaSlides, setMediaSlides] = useState<MediaSlide[]>([]);
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);
  const [stocktakes, setStocktakes] = useState<StocktakeSession[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [timePunches, setTimePunches] = useState<TimePunch[]>([]);
  const [budgets, setBudgets] = useState<BudgetTracker[]>([]);
  const [menus, setMenus] = useState<any[]>(INITIAL_MENUS);
  const [eodSales, setEodSales] = useState<any[]>([]);
  
  // Category Hub state
  const [currentCategoryHub, setCurrentCategoryHub] = useState<{title: string, description: string, links: CategoryHubLink[]} | null>(null);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.WEEK);
  
  // UI State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    if (saved !== null) return saved === 'true';
    return true; // Default to dark mode as requested
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublicUploadOpen, setIsPublicUploadOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | undefined>(undefined);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [googleUser, setGoogleUser] = useState<UserProfile | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dark Mode side-effect
  useEffect(() => {
    console.log('[CTOS] Theme change:', isDarkMode ? 'DARK' : 'LIGHT');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('isDarkMode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Temporarily disable dark mode during print to ensure printer-friendly output
  useEffect(() => {
    let wasDark = false;
    const handleBeforePrint = () => {
      wasDark = document.documentElement.classList.contains('dark');
      if (wasDark) {
        document.documentElement.classList.remove('dark');
      }
    };
    const handleAfterPrint = () => {
      if (wasDark) {
        document.documentElement.classList.add('dark');
      }
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Google Sheets Auto-Sync (Runs every 15 minutes)
  useEffect(() => {
    const syncInterval = startAutoSync(15);
    return () => clearInterval(syncInterval);
  }, []);

  // CSV Data Auto-Sync (Runs every 15 minutes)
  useEffect(() => {
    const csvInterval = startCsvSync(15, (data) => {
      setTVSchedule(data.tvSchedule);
      setEntertainmentEvents(data.entertainment);
      // We could also merge events, but we'll just set them for now.
      setEvents(prev => {
        const nonCsvEvents = prev.filter(e => e.source !== 'google'); // assuming 'google' is our csv source
        return [...nonCsvEvents, ...data.events];
      });
    });
    return () => clearInterval(csvInterval);
  }, []);

  // Public Folder Hourly Auto-Scan (Runs every hour on the hour)
  useEffect(() => {
    startHourlyPublicScan();
    const handleSyncComplete = async () => {
      try {
        const [staffData, filesData, financeData, punchesData] = await Promise.all([
          db.getStaff(),
          db.getFiles(),
          db.getFinance(),
          db.getTimePunches()
        ]);
        setTeamMembers(staffData);
        setFiles(filesData);
        setFinanceRecords(financeData);
        setTimePunches(punchesData);
      } catch (err) {
        console.warn('[App] Error refreshing data after public sync:', err);
      }
    };

    window.addEventListener('ctos:public-sync-completed', handleSyncComplete);
    return () => {
      window.removeEventListener('ctos:public-sync-completed', handleSyncComplete);
    };
  }, []);

  // --- Initialization (async — loads from Firestore) ---
  useEffect(() => {
    const loadData = async () => {
      const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms));
      
      try {
        // Initialize DB with a timeout to prevent hanging when Firestore is unreachable
        await Promise.race([db.init(), timeout(10000)]);

        // Load all data in parallel
        const [
          staffData, eventsData, shiftsData, leaveData,
          stockData, bookingsData, suppliersData, maintenanceData,
          entertainmentData, functionsData, financeData, filesData,
          recipesData, incidentsData, lostFoundData, tvData,
          stocktakeData, orderData, timePunchData, budgetData
        ] = await Promise.race([
          Promise.all([
            db.getStaff(),
            db.getEvents(),
            db.getShifts(),
            db.getLeaveRequests(),
            db.getStock(),
            db.getBookings(),
            db.getSuppliers(),
            db.getMaintenance(),
            db.getEntertainment(),
            db.getFunctions(),
            db.getFinance(),
            db.getFiles(),
            db.getRecipes(),
            db.getIncidents(),
            db.getLostFound(),
            db.getTVSchedule(),
            db.getStocktakes(),
            db.getOrders(),
            db.getTimePunches(),
            db.getBudgets(),
          ]),
          timeout(10000) as Promise<never>,
        ]);

        setTeamMembers(staffData);
        setEvents(eventsData);
        setShifts(shiftsData);
        setLeaveRequests(leaveData);
        setStockItems(stockData);
        setBookings(bookingsData);
        setSuppliers(suppliersData);
        setMaintenanceTasks(maintenanceData);
        setEntertainmentEvents(entertainmentData);
        setFunctionBookings(functionsData);
        setFinanceRecords(financeData);
        setFiles(filesData);
        setRecipes(recipesData);
        setIncidents(incidentsData);
        setLostFound(lostFoundData);
        setTVSchedule(tvData);
        setStocktakes(stocktakeData);
        setOrders(orderData);
        setTimePunches(timePunchData);
        setBudgets(budgetData);
      } catch (err) {
        console.error('[CTOS] Firestore unavailable:', err);
        // Fallback to empty arrays if database is down
        setTeamMembers(TEAM_MEMBERS);
        setEvents([]);
        setShifts(INITIAL_SHIFTS);
        setLeaveRequests([]);
        setStockItems(INITIAL_STOCK);
        setBookings([]);
        setSuppliers([]);
        setMaintenanceTasks([]);
        setEntertainmentEvents([]);
        setFunctionBookings([]);
        setFinanceRecords(INITIAL_FINANCE);
        setFiles([]);
        setRecipes([]);
        setIncidents([]);
        setLostFound([]);
        setTVSchedule([]);
        setStocktakes([]);
        setOrders([]);
        setTimePunches([]);
        setBudgets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    initGoogleClient(() => console.log('Google Client initialized'));
  }, []);

  // Auto login on Pi / localhost
  useEffect(() => {
    if (!isLoading && !currentUser && teamMembers.length > 0) {
      if (window.location.hostname === '192.168.1.97' || window.location.hostname === 'localhost' || window.location.search.includes('autologin=true')) {
        const adminUser = teamMembers.find(m => m.id === 'admin-nikko');
        if (adminUser) {
          handleLogin(adminUser);
        }
      }
    }
  }, [isLoading, teamMembers, currentUser]);

  // --- Helpers ---
  const weekStart = useMemo(() => getStartOfWeek(currentDate), [currentDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const visibleMemberIds = teamMembers.filter(m => m.visible).map(m => m.id);
  const filteredEvents = useMemo(() => events.filter(e => (e.attendeeIds || []).length === 0 || (e.attendeeIds || []).some(id => visibleMemberIds.includes(id))), [events, visibleMemberIds]);
  const isFohMode = appMode === 'FOH';
  
  // Theme Logic - Accents: Office (Red), FOH (Gold/Amber), BOH (Blue)
  const getThemeColor = (mode: AppMode) => {
      switch (mode) {
          case 'OFFICE': return 'red';
          case 'FOH': return 'amber';
          case 'BOH': return 'blue';
          default: return 'indigo';
      }
  };
  const themeColor = getThemeColor(appMode);
  
  const getThemeLightBg = (mode: AppMode) => {
      switch (mode) {
          case 'OFFICE': return 'bg-red-100';
          case 'FOH': return 'bg-amber-100';
          case 'BOH': return 'bg-blue-100';
          default: return 'bg-indigo-100';
      }
  };
  const themeLightBg = getThemeLightBg(appMode);

  // --- Handlers ---
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const setExplicitMode = (mode: AppMode) => {
       // Permission Check
       if (mode === 'OFFICE' && currentUser) {
           if (currentUser.role !== 'Admin' && currentUser.role !== 'Duty Manager') {
               showNotification("Access Denied: Office Mode restricted to Managers.", 'error');
               return;
           }
       }
       setAppMode(mode);
       showNotification(`Switched to ${mode} Mode`, 'success');
       setIsSidebarOpen(true);
       
       if (mode === 'FOH') setCurrentModule('browser');
       else setCurrentModule('dashboard');
  };

  const handleLogin = (member: TeamMember) => {
      setCurrentUser(member);
      let mode: AppMode = 'OFFICE';
      if (member.role === 'Front of House') {
          mode = 'FOH';
      } else if (['Head Chef', 'Chef', 'Kitchen Hand'].includes(member.role)) {
          mode = 'BOH';
      }
      setAppMode(mode);
      setIsSidebarOpen(true);
      
      if (mode === 'FOH') setCurrentModule('browser');
      else setCurrentModule('dashboard');

      showNotification(`Welcome, ${member.name}`, 'success');
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setAppMode('OFFICE'); // Reset mode
      setCurrentModule('dashboard');
  };

  const handleSaveTimesheet = async (entry: TimesheetEntry) => {
    // To be implemented with db.saveTimesheet
    setTimesheetEntries(prev => [...prev, entry]);
    showNotification("Timesheet saved", 'success');
  };

  const handleGoogleSync = async () => {
    setIsImporting(true);
    try {
      if (!googleUser) {
        // Mock Login Flow
        const userData = await handleGoogleLogin();
        setGoogleUser(userData);
        showNotification(`Connected to Google Account: ${userData.name}`, 'success');
      }
      
      const importedEvents = await importGoogleCalendarEvents();
      // Merge events avoiding duplicates
      const newEvents = [...events];
      let addedCount = 0;
      for (const imp of importedEvents) {
          if (!newEvents.some(e => e.id === imp.id)) {
              newEvents.push(imp);
              await db.saveEvent(imp);
              addedCount++;
          }
      }
      
      setEvents(newEvents);
      
      if (addedCount > 0) {
          showNotification(`Synced ${addedCount} events from Google Calendar`, 'success');
      } else {
          showNotification('Calendar is up to date', 'success');
      }
    } catch (error) {
      showNotification("Calendar Sync failed.", 'error');
    } finally {
        setIsImporting(false);
    }
  };

  // Calendar CRUD (async)
  const handleEventClick = (event: CalendarEvent) => { setEditingEvent(event); setIsModalOpen(true); };
  const handleCreateEvent = () => { setEditingEvent(undefined); setIsModalOpen(true); };
  const handleSaveEvent = async (event: CalendarEvent) => {
    await db.saveEvent(event);
    setEvents(await db.getEvents());
    showNotification("Event saved", 'success');
  };
  const handleDeleteEvent = async (id: string) => {
    await db.deleteEvent(id);
    setEvents(await db.getEvents());
    showNotification("Event deleted", 'success');
  };

  // Roster (async)
  const handleAddShift = async (day: Date, memberId: string, startTime: string, endTime: string, role: string) => {
      if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Duty Manager') {
          showNotification("Only Managers can add shifts.", 'error');
          return;
      }
      
      const startParts = startTime.split(':');
      const start = new Date(day);
      start.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0, 0);

      const endParts = endTime.split(':');
      const end = new Date(day);
      end.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0, 0);

      // If end time is before start time, assume it crosses midnight
      if (end < start) {
          end.setDate(end.getDate() + 1);
      }

      const newShift: RosterShift = {
          id: generateId(),
          staffId: memberId,
          start: start,
          end: end,
          role: role
      };
      await db.saveShift(newShift);
      setShifts(await db.getShifts());
      showNotification("Shift added", 'success');
  };

  const handleRequestLeave = async (req: LeaveRequest) => {
      await db.saveLeaveRequest(req);
      setLeaveRequests(await db.getLeaveRequests());
      showNotification("Leave requested submitted", 'success');
  };

  // Bookings (async)
  const handleSaveBooking = async (booking: Booking) => {
      await db.saveBooking(booking);
      setBookings(await db.getBookings());
      showNotification("Reservation saved successfully", 'success');
  };

  const handleDeleteBooking = async (id: string) => {
      await db.deleteBooking(id);
      setBookings(await db.getBookings());
      showNotification("Reservation deleted", 'success');
  };

  // Documents/Files (async)
  const handleSaveFile = async (file: FileItem) => {
      await db.saveFile(file);
      setFiles(await db.getFiles());
      showNotification("Filing cabinet updated", 'success');
  };

  const handleDeleteFile = async (id: string) => {
      await db.deleteFile(id);
      setFiles(await db.getFiles());
      showNotification("File deleted", 'success');
  };

  // Staff (async)
  const handleSaveStaff = async (member: TeamMember) => {
      await db.saveStaff(member);
      setTeamMembers(await db.getStaff());
      showNotification("Staff member profile saved", 'success');
  };

  const handleDeleteStaff = async (id: string) => {
      await db.deleteStaff(id);
      setTeamMembers(await db.getStaff());
      showNotification("Staff member deleted", 'success');
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
      await db.saveRecipe(recipe);
      setRecipes(await db.getRecipes());
      showNotification("Recipe saved", 'success');
  };

  const handleDeleteRecipe = async (id: string) => {
      await db.deleteRecipe(id);
      setRecipes(await db.getRecipes());
      showNotification("Recipe deleted", 'success');
  };

  const handleSaveEntertainment = async (event: EntertainmentEvent) => {
      await db.saveEntertainment(event);
      setEntertainmentEvents(await db.getEntertainment());
      showNotification("Entertainment event saved", 'success');
  };

  const handleDeleteEntertainment = async (id: string) => {
      await db.deleteEntertainment(id);
      setEntertainmentEvents(await db.getEntertainment());
      showNotification("Entertainment event removed", 'success');
  };

  const handleSaveSupplier = async (supplier: Supplier) => {
      await db.saveSupplier(supplier);
      setSuppliers(await db.getSuppliers());
      showNotification("Supplier vendor saved", 'success');
  };

  const handleDeleteSupplier = async (id: string) => {
      await db.deleteSupplier(id);
      setSuppliers(await db.getSuppliers());
      showNotification("Supplier vendor removed", 'success');
  };

  // Stock (async)
  const handleSaveStockItem = async (item: StockItem) => {
      await db.saveStock(item);
      setStockItems(await db.getStock());
      showNotification("Stock item saved", 'success');
  };

  const handleUpdateStock = async (id: string, delta: number) => {
     const item = stockItems.find(i => i.id === id);
     if (item) {
         await db.updateStock(id, Math.max(0, item.quantity + delta));
         setStockItems(await db.getStock());
     }
  };

  // Functions (async)
  const handleSaveFunction = async (func: FunctionBooking) => {
      await db.saveFunction(func);
      setFunctionBookings(await db.getFunctions());
      showNotification("Private function booked", 'success');
  };
  
  // Incidents (async)
  const handleSaveIncident = async (report: IncidentReport) => {
      await db.saveIncident(report);
      setIncidents(await db.getIncidents());
      showNotification("Incident logged securely", 'success');
  };

  // Lost & Found (async)
  const handleSaveLostItem = async (item: LostItem) => {
      await db.saveLostItem(item);
      setLostFound(await db.getLostFound());
      showNotification("Item updated in Lost & Found", 'success');
  };

  // TV Schedule (async)
  const handleSaveTVSchedule = async (item: TVScheduleItem) => {
    await db.saveTVScheduleItem(item);
    setTVSchedule(await db.getTVSchedule());
    showNotification("TV Listing saved", 'success');
  };

  const handleDeleteTVSchedule = async (id: string) => {
    await db.deleteTVScheduleItem(id);
    setTVSchedule(await db.getTVSchedule());
    showNotification("TV Listing removed", 'success');
  };

  const handleSaveStocktake = async (session: StocktakeSession) => {
    await db.saveStocktake(session);
    for (const item of session.items) {
      if (item.variance !== 0) {
        await db.updateStock(item.stockId, item.actual);
      }
    }
    setStocktakes(await db.getStocktakes());
    setStockItems(await db.getStock());
    showNotification("Stocktake completed", 'success');
  };

  const handleSaveOrder = async (order: PurchaseOrder) => {
    await db.saveOrder(order);
    setOrders(await db.getOrders());
    showNotification("Purchase order saved", 'success');
  };

  const handleTimePunch = async (punch: TimePunch) => {
    await db.saveTimePunch(punch);
    setTimePunches(await db.getTimePunches());
    showNotification(`Punched ${punch.type} successfully`, 'success');
  };

  const handleSaveBudget = async (budget: BudgetTracker) => {
    await db.saveBudget(budget);
    setBudgets(await db.getBudgets());
    showNotification("Budget targets saved", 'success');
  };

  const handleAICommand = async (command: string): Promise<string> => {
    setIsAIProcessing(true);
    try {
      const result = await parseNaturalLanguageCommand(command, events, teamMembers);
      
      if (result.action === 'CREATE' && result.eventData) {
        setEditingEvent(result.eventData);
        setIsModalOpen(true);
      } else if (result.action === 'UPDATE' && result.eventData && result.targetEventId) {
         const target = events.find(e => e.id === result.targetEventId);
         if (target) {
            setEditingEvent({ ...target, ...result.eventData });
            setIsModalOpen(true);
         }
      } else if (result.action === 'DELETE' && result.targetEventId) {
         await db.deleteEvent(result.targetEventId);
         setEvents(await db.getEvents());
      }
      
      setIsAIProcessing(false);
      return result.responseMessage;
    } catch (error) {
      console.error(error);
      setIsAIProcessing(false);
      return "Sorry, I encountered an error processing your request.";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-animated-gradient transition-colors">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500 shadow-lg mx-auto bg-black flex items-center justify-center">
            <img src="https://placehold.co/400x400/000000/D4AF37?text=CT" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading CTOS...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
      return <LoginScreen staff={teamMembers} onLogin={handleLogin} />;
  }



  // Determine dynamic container classes
  const containerClasses = "flex h-screen print:h-auto flex-col transition-colors duration-300 relative overflow-hidden bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-white";

  return (
    <div className={`${containerClasses}`}>


      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-4 ${notification.type === 'success' ? 'bg-gray-900 text-white dark:bg-white dark:text-slate-900' : 'bg-red-500 text-white'}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className={`flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl px-6 py-3 sticky top-0 z-30 overflow-x-auto custom-scrollbar flex-shrink-0 print:hidden shadow-sm`}>
        <div className="flex items-center space-x-4 flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3">
             <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                 appMode === "OFFICE" ? "border-indigo-500" : appMode === "FOH" ? "border-emerald-500" : "border-amber-500"
             } shadow-sm bg-black flex items-center justify-center flex-shrink-0`}>
               <img src="https://placehold.co/400x400/000000/D4AF37?text=CT" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <div className="hidden md:block">
                <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight whitespace-nowrap">CTOS</h1>
                    <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                        <span>{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
             </div>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
          
          {/* Mode Selection Buttons */}
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                  onClick={() => setExplicitMode('OFFICE')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${appMode === 'OFFICE' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
              >
                  OFFICE
              </button>
              <button 
                  onClick={() => setExplicitMode('FOH')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${appMode === 'FOH' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
              >
                  FOH
              </button>
              <button 
                  onClick={() => setExplicitMode('BOH')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${appMode === 'BOH' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
              >
                  BOH
              </button>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
          
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
             <CalendarIcon className="w-5 h-5" />
             <span className="font-medium">{formatDate(currentDate)}</span>
          </div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-mono">
             <ClockIcon className="w-5 h-5" />
             <span className="font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full" title="Toggle Dark Mode">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center space-x-3">
             <div className="relative">
                <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} alt={currentUser.name} className={`w-9 h-9 rounded-full border-2 ${isMasterAdmin(currentUser) ? "border-amber-500 shadow-md shadow-amber-500/20" : isAdminOrAbove(currentUser) ? "border-indigo-500" : "border-emerald-500"}`} />
                {isMasterAdmin(currentUser) && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full ring-2 ring-slate-900 shadow-sm" title="Master Admin">
                    <Crown className="w-3 h-3" />
                  </span>
                )}
             </div>
             <div className="hidden md:block text-right">
                 <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-end space-x-1">
                   <span>{currentUser.name}</span>
                   {isMasterAdmin(currentUser) ? (
                     <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-black rounded-md uppercase tracking-wider">Master</span>
                   ) : isAdminOrAbove(currentUser) ? (
                     <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-[10px] font-black rounded-md uppercase tracking-wider">Admin</span>
                   ) : (
                     <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md uppercase tracking-wider">Staff</span>
                   )}
                 </div>
                 <div className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</div>
                 <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-600 font-medium mt-0.5">Log Out</button>
             </div>
             
             {/* Mobile / Small Screen Logout Icon */}
             <button onClick={handleLogout} className="md:hidden p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Log Out">
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden print:overflow-visible">
        {/* Module Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out bg-white dark:bg-[#111827]/80 backdrop-blur-xl border-r border-gray-200 dark:border-white/5 overflow-y-auto custom-scrollbar relative z-20 print:hidden`}>
    <div className="p-4 space-y-2">
        {isFohMode ? (
            <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3 mt-4">Front of House</div>
                <button onClick={() => setCurrentModule("dashboard")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "dashboard" ? "bg-emerald-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <Home className="w-5 h-5" /><span>Service Hub</span>
                </button>
                <button onClick={() => setCurrentModule("browser")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "browser" ? "bg-emerald-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <Monitor className="w-5 h-5" /><span>POS System</span>
                </button>
                <button onClick={() => setCurrentModule("bookings")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "bookings" ? "bg-emerald-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <Utensils className="w-5 h-5" /><span>Table Reservations</span>
                </button>
                <button onClick={() => setCurrentModule("menus")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "menus" ? "bg-emerald-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <BookOpen className="w-5 h-5" /><span>Menus & Allergens</span>
                </button>
                <button onClick={() => setCurrentModule("tvschedule")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "tvschedule" ? "bg-emerald-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <Tv className="w-5 h-5" /><span>TV Guide</span>
                </button>
                <button onClick={() => setCurrentModule("timeclock")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "timeclock" ? "bg-emerald-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <ClockIcon className="w-5 h-5" /><span>Timeclock</span>
                </button>
            </div>
        ) : appMode === "BOH" ? (
            <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3 mt-4">Back of House</div>
                <button onClick={() => setCurrentModule("dashboard")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "dashboard" ? "bg-amber-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <Home className="w-5 h-5" /><span>Kitchen Hub</span>
                </button>
                <button onClick={() => setCurrentModule("recipes")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "recipes" ? "bg-amber-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <BookOpen className="w-5 h-5" /><span>Recipes</span>
                </button>
                <button onClick={() => setCurrentModule("menus")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "menus" ? "bg-amber-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <BookOpen className="w-5 h-5" /><span>Menus & Allergens</span>
                </button>
                <button onClick={() => setCurrentModule("maintenance")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "maintenance" ? "bg-amber-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <Wrench className="w-5 h-5" /><span>Maintenance</span>
                </button>
                <button onClick={() => setCurrentModule("timeclock")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "timeclock" ? "bg-amber-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <ClockIcon className="w-5 h-5" /><span>Timeclock</span>
                </button>
            </div>
        ) : (
            <div className="space-y-2 pb-10">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3 mt-4">Management</div>
                <button onClick={() => setCurrentModule("dashboard")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "dashboard" ? "bg-indigo-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <Home className="w-5 h-5" /><span>Dashboard</span>
                </button>
                
                {/* Financials & POS */}
                <div className="mb-2">
                    <button onClick={() => setOpenAccordion(openAccordion === "finance" ? null : "finance")} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${openAccordion === "finance" ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                        <div className="flex items-center space-x-3">
                            <DollarSign className="w-5 h-5" /><span>Financials & POS</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === "finance" ? "rotate-180" : ""}`} />
                    </button>
                    {openAccordion === "finance" && (
                        <div className="pl-12 pr-4 py-2 space-y-1">
                            {[{ id: "browser", label: "POS Terminal" }, { id: "finance", label: "Cashup & Recon" }, { id: "eodsales", label: "EOD Sales Entry" }, { id: "budgeting", label: "Budgeting" }].map(link => (
                                <button key={link.id} onClick={() => setCurrentModule(link.id)} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${currentModule === link.id ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                                    <span>{link.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Events & Bookings */}
                <div className="mb-2">
                    <button onClick={() => setOpenAccordion(openAccordion === "events" ? null : "events")} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${openAccordion === "events" ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                        <div className="flex items-center space-x-3">
                            <CalendarIcon className="w-5 h-5" /><span>Events & Bookings</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === "events" ? "rotate-180" : ""}`} />
                    </button>
                    {openAccordion === "events" && (
                        <div className="pl-12 pr-4 py-2 space-y-1">
                            {[{ id: "calendar", label: "Venue Calendar" }, { id: "bookings", label: "Table Reservations" }, { id: "functions", label: "Private Functions" }, { id: "entertainment", label: "Entertainment" }].map(link => (
                                <button key={link.id} onClick={() => setCurrentModule(link.id)} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${currentModule === link.id ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                                    <span>{link.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Staff & Labour */}
                <div className="mb-2">
                    <button onClick={() => setOpenAccordion(openAccordion === "staff" ? null : "staff")} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${openAccordion === "staff" ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                        <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5" /><span>Staff & Labour</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === "staff" ? "rotate-180" : ""}`} />
                    </button>
                    {openAccordion === "staff" && (
                        <div className="pl-12 pr-4 py-2 space-y-1">
                            {[{ id: "staff", label: "Team Directory" }, { id: "roster", label: "Rostering" }, { id: "timeclock", label: "Timeclock" }, { id: "timesheets", label: "Timesheets" }].map(link => (
                                <button key={link.id} onClick={() => setCurrentModule(link.id)} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${currentModule === link.id ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                                    <span>{link.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Inventory */}
                <div className="mb-2">
                    <button onClick={() => setOpenAccordion(openAccordion === "inventory" ? null : "inventory")} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${openAccordion === "inventory" ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                        <div className="flex items-center space-x-3">
                            <Boxes className="w-5 h-5" /><span>Inventory</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === "inventory" ? "rotate-180" : ""}`} />
                    </button>
                    {openAccordion === "inventory" && (
                        <div className="pl-12 pr-4 py-2 space-y-1">
                            {[{ id: "stock", label: "Products & Stock" }, { id: "menus", label: "Menus & Allergens" }, { id: "ordering", label: "Purchase Orders" }, { id: "stocktake", label: "Stocktaking" }, { id: "suppliers", label: "Suppliers" }, { id: "recipes", label: "Recipes" }].map(link => (
                                <button key={link.id} onClick={() => setCurrentModule(link.id)} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${currentModule === link.id ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                                    <span>{link.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Integrations & Screens */}
                <div className="mb-2">
                    <button onClick={() => setOpenAccordion(openAccordion === "integrations" ? null : "integrations")} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${openAccordion === "integrations" ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                        <div className="flex items-center space-x-3">
                            <Monitor className="w-5 h-5" /><span>Integrations & Screens</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === "integrations" ? "rotate-180" : ""}`} />
                    </button>
                    {openAccordion === "integrations" && (
                        <div className="pl-12 pr-4 py-2 space-y-1">
                            {[{ id: "media", label: "Adverts & Media" }, { id: "ctmatrix", label: "CT Matrix" }, { id: "ctsc", label: "CTSC Console" }].map(link => (
                                <button key={link.id} onClick={() => setCurrentModule(link.id)} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${currentModule === link.id ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                                    <span>{link.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Operations */}
                <div className="mb-2">
                    <button onClick={() => setOpenAccordion(openAccordion === "ops" ? null : "ops")} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${openAccordion === "ops" ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                        <div className="flex items-center space-x-3">
                            <Wrench className="w-5 h-5" /><span>Operations</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === "ops" ? "rotate-180" : ""}`} />
                    </button>
                    {openAccordion === "ops" && (
                        <div className="pl-12 pr-4 py-2 space-y-1">
                            {[{ id: "tvschedule", label: "TV Guide" }, { id: "incidents", label: "Incident Log" }, { id: "maintenance", label: "Maintenance" }, { id: "lostfound", label: "Lost & Found" }, { id: "documents", label: "Documents" }].map(link => (
                                <button key={link.id} onClick={() => setCurrentModule(link.id)} className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${currentModule === link.id ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                                    <span>{link.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {isMasterAdmin(currentUser) && (
                    <>
                    <div className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-3 px-3 mt-6 flex items-center space-x-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Master Admin</span>
                    </div>
                    <button onClick={() => setCurrentModule("settings")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentModule === "settings" ? "bg-amber-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                        <Settings className="w-5 h-5" /><span>System & Permissions</span>
                    </button>
                    <button onClick={() => setIsPublicUploadOpen(true)} className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition-all mt-1">
                        <UploadCloud className="w-4 h-4 text-amber-500" />
                        <span>Upload to Public Folder</span>
                    </button>
                    </>
                )}
            </div>
        )}
    </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden print:h-auto print:overflow-visible relative">
          
          {currentModule === 'category-hub' && currentCategoryHub && (
            <CategoryHubView 
                title={currentCategoryHub.title}
                description={currentCategoryHub.description}
                links={currentCategoryHub.links}
                onSelectModule={setCurrentModule}
            />
          )}

          {currentModule === 'eodsales' && (
              <EODSalesView 
                  stockItems={stockItems}
                  onSalesSubmitted={(data) => {
                      const newEodSales = [...eodSales, data];
                      setEodSales(newEodSales);
                      // Also deduct stock items
                      const updatedStock = [...stockItems];
                      data.itemsSold.forEach(sold => {
                          const item = updatedStock.find(i => i.id === sold.stockId);
                          if (item) {
                              item.quantity = Math.max(0, item.quantity - sold.quantity);
                          }
                      });
                      setStockItems(updatedStock);
                      setNotification({ message: 'EOD Sales Processed Successfully', type: 'success' });
                  }}
              />
          )}

          {currentModule === 'menus' && (
              <MenuView 
                  menus={menus}
                  onSaveMenu={(menu) => {
                      const exists = menus.find(m => m.id === menu.id);
                      if (exists) {
                          setMenus(menus.map(m => m.id === menu.id ? menu : m));
                      } else {
                          setMenus([...menus, menu]);
                      }
                  }}
                  onDeleteMenu={(id) => {
                      setMenus(menus.filter(m => m.id !== id));
                  }}
              />
          )}

          {currentModule === 'timeclock' && (
              <CTClockView
                  staff={teamMembers}
                  currentUser={currentUser}
                  onPunchSuccess={() => {
                      showNotification('Timeclock punch processed successfully', 'success');
                  }}
              />
          )}

          {currentModule === 'dashboard' && (
             <DashboardView 
               mode={appMode} 
               user={currentUser}
               events={events}
               entertainmentEvents={entertainmentEvents}
               tasks={maintenanceTasks}
               lowStock={stockItems.filter(i => i.quantity <= i.minLevel)}
               bookings={bookings}
               tvSchedule={tvSchedule}
               onNavigate={setCurrentModule}
             />
          )}

          {currentModule === 'calendar' && (
              <CalendarView 
                  events={events}
                  teamMembers={teamMembers}
                  isFohMode={isFohMode}
                  onEditLocation={handleEventClick}
                  onCreateEvent={handleCreateEvent}
                  onSync={handleGoogleSync}
              />
          )}

          {currentModule === 'roster' && (
             <div className="flex flex-col h-full">
                <div className="px-6 pt-6 print:hidden">
                    <ActionToolbar title="Staff Roster" isFohMode={isFohMode} onPrint={() => window.print()} />
                </div>
                <RosterView 
                    shifts={shifts} 
                    teamMembers={teamMembers} 
                    weekDays={weekDays} 
                    onAddShift={handleAddShift} 
                    leaveRequests={leaveRequests}
                    onRequestLeave={handleRequestLeave}
                    currentUser={currentUser}
                />
             </div>
          )}

          {currentModule === 'stock' && (
             <div className="flex flex-col h-full">
                <div className="px-6 pt-6 print:hidden">
                    <ActionToolbar title={stockFilter ? `${stockFilter.type} Products` : "Products"} isFohMode={isFohMode} onPrint={() => window.print()} />
                </div>
                <StockView 
                  items={stockItems} 
                  suppliers={suppliers} 
                  onSaveItem={handleSaveStockItem} 
                  onUpdateQuantity={handleUpdateStock} 
                  filterType={stockFilter?.type}
                  groupBy={stockFilter?.group}
                />
             </div>
          )}

          {(currentModule === 'finance' || currentModule === 'invoices') && (
             <div className="flex flex-col h-full bg-transparent">
                <div className="px-6 pt-6">
                    <ActionToolbar title={currentModule === 'invoices' ? "Invoices & Delivery" : "Finance"} isFohMode={isFohMode} />
                </div>
                <FinanceView records={financeRecords} staff={teamMembers} initialTab={currentModule === 'invoices' ? 'invoices' : 'history'} />
             </div>
          )}

          {currentModule === 'bookings' && (
             <div className="flex flex-col h-full bg-transparent">
                <div className="px-6 pt-6">
                    <ActionToolbar title="Reservations" isFohMode={isFohMode} />
                </div>
                <BookingsView 
                  bookings={bookings} 
                  onSaveBooking={handleSaveBooking}
                  onDeleteBooking={handleDeleteBooking}
                />
             </div>
          )}
          
          {currentModule === 'browser' && <BrowserView />}
          
          {currentModule === 'weather' && <WeatherView />}
          
          {currentModule === 'documents' && (
             <DocumentsView 
               files={files} 
               onSaveFile={handleSaveFile} 
               onDeleteFile={handleDeleteFile} 
             />
          )}

          {currentModule === 'recipes' && <RecipesView recipes={recipes} onSave={handleSaveRecipe} onDelete={handleDeleteRecipe} />}
          {currentModule === 'incidents' && <IncidentLogView incidents={incidents} staff={teamMembers} currentUser={currentUser} onSave={handleSaveIncident} />}
          {currentModule === 'lostfound' && <LostAndFoundView items={lostFound} staff={teamMembers} currentUser={currentUser} onSave={handleSaveLostItem} />}
          {currentModule === 'tvschedule' && <TVScheduleView schedule={tvSchedule} onSave={handleSaveTVSchedule} onDelete={handleDeleteTVSchedule} />}
          {currentModule === 'gemini' && <GeminiNotebookView />}
          {currentModule === 'ctsc' && <CTSCAppView />}
          {currentModule === 'ctmatrix' && <CTMatrixControlView />}

          {currentModule === 'media' && <MediaView />}
          {currentModule === 'timesheets' && <TimesheetsView staff={teamMembers} shifts={shifts} onSave={handleSaveTimesheet} />}

          {currentModule === 'entertainment' && <EntertainmentView events={entertainmentEvents} onSave={handleSaveEntertainment} onDelete={handleDeleteEntertainment} />}
          {currentModule === 'functions' && <FunctionsView functions={functionBookings} onSaveFunction={handleSaveFunction} />}
          {currentModule === 'staff' && (
             <StaffDirectory 
               staff={teamMembers} 
               currentUser={currentUser}
               onSaveStaff={handleSaveStaff} 
               onDeleteStaff={handleDeleteStaff} 
             />
          )}
          {currentModule === 'suppliers' && <SuppliersView suppliers={suppliers} onSave={handleSaveSupplier} onDelete={handleDeleteSupplier} />}
          {currentModule === 'maintenance' && (
            <MaintenanceView 
              tasks={maintenanceTasks} 
              onUpdateStatus={async (id, s) => { 
                const task = maintenanceTasks.find(t => t.id === id); 
                if(task) { 
                  task.status = s; 
                  await db.saveMaintenanceTask(task); 
                  setMaintenanceTasks(await db.getMaintenance()); 
                }
              }} 
              onSaveTask={async (newTask) => {
                await db.saveMaintenanceTask(newTask);
                setMaintenanceTasks(await db.getMaintenance());
              }}
              onDeleteTask={async (taskId) => {
                await db.deleteMaintenanceTask(taskId);
                setMaintenanceTasks(await db.getMaintenance());
              }}
            />
          )}
          
          {currentModule === 'stocktake' && <StocktakeView items={stockItems} currentUser={currentUser!} onCommit={handleSaveStocktake} />}
          {currentModule === 'ordering' && <OrderingView orders={orders} suppliers={suppliers} stockItems={stockItems} onSaveOrder={handleSaveOrder} />}
          {currentModule === 'budgeting' && <BudgetingView budgets={budgets} onSaveBudget={handleSaveBudget} />}
          {currentModule === 'settings' && <SettingsView onShowNotification={showNotification} />}

        </main>
      </div>

      <AIAssistant onCommand={handleAICommand} isProcessing={isAIProcessing} />
      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} onDelete={handleDeleteEvent} initialEvent={editingEvent} teamMembers={teamMembers} />
      <PublicFolderUploadModal isOpen={isPublicUploadOpen} onClose={() => setIsPublicUploadOpen(false)} onShowNotification={showNotification} />
    </div>
  );
};

export default App;
