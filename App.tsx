
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Menu, Bell, Settings, Search, Plus, Moon, Sun, Download, LogIn, LogOut,
  Users, ClipboardList, Utensils, Boxes, Share2, LayoutGrid, Truck, Wrench,
  Music, PartyPopper, DollarSign, Globe, Monitor, FileText, FolderOpen, Home,
  BookOpen, ShieldAlert, Umbrella, Tv, Loader2, Clock as ClockIcon, TrendingUp
} from 'lucide-react';
import { TeamMember, CalendarEvent, ViewMode, UserProfile, AppModule, AppMode, RosterShift, StockItem, Booking, Supplier, MaintenanceTask, EntertainmentEvent, FunctionBooking, CashUpRecord, FileItem, LeaveRequest, Recipe, IncidentReport, LostItem, TVScheduleItem, MediaSlide, TimesheetEntry } from './types';
import MediaView from './components/MediaView';
import TimesheetsView from './components/TimesheetsView';
import { db } from './services/database';
import { 
  addDays, getStartOfWeek, formatTime, 
  isSameDay, formatDate, generateId 
} from './utils';
import { HOURS, INITIAL_EVENTS, INITIAL_SHIFTS, INITIAL_STOCK, INITIAL_BOOKINGS, INITIAL_SUPPLIERS, INITIAL_MAINTENANCE, INITIAL_ENTERTAINMENT, INITIAL_FUNCTIONS, INITIAL_FINANCE, TEAM_MEMBERS, INITIAL_FILES, INITIAL_LEAVE, INITIAL_INVOICES, INITIAL_RECIPES, INITIAL_INCIDENTS, INITIAL_LOST_FOUND, INITIAL_TV_SCHEDULE } from './constants';
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
import RecipesView from './components/RecipesView';
import StockView from './components/StockView';
import SuppliersView from './components/SuppliersView';
import MaintenanceView from './components/MaintenanceView';
import IncidentLogView from './components/IncidentLogView';
import LostAndFoundView from './components/LostAndFoundView';
import BrowserView from './components/BrowserView';
import DocumentsView from './components/DocumentsView';
import LoginScreen from './components/LoginScreen';
import ActionToolbar from './components/ActionToolbar';
import WeatherView from './components/WeatherView';
import CalendarView from './components/CalendarView';
import { parseNaturalLanguageCommand } from './services/geminiService';
import { initGoogleClient, handleGoogleLogin, importGoogleCalendarEvents } from './services/googleService';

