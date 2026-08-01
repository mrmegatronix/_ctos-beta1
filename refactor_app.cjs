const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// Find the aside tag
const asideRegex = /<aside className=\{`\$\{isSidebarOpen \? 'w-64' : 'w-0'\}[\s\S]*?<\/aside>/;

const newSidebar = `<aside className={\`\${isSidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 overflow-y-auto custom-scrollbar relative z-20 print:hidden\`}>
    <div className="p-4 space-y-2">
        {isFohMode ? (
            <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3 mt-4">Front of House</div>
                <button onClick={() => setCurrentModule('dashboard')} className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${currentModule === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
                    <Home className="w-5 h-5" /><span>Service Hub</span>
                </button>
                <button onClick={() => setCurrentModule('browser')} className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${currentModule === 'browser' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
                    <Monitor className="w-5 h-5" /><span>POS System</span>
                </button>
            </div>
        ) : appMode === 'BOH' ? (
            <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3 mt-4">Back of House</div>
                <button onClick={() => setCurrentModule('dashboard')} className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${currentModule === 'dashboard' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
                    <Home className="w-5 h-5" /><span>Kitchen Hub</span>
                </button>
                <button onClick={() => setCurrentModule('recipes')} className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${currentModule === 'recipes' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
                    <BookOpen className="w-5 h-5" /><span>Recipes</span>
                </button>
            </div>
        ) : (
            <div className="space-y-2 pb-10">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3 mt-4">Management</div>
                <button onClick={() => setCurrentModule('dashboard')} className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${currentModule === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
                    <Home className="w-5 h-5" /><span>Dashboard</span>
                </button>
                
                <button onClick={() => {
                    setCurrentCategoryHub({
                        title: 'Financials & POS',
                        description: 'Manage cash flow, banking, budgets, and daily takings.',
                        links: [
                            { id: 'browser', label: 'POS Terminal', icon: Globe, description: 'Access the main point of sale interface' },
                            { id: 'finance', label: 'Cashup & Recon', icon: DollarSign, description: 'End of day till balancing and safe counts' },
                            { id: 'eodsales', label: 'EOD Sales Entry', icon: TrendingUp, description: 'Input daily sales to update inventory' },
                            { id: 'budgeting', label: 'Budgeting', icon: TrendingUp, description: 'Track actuals against targets' }
                        ]
                    });
                    setCurrentModule('category-hub');
                }} className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${currentCategoryHub?.title === 'Financials & POS' && currentModule === 'category-hub' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
                    <DollarSign className="w-5 h-5" /><span>Financials & POS</span>
                </button>

                <button onClick={() => {
                    setCurrentCategoryHub({
                        title: 'Events & Bookings',
                        description: 'Manage reservations, functions, and entertainment.',
                        links: [
                            { id: 'calendar', label: 'Venue Calendar', icon: CalendarIcon, description: 'Master view of all events and bookings' },
                            { id: 'bookings', label: 'Table Reservations', icon: Utensils, description: 'Manage dining room allocations' },
                            { id: 'functions', label: 'Private Functions', icon: PartyPopper, description: 'Manage large group events and catering' },
                            { id: 'entertainment', label: 'Entertainment', icon: Music, description: 'Band and DJ schedules' }
                        ]
                    });
                    setCurrentModule('category-hub');
                }} className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${currentCategoryHub?.title === 'Events & Bookings' && currentModule === 'category-hub' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
                    <CalendarIcon className="w-5 h-5" /><span>Events & Bookings</span>
                </button>

                <button onClick={() => {
                    setCurrentCategoryHub({
                        title: 'Staff & Labour',
                        description: 'Manage team members, shifts, and timesheets.',
                        links: [
                            { id: 'staff', label: 'Team Directory', icon: Users, description: 'Manage staff profiles and permissions' },
                            { id: 'roster', label: 'Rostering', icon: ClipboardList, description: 'Schedule shifts and manage leave' },
                            { id: 'timeclock', label: 'Timeclock', icon: ClockIcon, description: 'Staff sign-in kiosk' },
                            { id: 'timesheets', label: 'Timesheets', icon: FileText, description: 'Review and approve worked hours' }
                        ]
                    });
                    setCurrentModule('category-hub');
                }} className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${currentCategoryHub?.title === 'Staff & Labour' && currentModule === 'category-hub' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
                    <Users className="w-5 h-5" /><span>Staff & Labour</span>
                </button>

                <button onClick={() => {
                    setCurrentCategoryHub({
                        title: 'Inventory',
                        description: 'Manage stock levels, menus, and ordering.',
                        links: [
                            { id: 'stock', label: 'Products & Stock', icon: Boxes, description: 'View current inventory levels' },
                            { id: 'menus', label: 'Menus & Allergens', icon: BookOpen, description: 'Manage food and beverage menus' },
                            { id: 'ordering', label: 'Purchase Orders', icon: Truck, description: 'Create orders for suppliers' },
                            { id: 'stocktake', label: 'Stocktaking', icon: ClipboardList, description: 'Perform physical inventory counts' },
                            { id: 'suppliers', label: 'Suppliers', icon: Truck, description: 'Manage vendor details' },
                            { id: 'recipes', label: 'Recipes', icon: BookOpen, description: 'Standard operating procedures for items' }
                        ]
                    });
                    setCurrentModule('category-hub');
                }} className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${currentCategoryHub?.title === 'Inventory' && currentModule === 'category-hub' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
                    <Boxes className="w-5 h-5" /><span>Inventory</span>
                </button>

                <button onClick={() => {
                    setCurrentCategoryHub({
                        title: 'Operations',
                        description: 'Manage venue operations and daily tasks.',
                        links: [
                            { id: 'tvschedule', label: 'TV Guide', icon: Tv, description: 'Live sports and screen management' },
                            { id: 'incidents', label: 'Incident Log', icon: ShieldAlert, description: 'Record compliance and security events' },
                            { id: 'maintenance', label: 'Maintenance', icon: Wrench, description: 'Track broken equipment and repairs' },
                            { id: 'lostfound', label: 'Lost & Found', icon: Umbrella, description: 'Track items left by customers' },
                            { id: 'documents', label: 'Documents', icon: FolderOpen, description: 'Venue policies and files' }
                        ]
                    });
                    setCurrentModule('category-hub');
                }} className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${currentCategoryHub?.title === 'Operations' && currentModule === 'category-hub' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
                    <Wrench className="w-5 h-5" /><span>Operations</span>
                </button>
                
                {currentUser?.id === 'admin-nikko' && (
                    <>
                    <div className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-3 px-3 mt-6">Admin Tools</div>
                    <button onClick={() => setCurrentModule('gemini')} className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${currentModule === 'gemini' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}>
                        <BookOpen className="w-5 h-5" /><span>Google Notebook</span>
                    </button>
                    </>
                )}
            </div>
        )}
    </div>
</aside>`;

code = code.replace(asideRegex, newSidebar);

// Add missing view routing logic in main content area
const addViewRegex = /\{currentModule === 'dashboard' && \(/;
const newViews = `{currentModule === 'category-hub' && currentCategoryHub && (
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
              <TimeclockView
                  teamMembers={teamMembers}
                  timePunches={timePunches}
                  onClockIn={(punch) => {
                      setTimePunches([...timePunches, punch]);
                      setNotification({ message: 'Clocked In Successfully', type: 'success' });
                  }}
                  onClockOut={(punchId, timeOut) => {
                      setTimePunches(timePunches.map(p => p.id === punchId ? { ...p, timeOut } : p));
                      setNotification({ message: 'Clocked Out Successfully', type: 'success' });
                  }}
              />
          )}

          {currentModule === 'dashboard' && (`;

code = code.replace(addViewRegex, newViews);

fs.writeFileSync('App.tsx', code);
