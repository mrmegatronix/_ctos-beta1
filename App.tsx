
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Menu, Bell, Settings, Search, Plus, Moon, Sun, Download, LogIn, LogOut,
  Users, ClipboardList, Utensils, Boxes, Share2, LayoutGrid, Truck, Wrench,
  Music, PartyPopper, DollarSign, Globe, Monitor, FileText, FolderOpen, Home,
  BookOpen, ShieldAlert, Umbrella, Tv, Loader2
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
import { parseNaturalLanguageCommand } from './services/geminiService';
import { initGoogleClient, handleGoogleLogin, importGoogleCalendarEvents } from './services/googleService';

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

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.WEEK);
  
  // UI State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | undefined>(undefined);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [googleUser, setGoogleUser] = useState<UserProfile | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Dark Mode side-effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
          recipesData, incidentsData, lostFoundData, tvData
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
      } catch (err) {
        console.error('[CTOS] Firestore unavailable:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    initGoogleClient(() => console.log('Google Client initialized'));
  }, []);

  // --- Helpers ---
  const weekStart = useMemo(() => getStartOfWeek(currentDate), [currentDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const visibleMemberIds = teamMembers.filter(m => m.visible).map(m => m.id);
  const filteredEvents = useMemo(() => events.filter(e => e.attendeeIds.length === 0 || e.attendeeIds.some(id => visibleMemberIds.includes(id))), [events, visibleMemberIds]);
  const isFohMode = appMode === 'FOH';
  
  // Theme Logic
  const themeColor = isFohMode ? 'amber' : 'indigo';
  const themeText = isFohMode ? 'text-amber-600' : 'text-indigo-600';
  const themeBg = isFohMode ? 'bg-amber-600' : 'bg-indigo-600';
  const themeLightBg = isFohMode ? 'bg-amber-100' : 'bg-indigo-100';

  // --- Handlers ---
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = (member: TeamMember) => {
      setCurrentUser(member);
      // Auto-set mode based on role
      if (member.role === 'Front of House') {
          setAppMode('FOH');
          setIsSidebarOpen(false);
          setCurrentModule('dashboard');
      } else {
          setAppMode('OFFICE'); // Managers default to Office but can switch
          setIsSidebarOpen(true);
      }
      showNotification(`Welcome, ${member.name}`, 'success');
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setAppMode('OFFICE'); // Reset mode
      setCurrentModule('dashboard');
  };

  const toggleMode = () => {
      const newMode = appMode === 'OFFICE' ? 'FOH' : 'OFFICE';
      
      // Permission Check
      if (newMode === 'OFFICE' && currentUser) {
          if (currentUser.role !== 'Admin' && currentUser.role !== 'Duty Manager') {
              showNotification("Access Denied: Office Mode restricted to Managers.", 'error');
              return;
          }
      }

      setAppMode(newMode);
      showNotification(`Switched to ${newMode === 'OFFICE' ? 'Office' : 'Front of House'} Mode`, 'success');
      
      // Auto-switch sidebar and module for better UX
      if (newMode === 'FOH') {
          setIsSidebarOpen(false); 
          setCurrentModule('dashboard');
      } else {
          setIsSidebarOpen(true);
          setCurrentModule('dashboard');
      }
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

  // --- Loading Screen ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
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
    <div className={`flex h-screen flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 ${isFohMode ? 'text-lg' : ''} demo-highlighting-active`}>
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-4 ${notification.type === 'success' ? 'bg-gray-900 text-white dark:bg-white dark:text-slate-900' : 'bg-red-500 text-white'}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className={`flex items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 sticky top-0 z-30 ${isFohMode ? 'h-24' : ''}`}>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3">
             <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isFohMode ? 'border-blue-500' : 'border-red-500'} shadow-sm bg-black flex items-center justify-center`}>
               <img src="https://placehold.co/400x400/000000/D4AF37?text=CT" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <div className="hidden md:block">
                <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Coasters Tavern</h1>
                    <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                        <span>{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isFohMode ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                        {appMode} MODE
                    </span>
                    <button onClick={toggleMode} className="text-xs text-gray-400 hover:text-gray-600 underline">Switch</button>
                </div>
             </div>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
          
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
             <CalendarIcon className="w-5 h-5" />
             <span className="font-medium">{formatDate(currentDate)}</span>
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

      <div className="flex flex-1 overflow-hidden">
        {/* Module Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-50 dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 overflow-y-auto flex-shrink-0 flex flex-col`}>
           <div className="p-4 space-y-2">
               {/* FOH MODE MENU */}
               {isFohMode ? (
                   <>
                     <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">Front of House</div>
                     <button onClick={() => setCurrentModule('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                         <Home className="w-6 h-6" /><span>Home</span>
                     </button>
                     <button onClick={() => setCurrentModule('browser')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'browser' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                         <Monitor className="w-6 h-6" /><span>POS / Browser</span>
                     </button>
                     <button onClick={() => setCurrentModule('tvschedule')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'tvschedule' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                         <Tv className="w-6 h-6" /><span>TV Guide</span>
                     </button>
                     <button onClick={() => setCurrentModule('recipes')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'recipes' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                         <BookOpen className="w-6 h-6" /><span>Recipes</span>
                     </button>
                     <button onClick={() => setCurrentModule('bookings')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'bookings' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                         <Utensils className="w-6 h-6" /><span>Bookings</span>
                     </button>
                     <button onClick={() => setCurrentModule('roster')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'roster' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                         <ClipboardList className="w-6 h-6" /><span>My Roster</span>
                     </button>
                     <button onClick={() => setCurrentModule('incidents')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'incidents' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                         <ShieldAlert className="w-6 h-6" /><span>Incident Log</span>
                     </button>
                     <button onClick={() => setCurrentModule('lostfound')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'lostfound' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                         <Umbrella className="w-6 h-6" /><span>Lost & Found</span>
                     </button>
                     <button onClick={() => setCurrentModule('maintenance')} className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-lg font-bold mb-2 ${currentModule === 'maintenance' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                         <Wrench className="w-6 h-6" /><span>Report Issue</span>
                     </button>
                   </>
               ) : (
                   /* OFFICE MODE MENU */
                   <>
                    <button onClick={() => setCurrentModule('dashboard')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentModule === 'dashboard' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                         <Home className="w-5 h-5" /><span>Dashboard</span>
                    </button>

                    <div className="pt-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">Staff & Rosters</div>
                    {[
                        { id: 'roster', label: 'Shift Roster', icon: ClipboardList },
                        { id: 'staff', label: 'Staff Directory', icon: Users },
                        { id: 'timesheets', label: 'Staff Timesheets', icon: FileText },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setCurrentModule(item.id as AppModule)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentModule === item.id ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                             <item.icon className="w-5 h-5" /><span>{item.label}</span>
                        </button>
                    ))}

                    <div className="pt-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">Financials</div>
                    {[
                        { id: 'finance', label: 'Cash Up / Finance', icon: DollarSign },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setCurrentModule(item.id as AppModule)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentModule === item.id ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                             <item.icon className="w-5 h-5" /><span>{item.label}</span>
                        </button>
                    ))}

                    <div className="pt-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">Bookings & Entertainment</div>
                    {[
                        { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
                        { id: 'bookings', label: 'Reservations', icon: Utensils },
                        { id: 'entertainment', label: 'Music & Events', icon: Music },
                        { id: 'functions', label: 'Private Functions', icon: PartyPopper },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setCurrentModule(item.id as AppModule)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentModule === item.id ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                             <item.icon className="w-5 h-5" /><span>{item.label}</span>
                        </button>
                    ))}

                    <div className="pt-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">Media & Adverts</div>
                    {[
                        { id: 'media', label: 'Adverts & Slides', icon: Share2 },
                        { id: 'tvschedule', label: 'TV Guide', icon: Tv },
                        { id: 'recipes', label: 'Recipe Book', icon: BookOpen },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setCurrentModule(item.id as AppModule)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentModule === item.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                             <item.icon className="w-5 h-5" /><span>{item.label}</span>
                        </button>
                    ))}

                    <div className="pt-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">Operations</div>
                    {[
                        { id: 'stock', label: 'Inventory / Stock', icon: Boxes },
                        { id: 'suppliers', label: 'Suppliers', icon: Truck },
                        { id: 'maintenance', label: 'Maintenance / Issues', icon: Wrench },
                        { id: 'incidents', label: 'Incident Log', icon: ShieldAlert },
                        { id: 'lostfound', label: 'Lost & Found', icon: Umbrella },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setCurrentModule(item.id as AppModule)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentModule === item.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                             <item.icon className="w-5 h-5" /><span>{item.label}</span>
                        </button>
                    ))}

                    <div className="pt-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">Tools</div>
                    {[
                        { id: 'browser', label: 'Web / POS', icon: Globe },
                        { id: 'documents', label: 'Docs & Files', icon: FolderOpen },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setCurrentModule(item.id as AppModule)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentModule === item.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                             <item.icon className="w-5 h-5" /><span>{item.label}</span>
                        </button>
                    ))}
                   </>
               )}
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-slate-900">
          
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
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                   <ActionToolbar 
                      title="Calendar" 
                      onEdit={() => handleCreateEvent()} 
                      onPrint={() => window.print()}
                      onSync={() => handleGoogleSync()}
                      isFohMode={isFohMode}
                   />
                </div>
                {/* Calendar Grid Implementation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
                    <div className="flex min-h-[1000px]">
                    <div className="w-14 flex-shrink-0 border-r border-gray-200 dark:border-slate-800 sticky left-0 z-20 bg-white dark:bg-slate-900">{HOURS.map(h => <div key={h} className="h-16 relative"><span className="absolute -top-3 right-2 text-xs text-gray-400">{h === 0 ? '12A' : h < 12 ? `${h}A` : h === 12 ? '12P' : `${h-12}P`}</span></div>)}</div>
                    <div className="flex-1 flex relative">
                        {weekDays.map((day, i) => (
                            <div key={i} className="flex-1 border-l border-gray-100 dark:border-slate-800 relative group first:border-l-0">
                                <div className="sticky top-0 bg-gray-50 dark:bg-slate-800 z-10 text-center py-2 text-xs font-bold uppercase border-b border-gray-200 dark:border-slate-700">
                                    {formatDate(day)}
                                </div>
                                {HOURS.map(h => <div key={h} className="h-16 hover:bg-gray-50 dark:hover:bg-slate-800/50" />)}
                                {filteredEvents.filter(e => isSameDay(e.start, day)).map(e => {
                                    const startHour = e.start.getHours() + e.start.getMinutes() / 60;
                                    const endHour = e.end.getHours() + e.end.getMinutes() / 60;
                                    const height = Math.max((endHour - startHour) * 64, 32);
                                    const top = startHour * 64 + 32; // +32 for header
                                    const styleClass = e.source === 'google' 
                                        ? 'bg-green-100 text-green-800 border-green-500 dark:bg-green-900/30 dark:text-green-200' 
                                        : `${themeLightBg} ${isFohMode ? 'text-amber-800 border-amber-500' : 'text-indigo-800 border-indigo-500'}`;
                                    
                                    return <div key={e.id} onClick={(ev) => { ev.stopPropagation(); handleEventClick(e); }} className={`absolute left-1 right-1 rounded-md p-1 text-xs cursor-pointer overflow-hidden border-l-4 ${styleClass}`} style={{ top: `${top}px`, height: `${height}px` }}>{e.title}</div>;
                                })}
                            </div>
                        ))}
                    </div>
                    </div>
                </div>
              </div>
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

        </main>
      </div>

      <AIAssistant onCommand={handleAICommand} isProcessing={isAIProcessing} />
      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} onDelete={handleDeleteEvent} initialEvent={editingEvent} teamMembers={teamMembers} />
    </div>
  );
};

export default App;