import TimeclockView from './components/TimeclockView';
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
  const [currentModule, setCurrentModule] = useState<AppModule>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        // Fallback to local constants if database is down
        setTeamMembers(TEAM_MEMBERS);
        setEvents(INITIAL_EVENTS);
        setShifts(INITIAL_SHIFTS);
        setLeaveRequests(INITIAL_LEAVE);
        setStockItems(INITIAL_STOCK);
        setBookings(INITIAL_BOOKINGS);
        setSuppliers(INITIAL_SUPPLIERS);
        setMaintenanceTasks(INITIAL_MAINTENANCE);
        setEntertainmentEvents(INITIAL_ENTERTAINMENT);
        setFunctionBookings(INITIAL_FUNCTIONS);
        setFinanceRecords(INITIAL_FINANCE);
        setFiles(INITIAL_FILES);
        setRecipes(INITIAL_RECIPES);
        setIncidents(INITIAL_INCIDENTS);
        setLostFound(INITIAL_LOST_FOUND);
        setTVSchedule(INITIAL_TV_SCHEDULE);
        setStocktakes(INITIAL_STOCKTAKES);
        setOrders(INITIAL_ORDERS);
        setTimePunches(INITIAL_TIME_PUNCHES);
        setBudgets(INITIAL_BUDGETS);
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
       setCurrentModule('dashboard');
  };

  const handleLogin = (member: TeamMember) => {
      setCurrentUser(member);
      // Auto-set mode based on role
      if (member.role === 'Front of House') {
          setAppMode('FOH');
      } else if (['Head Chef', 'Chef', 'Kitchen Hand'].includes(member.role)) {
          setAppMode('BOH');
      } else {
          setAppMode('OFFICE'); 
      }
      setIsSidebarOpen(true);
      setCurrentModule('dashboard');
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
  const handleAddShift = async (day: Date, memberId: string) => {
      if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Duty Manager') {
          showNotification("Only Managers can add shifts.", 'error');
          return;
      }
      const newShift: RosterShift = {
          id: generateId(),
          staffId: memberId,
          start: new Date(day.setHours(12, 0)),
          end: new Date(day.setHours(20, 0)),
          role: 'Shift'
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

  // Stock (async)
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
    showNotification("TV Listing Added", 'success');
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
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
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



  // Add a global class for demo highlighting to the main container
  return (
    <div className={`flex h-screen print:h-auto flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 ${isFohMode ? 'text-lg' : ''} demo-highlighting-active`}>
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-4 ${notification.type === 'success' ? 'bg-gray-900 text-white dark:bg-white dark:text-slate-900' : 'bg-red-500 text-white'}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className={`flex items-center justify-between border-b ${
          themeColor === 'red' ? 'border-red-500/20' : 
          themeColor === 'amber' ? 'border-amber-500/20' : 
          'border-blue-500/20'
      } bg-white dark:bg-slate-900 px-6 py-3 sticky top-0 z-30 overflow-x-auto custom-scrollbar flex-shrink-0 print:hidden`}>
        <div className="flex items-center space-x-4 flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3">
             <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                 themeColor === 'red' ? 'border-red-500' : 
                 themeColor === 'amber' ? 'border-amber-500' : 
                 'border-blue-500'
             } shadow-sm bg-black flex items-center justify-center flex-shrink-0`}>
               <img src="https://placehold.co/400x400/000000/D4AF37?text=CT" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <div className="hidden md:block">
                <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight whitespace-nowrap">Coasters Tavern</h1>
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
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${appMode === 'OFFICE' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
              >
                  OFFICE
              </button>
              <button 
                  onClick={() => setExplicitMode('FOH')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${appMode === 'FOH' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
              >
                  FOH
              </button>
              <button 
                  onClick={() => setExplicitMode('BOH')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${appMode === 'BOH' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
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
             <img src={currentUser.avatar} alt={currentUser.name} className={`w-8 h-8 rounded-full border-2 ${isFohMode ? 'border-blue-400' : 'border-red-400'}`} />
             <div className="hidden md:block text-right">
                 <div className="text-sm font-bold text-gray-900 dark:text-white">{currentUser.name}</div>
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
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-50 dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 overflow-y-auto flex-shrink-0 flex flex-col print:hidden`}>
           <div className="p-4 space-y-2">
                {isFohMode ? (
                    <div className="space-y-6">
                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-2">Service</div>
                        <button onClick={() => setCurrentModule('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <Home className="w-6 h-6" /><span>Home</span>
                        </button>
                        <button onClick={() => setCurrentModule('browser')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'browser' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <Monitor className="w-6 h-6" /><span>POS / Browser</span>
                        </button>
                        <button onClick={() => setCurrentModule('bookings')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'bookings' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <Utensils className="w-6 h-6" /><span>Reservations</span>
                        </button>
                      </section>

                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-2">Entertainment</div>
                        <button onClick={() => setCurrentModule('tvschedule')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'tvschedule' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <Tv className="w-6 h-6" /><span>TV Guide</span>
                        </button>
                        <button onClick={() => setCurrentModule('entertainment')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'entertainment' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <Music className="w-6 h-6" /><span>Band Calendar</span>
                        </button>
                      </section>

                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-2">Staff & Kitchen</div>
                        <button onClick={() => setCurrentModule('recipes')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'recipes' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <BookOpen className="w-6 h-6" /><span>Recipes</span>
                        </button>
                        <button onClick={() => setCurrentModule('roster')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'roster' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <ClipboardList className="w-6 h-6" /><span>My Roster</span>
                        </button>
                      </section>

                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-2">Reporting</div>
                        <button onClick={() => setCurrentModule('incidents')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'incidents' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <ShieldAlert className="w-6 h-6" /><span>Incident Log</span>
                        </button>
                        <button onClick={() => setCurrentModule('lostfound')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'lostfound' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <Umbrella className="w-6 h-6" /><span>Lost & Found</span>
                        </button>
                        <button onClick={() => setCurrentModule('maintenance')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'maintenance' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <Wrench className="w-6 h-6" /><span>Report Issue</span>
                        </button>
                      </section>
                    </div>
                ) : appMode === 'BOH' ? (
                    /* BOH MODE MENU */
                    <div className="space-y-6">
                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-2">Kitchen Operations</div>
                        <button onClick={() => setCurrentModule('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'dashboard' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <Home className="w-6 h-6" /><span>Kitchen Home</span>
                        </button>
                        <button onClick={() => setCurrentModule('recipes')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'recipes' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <BookOpen className="w-6 h-6" /><span>Food Recipes</span>
                        </button>
                        <button onClick={() => setCurrentModule('roster')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'roster' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <ClipboardList className="w-6 h-6" /><span>Kitchen Roster</span>
                        </button>
                      </section>

                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-2">Inventory & Supply</div>
                        <button onClick={() => setCurrentModule('stock')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'stock' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <Boxes className="w-6 h-6" /><span>Stock Levels</span>
                        </button>
                      </section>

                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-2">Reporting</div>
                        <button onClick={() => setCurrentModule('incidents')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'incidents' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <ShieldAlert className="w-6 h-6" /><span>Incident Log</span>
                        </button>
                        <button onClick={() => setCurrentModule('maintenance')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'maintenance' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                            <Wrench className="w-6 h-6" /><span>Equipment Issue</span>
                        </button>
                      </section>
                    </div>
                ) : (
                    /* OFFICE MODE MENU */
                    <div className="space-y-4 pb-10">
                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-2">Overview</div>
                        <button onClick={() => setCurrentModule('dashboard')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentModule === 'dashboard' ? 'bg-red-500 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                            <Home className="w-5 h-5" /><span>Dashboard</span>
                        </button>
                      </section>

                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-2">Product</div>
                        {[
                            { id: 'stock', label: 'Stock', icon: Boxes },
                            { id: 'stocktake', label: 'Stocktaking', icon: ClipboardList },
                            { id: 'ordering', label: 'Ordering', icon: Truck },
                            { id: 'recipes', label: 'Recipes', icon: BookOpen },
                        ].map((item) => (
                            <button key={item.id} onClick={() => setCurrentModule(item.id as AppModule)} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentModule === item.id ? 'bg-red-500 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                                <item.icon className="w-5 h-5" /><span>{item.label}</span>
                            </button>
                        ))}
                      </section>

                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-2">Labour</div>
                        {[
                            { id: 'staff', label: 'Management', icon: Users },
                            { id: 'timeclock', label: 'Timeclock', icon: ClockIcon },
                            { id: 'timesheets', label: 'Timesheets', icon: FileText },
                            { id: 'roster', label: 'Rosters', icon: ClipboardList },
                        ].map((item) => (
                            <button key={item.id} onClick={() => setCurrentModule(item.id as AppModule)} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentModule === item.id ? 'bg-red-500 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                                <item.icon className="w-5 h-5" /><span>{item.label}</span>
                            </button>
                        ))}
                      </section>

                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-2">Revenue</div>
                        {[
                            { id: 'finance', label: 'Cashup & Recon.', icon: DollarSign },
                            { id: 'dashboard', label: 'Dashboard', icon: Home },
                            { id: 'budgeting', label: 'Budgeting', icon: TrendingUp },
                        ].map((item) => (
                            <button key={item.id} onClick={() => setCurrentModule(item.id as AppModule)} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentModule === item.id ? 'bg-red-500 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                                <item.icon className="w-5 h-5" /><span>{item.label}</span>
                            </button>
                        ))}
                      </section>

                      <section>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-2">Operations</div>
                        {[
                            { id: 'calendar', label: 'Venue Calendar', icon: CalendarIcon },
                            { id: 'bookings', label: 'Table Reservations', icon: Utensils },
                            { id: 'functions', label: 'Private Functions', icon: PartyPopper },
                            { id: 'entertainment', label: 'Entertainment', icon: Music },
                            { id: 'suppliers', label: 'Suppliers', icon: Truck },
                            { id: 'invoices', label: 'Invoices', icon: FileText },
                            { id: 'incidents', label: 'Incident Log', icon: ShieldAlert },
                            { id: 'maintenance', label: 'Maintenance Issues', icon: Wrench },
                            { id: 'documents', label: 'Docs & Files (Dropbox)', icon: FolderOpen },
                            { id: 'browser', label: 'POS / Browser', icon: Globe },
                            { id: 'media', label: 'Adverts & Slides', icon: Share2 },
                            { id: 'tvschedule', label: 'TV Guide', icon: Tv },
                            { id: 'weather', label: 'Live Weather', icon: Globe },
                            { id: 'lostfound', label: 'Lost & Found', icon: Umbrella },
                        ].map((item) => (
                            <button key={item.id} onClick={() => setCurrentModule(item.id as AppModule)} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentModule === item.id ? 'bg-red-500 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                                <item.icon className="w-5 h-5" /><span>{item.label}</span>
                            </button>
                        ))}
                      </section>
                    </div>
               )}
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden print:h-auto print:overflow-visible relative bg-white dark:bg-slate-900">
          
          {currentModule === 'dashboard' && (
             <DashboardView 
               mode={appMode} 
               user={currentUser}
               events={events}
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
                <div className="px-6 pt-6">
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
                <div className="px-6 pt-6">
                    <ActionToolbar title="Stock Control" isFohMode={isFohMode} />
                </div>
                <StockView items={stockItems} onUpdateQuantity={handleUpdateStock} />
             </div>
          )}

          {currentModule === 'finance' && (
             <div className="flex flex-col h-full">
                <div className="px-6 pt-6">
                    <ActionToolbar title="Finance" isFohMode={isFohMode} />
                </div>
                <FinanceView records={financeRecords} staff={teamMembers} />
             </div>
          )}

          {currentModule === 'bookings' && (
             <div className="flex flex-col h-full">
                <div className="px-6 pt-6">
                    <ActionToolbar title="Reservations" isFohMode={isFohMode} />
                </div>
                <BookingsView bookings={bookings} />
             </div>
          )}
          
          {currentModule === 'browser' && <BrowserView />}
          
          {currentModule === 'weather' && <WeatherView />}
          
          {currentModule === 'documents' && <DocumentsView files={files} />}

          {currentModule === 'recipes' && <RecipesView recipes={recipes} />}
          {currentModule === 'incidents' && <IncidentLogView incidents={incidents} staff={teamMembers} currentUser={currentUser} onSave={handleSaveIncident} />}
          {currentModule === 'lostfound' && <LostAndFoundView items={lostFound} staff={teamMembers} currentUser={currentUser} onSave={handleSaveLostItem} />}
          {currentModule === 'tvschedule' && <TVScheduleView schedule={tvSchedule} onSave={handleSaveTVSchedule} />}

          {currentModule === 'media' && <MediaView />}
          {currentModule === 'timesheets' && <TimesheetsView staff={teamMembers} shifts={shifts} onSave={handleSaveTimesheet} />}

          {currentModule === 'entertainment' && <EntertainmentView events={entertainmentEvents} />}
          {currentModule === 'functions' && <FunctionsView functions={functionBookings} onSaveFunction={handleSaveFunction} />}
          {currentModule === 'staff' && <StaffDirectory staff={teamMembers} />}
          {currentModule === 'suppliers' && <SuppliersView suppliers={suppliers} />}
          {currentModule === 'maintenance' && <MaintenanceView tasks={maintenanceTasks} onUpdateStatus={async (id, s) => { 
              const task = maintenanceTasks.find(t => t.id === id); 
              if(task) { 
                  task.status = s; 
                  await db.saveMaintenanceTask(task); 
                  setMaintenanceTasks(await db.getMaintenance()); 
              }
          }} />}
          
          {currentModule === 'timeclock' && <TimeclockView staff={teamMembers} onPunch={handleTimePunch} />}
          {currentModule === 'stocktake' && <StocktakeView items={stockItems} currentUser={currentUser!} onCommit={handleSaveStocktake} />}
          {currentModule === 'ordering' && <OrderingView orders={orders} suppliers={suppliers} stockItems={stockItems} onSaveOrder={handleSaveOrder} />}
          {currentModule === 'budgeting' && <BudgetingView budgets={budgets} onSaveBudget={handleSaveBudget} />}

        </main>
      </div>

      <AIAssistant onCommand={handleAICommand} isProcessing={isAIProcessing} />
      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} onDelete={handleDeleteEvent} initialEvent={editingEvent} teamMembers={teamMembers} />
    </div>
  );
};

export default App;
