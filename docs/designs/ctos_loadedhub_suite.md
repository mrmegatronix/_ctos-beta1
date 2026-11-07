# CTOS LoadedHub Hospitality Suite — Interconnected Operations & Analytics

*   **Author:** Nikko (`mrmegatronix`)
*   **Status:** Approved
*   **Date:** 2026-11-07

--------------------------------------------------------------------------------

## Overview

CTOS Beta is a venue management platform deployed on a local Raspberry Pi (`192.168.1.97`) and Netbook (`192.168.1.230`) serving Front of House (FOH), Back of House (BOH), and Office terminals, as well as staff mobile devices and manager laptops over local Wi-Fi and web. While CTOS Beta contains UI views for all 11 core LoadedHub modules (`StockView`, `StocktakeView`, `OrderingView`, `RecipesView`, `StaffDirectory`, `CTClockView`, `RosterView`, `TimesheetsView`, `CashUpView`, `FinanceView`, `DashboardView`, `BudgetingView`), those screens operate as disconnected silos with unpersisted state, incomplete business math, and desktop-centric fixed layouts.

This design connects all 11 modules into a single hospitality management pipeline backed by a Hybrid Dual-Write persistence engine, a 4-tier Role-Based Access Control (RBAC) hierarchy, exact hospitality accounting formulas for fractional pour depletion, GST-exclusive recipe Gross Profit %, split Cost of Goods Sold (COGS), unpaid break wage deductions, and full responsive mobile & web viewing optimization across all screen sizes (from 375px smartphones to 1080p/4K signage).

## The Problem

