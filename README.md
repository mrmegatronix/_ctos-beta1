
# Coasters Tavern Operating System (CTOS)

## 1. Project Overview
CTOS is a bespoke web application designed for venue management. It serves as a central dashboard for "Coasters Tavern", integrating staff management, financial tracking, stock control, and event organization.

The system is built as a **Dual Mode** application:
1.  **Office Mode**: Administrative interface for Managers (Rostering, Finance, Stock, Settings).
2.  **Front of House (FOH) Mode**: Operational interface for floor staff (POS access, View Roster, Report Issues).

## 2. Technical Stack
- **Frontend Framework**: React 19 (via ESM imports).
- **Styling**: Tailwind CSS (loaded via CDN).
- **Icons**: Lucide React.
- **AI Integration**: Google Gemini API (`@google/genai`) for natural language commands.
- **Persistence**: Browser `localStorage` (simulating a backend database).
- **Build System**: Browser-native ES Modules (no build step required for this implementation).

## 3. Architecture & File Structure

### Core Files
- `index.html`: Entry point. Handles script imports (Tailwind, React, Google Identity) and Import Maps.
- `index.tsx`: React root mounting point.
- `App.tsx`: Main application controller. Handles:
  - Global State (User, Mode, Data).
  - Navigation/Routing (conditional rendering of modules).
  - Authorization logic (RBAC for Office vs FOH modes).
- `types.ts`: TypeScript definitions for all data entities (Staff, Events, Stock, Invoices, etc.).
- `constants.ts`: Initial seed data and configuration constants.
- `utils.ts`: Helper functions for Dates, Formatting, and IDs.

### Services
- `services/database.ts`: A mock database abstraction layer.
  - Manages `localStorage` reads/writes.
  - Handles data seeding on first load via `DB_VERSION` checks.
  - Methods: `getStaff`, `saveEvent`, `saveInvoice`, `saveFunction`, etc.
- `services/googleService.ts`: Handles Google API interactions (Calendar, Contacts).
- `services/geminiService.ts`: AI logic for natural language command parsing.

### Components
- **Auth**: `LoginScreen.tsx` (PIN-based authentication).
- **Layout**: 
  - `DashboardView.tsx`: The main landing view, adapting to "Office" or "FOH" mode.
  - `ActionToolbar.tsx`: Context-aware toolbar for common actions (Print, Edit).
- **Modules**:
  - `RosterView.tsx`: Staff scheduling, visual roster grid, and leave requests.
  - `StockView.tsx`: Inventory list, low stock alerts, and **Stock Transfers**.
  - `FinanceView.tsx`: Daily cash-up forms and **Invoice/Delivery Slip Scanning**.
  - `FunctionsView.tsx`: **Private Event/Function** booking management.
  - `BookingsView.tsx`: Restaurant reservations (NowBookIt integration view).
  - `MaintenanceView.tsx`: Issue tracking and repair logs.
  - `SuppliersView.tsx`: Address book.
  - `StaffDirectory.tsx`: Contact list.
  - `DocumentsView.tsx`: File manager interface.
  - `BrowserView.tsx`: Iframe wrapper for external POS systems.
  - `EntertainmentView.tsx`: Schedule for bands/DJs.
  - `RecipesView.tsx`: **Digital Recipe & Specs Book**.
  - `IncidentLogView.tsx`: **Intoxication & Security Log**.
  - `LostAndFoundView.tsx`: **Customer Lost Property Register**.
  - `TVScheduleView.tsx`: **Sky Sport TV Schedule**.
- **Modals**:
  - `EventModal.tsx`: Calendar event creation/editing.
  - `AIAssistant.tsx`: Floating chat interface for AI commands.

## 4. Key Features & Data Models

### Authentication & Roles
- **Staff**: Defined in `constants.ts`.
- **Roles**: 
  - `Admin` (Nikko)
  - `Duty Manager` (Robert, Bianca, Nicole)
  - `Front of House` (Everyone else)
- **Login**: 2-digit or 4-digit PIN match against `TeamMember.pinCode`.

### Features by Module

#### A. Roster & Staff
- **Data Model**: `RosterShift`, `LeaveRequest`.
- **Functionality**: 
  - Visual weekly grid.
  - "Request Leave" modal with status tracking.
  - Shift creation (restricted to Managers).

#### B. Finance
- **Data Model**: `CashUpRecord`, `Invoice`.
- **Functionality**:
  - End-of-day reconciliation (Cash/Eftpos variances).
  - **Invoices**: Section to capture/upload invoices (simulated camera/file upload), categorise as Invoice or Delivery Slip, and track payment status.

#### C. Stock Control
- **Data Model**: `StockItem`.
- **Functionality**:
  - Inventory tracking with low-stock thresholds.
  - **Transfer Stock**: Logic to move inventory quantities to different virtual sites (Main Bar, Garden Bar, Kitchen, Offsite).

#### D. Operational Logs (New in v1.4)
- **Recipes**: Digital cookbook for consistent food/bev preparation.
- **Incident Log**: Compliance tracking for refused service, fights, or injuries.
- **Lost & Found**: Tracking customer items with return status.

#### E. TV Schedule (New in v1.5)
- **Data Model**: `TVScheduleItem`.
- **Functionality**: 
  - Track live sport events on Sky Sport channels.
  - Dashboard widget for today's live games.

#### F. Browser / POS
- **Functionality**: An iframe wrapper to load external POS (Tevalis) or Reservation (NowBookIt) systems without leaving the app.

## 5. Re-creation Guide

To re-create this project from scratch:

1.  **Setup**: Create an HTML file structure supporting ES Modules (ESM).
2.  **Dependencies**: Use an import map in `index.html` to load:
    - `react`, `react-dom`
    - `lucide-react`
    - `@google/genai`
3.  **Configuration**:
    - Ensure `metadata.json` requests `camera` permissions.
    - Set up `tailwind.config` in the HTML head.
4.  **Data Seeding**:
    - The `database.ts` file contains the logic to populate `localStorage` if it's empty.
    - To reset the app to its initial state, simply clear the browser's Application Storage (Local Storage) and refresh.

## 6. Version History & Recent Updates

- **v1.0**: Core release. Dashboard, Calendar, Basic Roster.
- **v1.1**: Added Finance (Cash Up), Maintenance, Staff Directory.
- **v1.2**: Added Persistence for Leave Requests.
- **v1.3**: 
  - **Invoices**: Added camera scanning interface and database storage for invoices.
  - **Functions**: Added Private Function booking management.
  - **Stock**: Added "Transfer to Site" functionality.
- **v1.4**:
  - **Recipes**: Added Recipe Book.
  - **Incidents**: Added Security/Refusal Log.
  - **Lost & Found**: Added Lost Property Register.
- **v1.5**:
  - **TV Schedule**: Added Sky Sport Listing Guide.
