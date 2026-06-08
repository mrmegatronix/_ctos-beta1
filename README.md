# Coasters Tavern Operating System (CTOS)

## 1. Project Overview
CTOS is a bespoke web application designed for venue management. It serves as a central dashboard for "Coasters Tavern", integrating staff management, financial tracking, stock control, and event organization.

The system is built as a **Dual Mode** application:
1.  **Office Mode**: Administrative interface for Managers, categorized into Product, Labour, Revenue, and Operations.
2.  **Front of House (FOH) Mode**: Operational interface for floor staff (POS access, View Roster, Report Issues).
3.  **Back of House (BOH) Mode**: Operational interface for kitchen staff (Recipes, Kitchen Roster, Stock).

## 2. Technical Stack
- **Frontend Framework**: React 19 (via ESM imports).
- **Styling**: Tailwind CSS (loaded via CDN).
- **Icons**: Lucide React.
- **AI Integration**: Google Gemini API (`@google/genai`) for natural language commands.
- **Persistence**: Firebase Firestore mock/adapter wrapping Browser `localStorage` (for offline demo capability).
- **Build System**: Browser-native ES Modules or Vite.

## 3. Architecture & Navigation Structure

In Office Mode, the application is strictly organized into four main pillars:

### I. Product
Everything related to physical goods and food/beverage preparation.
- **Stock**: Real-time inventory tracking and site transfers.
- **Stocktaking**: Dedicated interface for physical inventory counts and variance tracking.
- **Ordering**: Purchase order generation, supplier management, and tracking.
- **Recipes**: Digital cookbook for consistent food/beverage preparation.

### II. Labour
Everything related to staff, time, and scheduling.
- **Management**: Staff directory and profiles.
- **Timeclock**: Kiosk-style PIN entry for staff to clock in/out and take breaks.
- **Timesheets**: Manager review and approval of clocked hours.
- **Rosters**: Visual weekly schedule creation and leave request handling.

### III. Revenue
Everything related to money, targets, and financial tracking.
- **Cashup & Recon.**: Daily till reconciliation and variance reporting.
- **Dashboard**: High-level overview of venue performance.
- **Budgeting**: Setting and tracking targets for Revenue, COGS (Cost of Goods Sold), and Labour percentages.

### IV. Operations
All other day-to-day venue management tools.
- **Venue Calendar**: Master calendar for all venue events.
- **Table Reservations**: Integration view for dining bookings (e.g. NowBookIt).
- **Private Functions**: Booking management for private events.
- **Entertainment**: Band/DJ schedules.
- **Suppliers**: Address book.
- **Invoices**: Scanning and logging of supplier invoices and delivery slips.
- **Incident Log**: Compliance tracking for refused service, fights, or injuries.
- **Maintenance Issues**: Tracking equipment repairs.
- **Docs & Files**: File manager interface.
- **POS / Browser**: Iframe wrapper for external POS systems (e.g. Tevalis).
- **Adverts & Slides**: Media control.
- **TV Guide**: Live sports schedule (e.g. Sky Sport).
- **Live Weather**: Weather widget.
- **Lost & Found**: Customer lost property register.

## 4. Re-creation Guide for Agents

To re-create this project from scratch, an AI agent should follow this sequence:

1.  **Setup & Types**: 
    - Initialize a React (Vite) project with Tailwind CSS and Lucide React.
    - Create `src/types.ts` defining all interfaces (`TeamMember`, `StockItem`, `StocktakeSession`, `PurchaseOrder`, `TimePunch`, `BudgetTracker`, etc.).
2.  **Mock Database**:
    - Create `src/constants.ts` with initial mock data (arrays of the above types).
    - Create `src/services/database.ts` that acts as an async CRUD wrapper over `localStorage` to simulate a real backend (e.g., Firebase Firestore).
3.  **Core Controller**:
    - Build `App.tsx` with global state holding the current `AppMode` (OFFICE/FOH/BOH) and `currentModule` string.
    - Implement a `useEffect` on mount to asynchronously load all data from `services/database.ts` into local component state.
    - Build the sidebar navigation mapping to the 4 categories (Product, Labour, Revenue, Operations) updating the `currentModule` state.
4.  **Component Implementation**:
    - Build individual components for each feature in `src/components/`. 
    - Ensure data flows down as props, and mutations flow up via callback functions (e.g., `onSaveOrder(order)`) which then call `db.saveOrder(order)` and update the top-level state.
5.  **Styling**: Use a clean, modern aesthetic with a functional dark mode (`isDarkMode` state in App root toggling the `.dark` class on `<html>`).

## 5. Version History & Recent Updates

- **v1.6**: Major architectural overhaul.
  - Reorganized Office navigation into strict Product, Labour, Revenue, and Operations categories.
  - Added **Stocktaking** module for variance tracking.
  - Added **Ordering** module for Purchase Orders.
  - Added **Timeclock** module for staff clock-ins.
  - Added **Budgeting** module for tracking Revenue, COGS, and Labour targets.
- **v1.5**: Added TV Schedule (Sky Sport Listing Guide).
- **v1.4**: Added Recipes, Incident Log, and Lost & Found.
- **v1.3**: Added Invoice camera scanning, Functions booking, and Stock site transfers.
- **v1.0**: Core release. Dashboard, Calendar, Basic Roster.
