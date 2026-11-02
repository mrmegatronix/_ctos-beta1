# CTOS LoadedHub Hospitality Suite — Interconnected Modules & Architecture

* **Author:** Nikko (`mrmegatronix`)
* **Date:** 2026-11-02

## Overview

CTOS Beta already contains UI views for the 11 core LoadedHub modules (`StockView`, `StocktakeView`, `OrderingView`, `RecipesView`, `StaffDirectory`, `CTClockView`, `RosterView`, `TimesheetsView`, `CashUpView`, `FinanceView`, `DashboardView`, `BudgetingView`), but they currently operate as isolated screens with broken database persistence and disconnected math. This feature upgrades CTOS Beta into a functional hospitality management system where inventory, recipes, ordering, stocktaking, timeclock, rosters, cashups, and budgeting share a unified data pipeline, a 4-tier role hierarchy, and a hybrid local-plus-cloud persistence layer.

## Analysis

### 1. Persistence & Multi-Host Split-Brain Risks (`egm-design`)
* **Destructive Seeding Bug:** [`DatabaseService.init()`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/services/database.ts#L86-L101) currently calls [`seed()`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/services/database.ts#L103-L127) whenever `DB_VERSION` changes, which deletes all existing documents in every collection before writing `INITIAL_*` constants. This must be replaced with non-destructive seeding (`setDoc(..., { merge: true })` only when a collection is empty).
* **LAN Split-Brain Risk:** Deploying to both Raspberry Pi (`192.168.1.97`) and Netbook (`192.168.1.230`) while resolving the API host dynamically via `window.location.hostname:5000` in [`getBackendUrl()`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/services/database.ts#L339-L343) will create two separate databases if staff open different URLs. The Raspberry Pi (`192.168.1.97:5000`) must be designated as the primary LAN API endpoint, with automatic fallback to `localhost:5000`, Firebase Firestore, and `localStorage`.
* **Missing Backend Server:** `backend/server.js` does not exist on disk yet, and [`DatabaseService`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/services/database.ts#L345-L381) only routes `stock` through `/api/stock`. A full Express persistence API (`backend/server.js`) handling all collections (`/api/db/:collection`) and POS webhooks (`/api/pos/webhook`) is required.

### 2. Codebase Bugs & Broken Contracts (`egm-codebase-details`)
* **Duplicate Interfaces in [`types.ts`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/types.ts):** `TeamMember`, `CalendarEvent`, `StockItem`, and `Booking` are declared twice (`L16-110` and `L321-393`), with the second `TeamMember` declaration omitting `accessLevel`.
* **Wholesale Cost vs. Retail Price in [`OrderingView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/OrderingView.tsx):** Purchase orders currently pull `stock.price` (retail sell price) instead of `stock.cost` (wholesale supplier cost) on lines 35 and 88, inflating PO totals. Furthermore, clicking `Mark Received` (line 259) only flips `status = 'received'` without incrementing `StockItem.quantity`, updating `StockItem.cost`, or logging an `Invoice` to COGS.
* **Fractional Pour Depletion in [`App.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/App.tsx#L1088-L1093):** EOD sales currently subtract integer quantities (`item.quantity - sold.quantity`), so selling one 30ml shot or one 570ml pint deducts an entire bottle or keg. Depletion must normalize units using `pourMl / item.volumeMl` or `portionGrams / item.weightGrams`.
* **Runtime Crashes in [`FinanceView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/FinanceView.tsx) & [`DashboardView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/DashboardView.tsx):** `FinanceView.tsx` (line 31) calls `setInvoices(db.getInvoices())` without `await`, storing a `Promise` in state and crashing `.map()`. `DashboardView.tsx` (lines 291-299) references undefined variables `eventsToday` and `staffOnShift` in `FOH` mode and hardcodes `$4,250.00` sales in `OFFICE` mode.
* **Unwired Cashup & Timesheet Saves:** [`CashUpView.tsx`](file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ctos-beta/components/CashUpView.tsx#L242-L244) has no `onClick` handler on its Save button, and `DatabaseService` is missing the `TIMESHEETS`, `MENUS`, `EOD_SALES`, and `DETAILED_CASHUPS` collections.

### 3. COGS Accounting & Rollup Boundaries (`egm-zoom-out`)
* **Preventing Double-Counted COGS:** Adding both Received Purchase Orders AND POS Recipe Depletion into a single `actualCogs` metric will double-count inventory cost. Following LoadedHub's hospitality accounting model:
  * **Actual COGS (Purchases & Variance Method):** `Received Purchase Orders / Approved Invoices + Stocktake Variance Cost $ + Logged Wastage $`
  * **Theoretical COGS (Recipe Depletion Method):** `POS Items Sold × Recipe Ingredient Cost`
  * Both metrics will be displayed side-by-side in `BudgetingView` and `DashboardView` so management can see both actual spend and theoretical variance.

### 4. 4-Tier Role Hierarchy & 1080p Ergonomics (`egm-comprehension`)
* **SUPER ADMIN (`super-admin` — IT Manager / App Creator):** Unrestricted access to all modes (`OFFICE`, `FOH`, `BOH`), System Settings, Master Data Editor, DB/API configuration, and Public Folder uploads.
* **ADMIN (`admin` — Venue Manager / Owner):** Full access to `OFFICE`, `FOH`, `BOH`, Budgeting targets, Staff hourly wage rates, Roster wage costs, Timesheet approvals, COGS, and Cashups. Cannot alter raw system/DB settings.
* **SUPERVISOR (`supervisor` — Duty Manager / Head Chef):** Access to `FOH`, `BOH`, and operational `OFFICE` modules (`Cashup & Recon`, `Ordering & Receiving`, `Stocktake`, `Stock`, `Recipes`, `Menus`, `Rosters`, `Timesheets`). **Redaction guard:** Other staff members' hourly pay rates, total dollar wage rolls, and owner budget targets are masked (`••••`).
* **USER (`user` — FOH / BOH Staff):** Locked out of `OFFICE` mode (requires Supervisor/Admin PIN to switch). Access restricted to `Timeclock`, `Recipes`, `Menus & 86 Toggle`, `Bookings`, `Checklists/Temps`, and `Wastage Logging`.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  * Build the Hybrid Dual-Write persistence engine (`backend/server.js` + `services/database.ts` + `localStorage` cache) with non-destructive seeding.
  * Enforce the 4-tier RBAC hierarchy (`super-admin`, `admin`, `supervisor`, `user`) with PIN-gated mode switching and wage/budget masking for Supervisors.
  * Upgrade **Product, Goods & Stock** (`StockView`, `StockInfoModal`) with hospitality pour/weight units (`15ml`, `30ml`, `150ml`, `250ml`, `340ml`, `570ml`, `745ml`, `1000ml`, `30L`/`50L` kegs, `g`/`kg`), wholesale cost vs. sell price, and unit cost per ml/gram.
  * Upgrade **Ordering & Goods Receiving** (`OrderingView`) so receiving a PO increments stock quantities, updates wholesale unit costs, and posts an `Invoice` to Actual COGS.
  * Upgrade **Stocktaking** (`StocktakeView`) to calculate line-item and total `$ Variance` (`(actual - expected) * cost`), update live stock quantities, and log variance cost to COGS.
  * Upgrade **Recipes** (`RecipesView`) to link ingredients directly to `StockItem` IDs and pour/portion sizes, auto-calculating Dish Cost $, Recommended Retail Price, and live GP%.
  * Upgrade **Staff, Timeclock & Rosters** (`StaffDirectory`, `CTClockView`, `RosterView`, `TimesheetsView`) to calculate shift hours minus unpaid meal breaks (`hours * hourlyRate`) and roll up live Labour $ and Labour % of Revenue.
  * Upgrade **Revenue, POS & Cashup Reconciliation** (`EODSalesView`, `CashUpView`, `FinanceView`) with dual-mode sales ingestion (one-click Tevalis CSV/XLSX EOD importer + `/api/pos/webhook` listener), fractional stock depletion, and wired Cashup saving (`F&B Tills`, `Gaming`, `TAB`, `Safes`).
  * Upgrade **Dashboard & Budgeting** (`DashboardView`, `BudgetingView`) to automatically aggregate live Actual Revenue, Actual vs. Theoretical COGS, and Actual Labour against monthly targets.
* **Out-of-Scope Non-Goals:**
  * Direct bank-feed OAuth integrations (Xero/MYOB payroll filing) or EFTPOS terminal hardware serial drivers.
  * Modifying unrelated digital signage slideshow rules in `ct-matrix`.

## Alternatives Weighed

* **Cloud-Only Firestore vs. Local-Only SQLite/JSON vs. Hybrid Dual-Write:**
  * *Cloud-Only Firestore* was rejected because internet drops during service or restrictive Firestore security rules block writes and leave FOH/BOH terminals unable to save cashups or stocktakes.
  * *Local-Only Storage* was rejected because the Venue Owner/Admin needs remote cloud visibility when off-site.
  * *Hybrid Dual-Write (Selected)* writes immediately to the local Raspberry Pi backend (`192.168.1.97:5000`) and `localStorage` for zero-latency LAN reliability, while syncing to Firestore in the background.
* **Single Combined COGS Metric vs. Split Actual (Purchases) & Theoretical (Recipe) COGS:**
  * *Single Combined COGS* was rejected because summing supplier PO invoices and POS recipe depletions double-counts cost of goods sold.
  * *Split Actual & Theoretical COGS (Selected)* tracks Actual COGS from Received POs + Stocktake Variances and Theoretical COGS from POS Recipe Depletion.

## Key Decisions, Exact Formulas & Staging for Next Steps

### Resolved Technical Solutions & Mathematical Formulas

1. **Non-Destructive Hybrid Dual-Write & Primary LAN Anchor (`services/database.ts` & `backend/server.js`)**:
   * **Solution:** Designate Raspberry Pi (`http://192.168.1.97:5000`) as the primary LAN database host, falling back to `http://${window.location.hostname}:5000`, Firebase Firestore, and `localStorage` (`ctos_db_${collectionName}`).
   * **Non-Destructive Seed Rule:** Replace `delBatch.delete()` in `DatabaseService.seed()` with a collection-empty check (`if (existing.empty)`) and `setDoc(docRef, item, { merge: true })` so existing venue records are never deleted on version updates.

2. **Fractional Multi-Measure Depletion & Unit Cost Formula (`StockView`, `RecipesView`, `EODSalesView`)**:
   * **Unit Cost per Base Unit:**
     * Liquid (`volumeMl > 0`): `costPerMl = stockItem.cost / stockItem.volumeMl`
     * Weight (`weightGrams > 0`): `costPerGram = stockItem.cost / stockItem.weightGrams`
     * Whole Unit (`unit` / `pcs`): `costPerUnit = stockItem.cost`
   * **Fractional Stock Depletion on Sale/Wastage:**
     * `depletionUnits = pourMl ? (pourMl * qtySold) / stockItem.volumeMl : portionGrams ? (portionGrams * qtySold) / stockItem.weightGrams : qtySold`
     * `newQuantity = Number(Math.max(0, stockItem.quantity - depletionUnits).toFixed(4))`

3. **Recipe Costing & NZ GST-Exclusive Gross Profit % Formula (`RecipesView.tsx`)**:
   * **Recipe Cost:** `recipeCost = sum(ingredient.quantity * unitCostPerMeasure)`
   * **Net Sell Price (Excl. 15% NZ GST):** `netSellPrice = menuPrice / 1.15`
   * **Gross Profit $ & GP%:**
     * `grossProfitDollars = netSellPrice - recipeCost`
     * `grossProfitPercent = netSellPrice > 0 ? ((netSellPrice - recipeCost) / netSellPrice) * 100 : 0`
   * **Recommended Retail Price (for Target GP% $T$, e.g. $0.70$):**
     * `recommendedMenuPriceInclGst = (recipeCost / (1 - T)) * 1.15`

4. **Goods Receiving, Weighted Average Cost & COGS Formula (`OrderingView.tsx`, `StocktakeView.tsx`, `BudgetingView.tsx`)**:
   * **PO Creation:** Default PO line item `unitPrice` to `stock.cost || Number((stock.price * 0.30).toFixed(2))` (wholesale supplier cost, never retail sell price).
   * **PO Marked `Received`:**
     * `updatedQty = stockItem.quantity + orderItem.quantity`
     * `updatedCost = orderItem.unitPrice > 0 ? orderItem.unitPrice : stockItem.cost`
     * Auto-generate an approved `Invoice` record (`amount = order.total`, `type = 'invoice'`, `status = 'approved'`) and persist via `db.saveInvoice()`.
   * **Stocktake Variance Cost:**
     * `varianceUnits = actualQty - expectedQty`
     * `varianceCostDollars = varianceUnits * stockItem.cost` (negative = shrinkage/loss; positive = surplus)
   * **Split COGS Accounting (No Double-Counting):**
     * `actualCogs = sum(receivedOrderInvoices.amount) + sum(Math.abs(negativeStocktakeVarianceDollars)) + sum(wastageDollars)`
     * `theoreticalCogs = sum(itemsSold * recipeCost)`
     * `cogsVarianceDollars = actualCogs - theoreticalCogs`

5. **Labour Cost & Unpaid Break Deduction Formula (`CTClockView.tsx`, `RosterView.tsx`, `TimesheetsView.tsx`)**:
   * **Paid Hours Calculation:**
     * `grossShiftHours = (clockOutMs - clockInMs) / 3600000`
     * `unpaidBreakHours = totalBreakMinutes >= 30 ? (unpaidMealBreakMinutes / 60) : 0` (deducts 30m unpaid meal break on shifts $\ge 5$ hours per NZ hospitality standard, while keeping 10m rest breaks paid)
     * `paidHours = Math.max(0, Number((grossShiftHours - unpaidBreakHours).toFixed(2)))`
   * **Shift Wage Cost & Labour % of Revenue:**
     * `shiftWageCost = paidHours * staffMember.hourlyRate`
     * `labourPercent = actualRevenue > 0 ? (actualLabourCost / actualRevenue) * 100 : 0`

### Implementation Staging Plan

1. **Phase 1 — Foundation (`types.ts`, `backend/server.js`, `services/database.ts`):** Deduplicate interfaces, implement 4-tier RBAC helpers, build the local Express persistence server, and upgrade `DatabaseService` to Dual-Write.
2. **Phase 2 — Inventory, Ordering, Stocktake & Recipes (`StockView`, `OrderingView`, `StocktakeView`, `RecipesView`):** Implement multi-measure unit math, PO receiving -> stock/invoice rollup, stocktake variance $ calculation, and live recipe GP% costing.
3. **Phase 3 — Labour, Revenue, Cashup & Budgeting (`StaffDirectory`, `CTClockView`, `RosterView`, `TimesheetsView`, `EODSalesView`, `CashUpView`, `FinanceView`, `BudgetingView`, `DashboardView`):** Wire unpaid break deductions, wage cost rollups, CSV/webhook POS ingestion, Cashup persistence, and live Budget/Dashboard KPI aggregation.