1.  **Broken Persistence & Destructive Seeding:** [`DatabaseService`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/services/database.ts) writes directly to Firebase Firestore without a local Express backend server (`backend/server.js` is missing), causing unauthenticated writes to fail and vanish on reload. Worse, [`DatabaseService.seed()`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/services/database.ts#L103-L127) deletes all existing documents in every collection whenever `DB_VERSION` changes, risking complete data loss in production.
2.  **Disconnected Inventory, Ordering & Recipe Costing:**
    *   [`OrderingView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/OrderingView.tsx) populates Purchase Order line items using retail selling price (`stock.price`) instead of wholesale supplier cost (`stock.cost`), and marking an order `Received` neither increments `StockItem.quantity` nor posts an `Invoice` to COGS.
    *   [`StocktakeView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/StocktakeView.tsx) records count variances without calculating dollar shrinkage (`variance * cost`) or feeding COGS variance reports.
    *   [`RecipesView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/RecipesView.tsx) stores ingredients as plain text strings rather than linking to `StockItem` IDs and hospitality pour/weight units (`15ml`, `30ml`, `150ml`, `250ml`, `340ml`, `570ml`, `745ml`, `1000ml`, `30L`/`50L` kegs, `g`/`kg`), preventing live Dish Cost and Gross Profit % calculation.
    *   [`App.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/App.tsx#L1088-L1093) deducts integer quantities (`item.quantity - sold.quantity`) during End-of-Day (EOD) sales, meaning selling one 30ml nip or one 570ml pint deducts an entire bottle or 50L keg.
3.  **Unwired Labour, Cashup & Budget Rollups:**
    *   [`CTClockView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/CTClockView.tsx) and [`TimesheetsView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/TimesheetsView.tsx) have mismatched TypeScript interfaces (`employeeId` vs. `staffId`), do not persist to `DatabaseService`, and do not deduct 30-minute unpaid meal breaks when calculating shift wage costs (`paidHours * hourlyRate`).
    *   [`CashUpView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/CashUpView.tsx) has an unwired Save button, [`FinanceView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/FinanceView.tsx) crashes on an unawaited `db.getInvoices()` Promise, and [`BudgetingView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/BudgetingView.tsx) requires manual typing for Actual Revenue, Actual COGS, and Actual Labour instead of aggregating live venue data.
4.  **Missing 4-Tier Role Hierarchy:** Duty Managers (`SUPERVISOR`) require access to FOH/BOH operations, Cashups, Ordering, Stocktake, and Rosters, but must be prevented from viewing or editing other staff members' hourly pay rates, owner budget targets, or system/database settings.
5.  **Mobile & Web Viewing Gaps:**
    *   On mobile smartphones (< 768px viewport width), the fixed desktop sidebar collapses into a squished column or pushes content offscreen.
    *   Dense multi-column tables in `StockView`, `OrderingView`, `CashUpView`, `TimesheetsView`, and `StocktakeView` clip and require excessive horizontal scrolling without responsive card adaptations.
    *   Touch hit targets on key actions (timeclock buttons, mode switchers, quantity adjustments) drop below the recommended 44×44px mobile touch threshold.
    *   Header elements (clock, date, online indicator, user profile) overflow on compact mobile screens.

## Goals

*   **G1 — Hybrid Dual-Write Persistence Engine:** Create `backend/server.js` anchored to the Raspberry Pi (`192.168.1.97:5000`) with atomic JSON storage (`backend/data/ctos_db.json`), upgrade `DatabaseService` to write to the local LAN API + Firebase Firestore + `localStorage` fallback, and make `seed()` non-destructive.
*   **G2 — 4-Tier RBAC Hierarchy & PIN Guards:** Enforce four access tiers (`super-admin`, `admin`, `supervisor`, `user`) across navigation, mode switching, and financial data masking (`••••` on staff hourly rates and owner budget targets for Supervisors).
*   **G3 — Multi-Measure Stock, Ordering & Stocktake Pipeline:** Support fractional pour/weight units in `StockView`, fix `OrderingView` to use wholesale `stock.cost` and auto-increment stock + generate an approved `Invoice` when marked `Received`, and calculate dollar variance (`(actual - expected) * cost`) in `StocktakeView`.
*   **G4 — Live Recipe Costing & GST-Exclusive GP%:** Link recipe ingredients in `RecipesView` directly to `StockItem` IDs and pour/weight measures to calculate Dish Cost, Recommended Retail Price (incl. 15% NZ GST), and live GST-exclusive Gross Profit %.
*   **G5 — Labour Cost & Break Deduction Pipeline:** Unify `TimesheetEntry` across `CTClockView`, `TimesheetsView`, and `RosterView`, automatically deduct 30-minute unpaid meal breaks on shifts $\ge 5$ hours, and calculate live wage cost (`paidHours * hourlyRate`) and Labour % of Revenue.
*   **G6 — Dual-Mode POS Revenue & Cashup Reconciliation:** Add a Tevalis CSV/XLSX EOD importer and `/api/pos/webhook` endpoint in `EODSalesView` with fractional recipe/menu stock depletion, wire `CashUpView` to persist till/safe reconciliations, and fix `FinanceView` async invoice loading.
*   **G7 — Automated Budget & Dashboard Aggregation:** Automatically populate `BudgetingView` and `DashboardView` with live Actual Revenue, Split COGS (`Actual Purchases + Stocktake Variance + Wastage` vs. `Theoretical POS Recipe COGS`), and Actual Labour against monthly targets.
*   **G8 — Responsive Mobile & Web Viewing Optimization:** Ensure all modules adapt seamlessly across small mobile screens (375px–430px), tablets (768px–1024px), and 1080p digital signage/desktops:
    *   Mobile slide-over navigation drawer with backdrop on small screens (`md:hidden`), maintaining desktop collapsible sidebar (`hidden md:block`).
    *   Responsive data display: multi-column tables transform into mobile-first cards on `< 768px` viewports with sticky horizontal wrappers where tabular comparison is mandatory.
    *   Touch ergonomics: all interactive buttons, selects, and inputs enforce minimum 44×44px hit targets with visible active/pressed feedback.
    *   Responsive header: compact title, live pulsing status badge, and blinking colon clock optimized for narrow mobile viewports without clipping.

## Non-Goals

*   **NG1:** Building direct third-party accounting OAuth integrations (such as live Xero or MYOB payroll tax filing).
*   **NG2:** Writing hardware serial/USB drivers for physical EFTPOS terminals or cash drawers.
*   **NG3:** Altering the digital signage slideshow logic inside `public/ct-matrix/`.

## Open Questions

*   None — all architectural, persistence, RBAC, responsive UX, and formula decisions are resolved.

## Critical User Journeys (CUJs)

### CUJ 1: Goods Receiving to Live Stock & Actual COGS

*   **Given:** A Supervisor or Admin opens `OrderingView` on tablet or desktop with an existing `sent` Purchase Order for `Southern Hospo` containing `2 × 50L Speights Kegs` at `$340.00` wholesale unit cost.
*   **When:** The user verifies the delivery, optionally adjusts the invoice unit cost, and clicks `Mark Received`.
*   **Then:** `StockItem.quantity` increases by `2`, `StockItem.cost` updates to `$340.00`, an approved `Invoice` for `$680.00` is saved to `DatabaseService`, and `Actual COGS` in `BudgetingView` and `FinanceView` increases by `$680.00` immediately.

### CUJ 2: Multi-Measure Recipe Costing & Fractional POS Depletion

*   **Given:** A `1000ml` bottle of Gin has `cost = $42.00` (`$0.042/ml`), Tonic has `cost = $2.00/unit`, and a "Gin & Tonic" recipe or menu item links `30ml` Gin + `1 unit` Tonic at a `$12.00` menu price (incl. 15% GST).
*   **When:** A manager views `RecipesView`, and later imports or posts EOD sales of `10 × Gin & Tonic` in `EODSalesView`.
*   **Then:** `RecipesView` displays `Recipe Cost = $3.26`, `Net Sell = $10.43`, and `GP% = 68.8%`; posting the `10` sales depletes Gin `StockItem.quantity` by `0.3000` bottles (`300ml / 1000ml`), depletes Tonic by `10` units, and adds `$32.60` to `Theoretical COGS`.

### CUJ 3: Timeclock Unpaid Break Deduction & Supervisor Wage Masking

*   **Given:** A FOH Bartender (`hourlyRate = $26.00`) clocks in on mobile or wall tablet at `14:00`, takes a `30m Meal (Unpaid)` break and a `10m Rest (Paid)` break, and clocks out at `22:00` (`8.0` gross hours).
*   **When:** A Duty Manager (`SUPERVISOR`) views `TimesheetsView` or `RosterView`, and an Owner (`ADMIN`) views `BudgetingView`.
*   **Then:** Net paid hours are calculated as `7.50 hrs` (`8.0 - 0.5`), the Duty Manager sees `7.50 hrs` with the dollar rate masked (`••••`), and the Owner sees `$195.00` added to `Actual Labour` and live `Labour % of Revenue`.

### CUJ 4: Mobile Floor & Bar Staff Service (Mobile & Web Friendly)

*   **Given:** A bartender or duty manager accesses CTOS on a smartphone (iPhone/Android, 375px–430px wide) over the venue Wi-Fi.
*   **When:** The user navigates between Service Hub, Menus (to 86 an item), Table Bookings, and Wastage logging.
*   **Then:** The app displays a touch-optimized header with hamburger drawer navigation, cards stack cleanly without horizontal clipping, inputs and buttons have at least 44px tap targets, and text never ugly-wraps or clips off screen edges.

--------------------------------------------------------------------------------

## Technical Plan (Architecture)

### 1. System Architecture & Dual-Write Persistence

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Client Tier (FOH / BOH / Office)                     │
│  - Mobile Viewports (375px-430px)  - Tablets (768px-1024px)  - 1080p Kiosk   │
│                                                                             │
│               DatabaseService (Client Tri-Layer Persistence)                │
│    ┌───────────────────────────┬───────────────────────────────────────┐    │
│    │ Layer 1: Primary LAN API  │ Layer 2: Cloud Sync & Backup          │    │
│    │ (Local Node/Express :5000)│ (Firebase Firestore REST/SDK)         │    │
│    └─────────────┬─────────────┴───────────────────┬───────────────────┘    │
│                  │                                 │                        │
│                  ▼                                 ▼                        │
│          Layer 3: Local Offline Cache (localStorage Fallback & Queue)       │
└──────────────────┬─────────────────────────────────┬────────────────────────┘
                   │                                 │
                   ▼ LAN (192.168.1.97:5000)         ▼ Internet (WSS/HTTPS)
┌───────────────────────────────────────┐   ┌─────────────────────────────────┐
│     Local Express Server (Pi/PC)      │   │    Google Cloud / Firestore     │
│  - REST Endpoints (/api/db/:col)      │   │  - Remote Venue Sync            │
│  - Tevalis POS Webhook (/api/pos)     │   │  - Owner Mobile Off-site View   │
│  - Atomic Disk Persistence            │   │  - Non-destructive Merge Rules  │
│    (backend/data/ctos_db.json)        │   └─────────────────────────────────┘
└───────────────────────────────────────┘
```

### 2. 4-Tier Role Hierarchy & Security Matrix

```text
┌───────────────────┬─────────────────────────────────────────────────────────┐
│ Access Level      │ Permitted Modules & Operational Capabilities            │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ SUPER ADMIN       │ • Unrestricted access to OFFICE, FOH, BOH               │
│ (IT / Creator)    │ • System Settings, Master Data Editor, Raw DB APIs      │
│                   │ • Full view & edit of wages, budgets, POS configurations│
├───────────────────┼─────────────────────────────────────────────────────────┤
│ ADMIN             │ • Full access to OFFICE, FOH, BOH                       │
│ (Owner / GM)      │ • Budgeting, Revenue Targets, Financials & Invoices     │
│                   │ • Staff Directory with hourly pay rates, Rosters & COGS │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ SUPERVISOR        │ • Full access to FOH and BOH                            │
│ (Duty Manager /   │ • Operational OFFICE: Cashup & Recon, Ordering/Receiving│
│  Head Chef)       │   Stocktaking, Rosters & Timesheet approvals            │
│                   │ • REDACTION GUARD: Staff pay rates masked (••••)        │
│                   │ • Restricted from Budgeting Targets & System Settings   │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ USER              │ • FOH / BOH access only (Locked out of OFFICE)          │
│ (Floor / Kitchen) │ • Timeclock, Recipes, Menus & 86 Toggle, Bookings       │
│                   │ • Checklists & Temps, Wastage logging                   │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

### 3. Responsive Mobile & Web Layout Architecture

1.  **Container & Viewport Budgeting:**
    *   Base container: `flex h-screen flex-col overflow-hidden bg-slate-950 text-white`.
    *   Header: responsive layout where date and secondary status hide on `< 768px`, while Mode toggles, blinking colon clock, and profile avatar remain accessible.
2.  **Navigation Adaptation:**
    *   Desktop (`md:block`): collapsible 64-width sidebar (`w-64` or `w-0` transition).
    *   Mobile (`< 768px`): full-height sliding drawer overlay (`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-white/10 shadow-2xl`) with backdrop blur scrim.
3.  **Table & Form Mobile Transformation:**
    *   Data tables (`StockView`, `OrderingView`, `CashUpView`, `TimesheetsView`): rendered with `hidden md:table` for desktop tabular layout, and `md:hidden flex flex-col gap-3` using card layouts for touch viewing.
    *   All buttons, select dropdowns, and form inputs maintain minimum 44px height (`min-h-[44px]`) and `touch-manipulation` to prevent mobile tap delay.

### 4. Mathematical & Financial Formulas

1.  **Fractional Stock Depletion:**
    $$\text{depletionUnits} = \begin{cases} \frac{\text{pourMl} \times \text{qtySold}}{\text{stockItem.volumeMl}}, & \text{if liquid} \\ \frac{\text{portionGrams} \times \text{qtySold}}{\text{stockItem.weightGrams}}, & \text{if weight} \\ \text{qtySold}, & \text{otherwise} \end{cases}$$
2.  **Recipe Cost & NZ GST-Exclusive Gross Profit %:**
    $$\text{recipeCost} = \sum (\text{ingredientQuantity} \times \text{unitCost})$$
    $$\text{netSellPrice} = \frac{\text{menuPriceInclGst}}{1.15}$$
    $$\text{GP\%} = \frac{\text{netSellPrice} - \text{recipeCost}}{\text{netSellPrice}} \times 100$$
3.  **Split COGS Accounting:**
    $$\text{Actual COGS} = \sum \text{Received PO Invoices} + \sum |\text{Negative Stocktake Variance \$}| + \sum \text{Wastage \$}$$
    $$\text{Theoretical COGS} = \sum (\text{POS Items Sold} \times \text{Recipe Cost})$$
4.  **Paid Hours & Labour Cost:**
    $$\text{unpaidBreakHours} = \begin{cases} 0.5, & \text{if total shift} \ge 5.0\text{ hrs and break taken} \\ 0.0, & \text{otherwise} \end{cases}$$
    $$\text{paidHours} = \max(0, \text{grossShiftHours} - \text{unpaidBreakHours})$$
    $$\text{shiftWageCost} = \text{paidHours} \times \text{staffMember.hourlyRate}$$

--------------------------------------------------------------------------------

## Alternatives Considered

### Alternative A: Cloud-Only Firestore Persistence

*   **Pros:** Zero local backend deployment required; built-in Google auth.
*   **Cons:** Unauthenticated writes fail due to security rules; loses all data offline if local venue Wi-Fi loses WAN uplink; incurs cloud read/write costs on high-frequency polling.
*   **Reason for Rejection:** Hospitality venues require zero-latency LAN reliability during peak trade even during internet dropouts.

### Alternative B: Desktop-Only Fixed Grid Interface

*   **Pros:** Simple layout without mobile breakpoint styling.
*   **Cons:** Broken on manager smartphones, bar tablets, and mobile stocktaking; clips content and forces pinch-to-zoom.
*   **Reason for Rejection:** Explicitly violates user mandate for mobile and web viewing friendliness.

### Alternative C: Unified Single-Bucket COGS

*   **Pros:** Single number for all expenses.
*   **Cons:** Summing received supplier invoices and POS recipe depletions double-counts food and beverage costs.
*   **Reason for Rejection:** Distorts Gross Profit % and creates inaccurate financial reports.

--------------------------------------------------------------------------------

## Non-Functional Requirements

### 1. Mobile & Responsive Ergonomics
*   Viewport meta tag: `width=device-width, initial-scale=1.0, maximum-scale=5.0`.
*   Minimum touch target: 44px × 44px for buttons, list items, and modal actions.
*   Typography budgeting: Text must not overspill or clip; use `truncate` with `min-w-0` and auto-fit flex containers.

### 2. Digital Signage & 1080p Rules
*   All digital and analog clocks must have blinking colons (`:`).
*   Desktop/kiosk views must be optimized for 1920×1080 viewing without ugly line wraps.

### 3. Reliability & Local Fallback
*   Local LAN server responds in under 50ms on `192.168.1.97:5000`.
*   Offline queue saves pending changes in `localStorage` and flushes when reconnected.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

### Target Files to Create/Modify

#### 1. `types.ts` (Modify)
*   **Scope:** Core data models and permissions.
*   **Proposed Changes:**
    *   Deduplicate `TeamMember`, `StockItem`, `Booking`, `CalendarEvent`.
    *   Add `AccessLevel = 'super-admin' | 'admin' | 'supervisor' | 'user'`.
    *   Add permission helper functions: `isSuperAdmin()`, `isAdmin()`, `isSupervisorOrAbove()`, `canViewWageRates()`, `canAccessOffice()`.
    *   Add `RecipeIngredient` (`stockItemId`, `quantity`, `unit`, `unitCost`).
    *   Unify `TimesheetEntry` interface (`staffId`, `date`, `clockIn`, `clockOut`, `unpaidBreakMinutes`, `paidHours`, `hourlyRate`, `totalWage`, `status`).

#### 2. `backend/server.js` (Create)
*   **Scope:** Local LAN Express server.
*   **Proposed Changes:**
    *   Port 5000 REST API with `cors` and atomic JSON file persistence (`backend/data/ctos_db.json`).
    *   Endpoints: `GET/POST /api/db/:collection`, `DELETE /api/db/:collection/:id`, `GET /api/health`, `POST /api/pos/webhook`.
    *   Add `"server": "node backend/server.js"` script to `package.json`.

#### 3. `services/database.ts` (Modify)
*   **Scope:** Tri-layer persistence service.
*   **Proposed Changes:**
    *   Upgrade to Hybrid Dual-Write: LAN API (`http://192.168.1.97:5000`) primary + Firestore parallel push + `localStorage` fallback.
    *   Make `seed()` non-destructive (`merge: true` only when collection is empty).
    *   Implement CRUD methods for `timesheets`, `menus`, `detailedCashups`, `eodSales`, `wastage`.

#### 4. `App.tsx` (Modify)
*   **Scope:** Root application shell, navigation & responsive viewport.
*   **Proposed Changes:**
    *   Add mobile sliding drawer navigation (`fixed inset-0 z-50 md:hidden`) with backdrop.
    *   Add 4-tier RBAC guards: lock `OFFICE` mode behind PIN verification for non-Admins; mask wage rates and budget targets for Supervisors.
    *   Wire Goods Receiving stock increment and invoice generation.
    *   Wire Stocktake commit to live stock update and variance $ logging.
    *   Wire Cashup Save & Reconcile to actual revenue posting.
    *   Ensure header clock preserves blinking colon across all breakpoints.

#### 5. `components/StockView.tsx` & `components/StockInfoModal.tsx` (Modify)
*   **Scope:** Inventory tracking.
*   **Proposed Changes:**
    *   Add multi-measure volume/weight units (`15ml`, `30ml`, `150ml`, `250ml`, `340ml`, `570ml`, `745ml`, `1000ml`, `30L`/`50L` kegs, `g`, `kg`).
    *   Compute unit cost per ml/gram and live GP% column.
    *   Add mobile card view layout for smartphones alongside desktop table.

#### 6. `components/OrderingView.tsx` (Modify)
*   **Scope:** Purchasing & Goods Receiving.
*   **Proposed Changes:**
    *   Use wholesale `stock.cost` for PO line items (not `stock.price`).
    *   On `Mark Received`: prompt to verify/adjust invoice unit prices, auto-increment `StockItem.quantity`, update `StockItem.cost`, and create an approved `Invoice` record in Finance.
    *   Mobile card layout for order history and line item review.

#### 7. `components/StocktakeView.tsx` (Modify)
*   **Scope:** Stock counting & variance.
*   **Proposed Changes:**
    *   Display live dollar variance `(actual - expected) * cost` per line and total session shrinkage $.
    *   On `Commit`: update live `StockItem.quantity` and append variance loss to Actual COGS.
    *   Mobile touch-friendly number steppers and barcode scanner integration.

#### 8. `components/RecipesView.tsx` (Modify)
*   **Scope:** Recipe costing & GP%.
*   **Proposed Changes:**
    *   Ingredient builder linked directly to `StockItem` dropdowns and pour sizes.
    *   Auto-calculate Dish Cost, Recommended Sell Price (incl. 15% GST), and live GST-exclusive Gross Profit %.
    *   Mobile-friendly tabbed ingredients and method view.

#### 9. `components/StaffDirectory.tsx`, `components/CTClockView.tsx`, `components/RosterView.tsx`, `components/TimesheetsView.tsx` (Modify)
*   **Scope:** Labour management.
*   **Proposed Changes:**
    *   `StaffDirectory`: add role assignment (`Super Admin`, `Admin`, `Supervisor`, `User`) and `hourlyRate`.
    *   `CTClockView`: track 30m unpaid meal breaks, calculate net paid hours, and persist punches.
    *   `TimesheetsView` & `RosterView`: calculate wage costs (`paidHours * hourlyRate`), enforce Supervisor redaction (`••••`), and calculate total labour cost.

#### 10. `components/EODSalesView.tsx`, `components/CashUpView.tsx`, `components/FinanceView.tsx` (Modify)
*   **Scope:** Revenue & Cash Reconciliation.
*   **Proposed Changes:**
    *   `EODSalesView`: Tevalis CSV/XLSX file drag-and-drop importer, fractional recipe depletion, and EOD revenue posting.
    *   `CashUpView`: complete `handleSaveCashup()` wiring to persist reconciliations and post Actual Revenue.
    *   `FinanceView`: fix async `await db.getInvoices()` loading to prevent map crash.

#### 11. `components/DashboardView.tsx` & `components/BudgetingView.tsx` (Modify)
*   **Scope:** Financial aggregation & KPI dashboards.
*   **Proposed Changes:**
    *   Fix undefined variables `eventsToday` and `staffOnShift` in FOH mode.
    *   Replace static mock numbers with live Actual Revenue, Actual COGS (Purchases + Variance), Theoretical COGS (Recipes), and Actual Labour.
    *   Calculate live Net Profit $ and GP% / Labour% variance against monthly budget targets.
    *   Mobile-friendly KPI card grid with swipeable metric overview.

### Verification Plan

*   **Compilation/Build:** Run `npm run build` with zero TypeScript errors.
*   **Mobile Viewport Verification:** Test responsive behavior on simulated mobile (375×667, 390×844), tablet (768×1024), and desktop (1920×1080) viewports:
    *   Navigation drawer opens and closes with backdrop.
    *   No horizontal scroll clipping on tables or cards.
    *   All interactive elements satisfy $\ge 44\text{px}$ touch targets.
*   **Pipeline Verification:**
    1.  Create PO in `OrderingView` $\to$ mark Received $\to$ verify stock quantity increments and invoice posts to Actual COGS.
    2.  Build Recipe in `RecipesView` $\to$ verify GST-exclusive GP% calculation.
    3.  Import EOD sales in `EODSalesView` $\to$ verify fractional stock depletion.
    4.  Clock in/out in `CTClockView` with meal break $\to$ verify paid hours and wage rollup in `TimesheetsView`.
    5.  Save Cashup in `CashUpView` $\to$ verify Actual Revenue reflects in `BudgetingView` and `DashboardView`.
    6.  Switch user to Supervisor $\to$ verify hourly wage rates and owner budget targets display as masked `••••`.

--------------------------------------------------------------------------------

*Drafted with EGM*
