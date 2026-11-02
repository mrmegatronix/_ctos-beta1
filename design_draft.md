# CTOS LoadedHub Hospitality Suite — Interconnected Operations & Analytics

*   **Author:** Nikko (`mrmegatronix`)
*   **Status:** Draft
*   **Date:** 2026-11-02

--------------------------------------------------------------------------------

## Overview

CTOS Beta is a venue management platform running on a local Raspberry Pi (`192.168.1.97`) and Netbook (`192.168.1.230`) for Front of House (FOH), Back of House (BOH), and Office management. While CTOS Beta already contains user interface views for all 11 core LoadedHub modules (`StockView`, `StocktakeView`, `OrderingView`, `RecipesView`, `StaffDirectory`, `CTClockView`, `RosterView`, `TimesheetsView`, `CashUpView`, `FinanceView`, `DashboardView`, `BudgetingView`), those screens currently operate as disconnected silos with unpersisted state and incomplete business math.

This design connects all 11 modules into a single hospitality management pipeline backed by a Hybrid Dual-Write persistence engine, a 4-tier Role-Based Access Control (RBAC) hierarchy, and exact hospitality accounting formulas for fractional pour depletion, GST-exclusive recipe Gross Profit %, split Cost of Goods Sold (COGS), and unpaid break wage deductions.

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

## Goals

*   **G1 — Hybrid Dual-Write Persistence Engine:** Create `backend/server.js` anchored to the Raspberry Pi (`192.168.1.97:5000`) with atomic JSON storage (`backend/data/ctos_db.json`), upgrade `DatabaseService` to write to the local LAN API + Firebase Firestore + `localStorage` fallback, and make `seed()` non-destructive.
*   **G2 — 4-Tier RBAC Hierarchy & PIN Guards:** Enforce four access tiers (`super-admin`, `admin`, `supervisor`, `user`) across navigation, mode switching, and financial data masking (`••••` on staff hourly rates and owner budget targets for Supervisors).
*   **G3 — Multi-Measure Stock, Ordering & Stocktake Pipeline:** Support fractional pour/weight units in `StockView`, fix `OrderingView` to use wholesale `stock.cost` and auto-increment stock + generate an approved `Invoice` when marked `Received`, and calculate dollar variance (`(actual - expected) * cost`) in `StocktakeView`.
*   **G4 — Live Recipe Costing & GST-Exclusive GP%:** Link recipe ingredients in `RecipesView` directly to `StockItem` IDs and pour/weight measures to calculate Dish Cost, Recommended Retail Price (incl. 15% NZ GST), and live GST-exclusive Gross Profit %.
*   **G5 — Labour Cost & Break Deduction Pipeline:** Unify `TimesheetEntry` across `CTClockView`, `TimesheetsView`, and `RosterView`, automatically deduct 30-minute unpaid meal breaks on shifts $\ge 5$ hours, and calculate live wage cost (`paidHours * hourlyRate`) and Labour % of Revenue.
*   **G6 — Dual-Mode POS Revenue & Cashup Reconciliation:** Add a Tevalis CSV/XLSX EOD importer and `/api/pos/webhook` endpoint in `EODSalesView` with fractional recipe/menu stock depletion, wire `CashUpView` to persist till/safe reconciliations, and fix `FinanceView` async invoice loading.
*   **G7 — Automated Budget & Dashboard Aggregation:** Automatically populate `BudgetingView` and `DashboardView` with live Actual Revenue, Split COGS (`Actual Purchases + Stocktake Variance + Wastage` vs. `Theoretical POS Recipe COGS`), and Actual Labour against monthly targets.

## Non-Goals

*   **NG1:** Building direct third-party accounting OAuth integrations (such as live Xero or MYOB payroll tax filing).
*   **NG2:** Writing hardware serial/USB drivers for physical EFTPOS terminals or cash drawers.
*   **NG3:** Altering the digital signage slideshow logic inside `public/ct-matrix/`.

## Open Questions

*   None — all architectural, persistence, RBAC, and formula decisions were resolved during brainstorming.

## Critical User Journeys (CUJs)

### CUJ 1: Goods Receiving to Live Stock & Actual COGS

*   **Given:** A Supervisor or Admin opens `OrderingView` with an existing `sent` Purchase Order for `Southern Hospo` containing `2 × 50L Speights Kegs` at `$340.00` wholesale unit cost.
*   **When:** The user verifies the delivery, optionally adjusts the invoice unit cost, and clicks `Mark Received`.
*   **Then:** `StockItem.quantity` increases by `2`, `StockItem.cost` updates to `$340.00`, an approved `Invoice` for `$680.00` is saved to `DatabaseService`, and `Actual COGS` in `BudgetingView` and `FinanceView` increases by `$680.00` immediately.

### CUJ 2: Multi-Measure Recipe Costing & Fractional POS Depletion

*   **Given:** A `1000ml` bottle of Gin has `cost = $42.00` (`$0.042/ml`), Tonic has `cost = $2.00/unit`, and a "Gin & Tonic" recipe or menu item links `30ml` Gin + `1 unit` Tonic at a `$12.00` menu price (incl. 15% GST).
*   **When:** A manager views `RecipesView`, and later imports or posts EOD sales of `10 × Gin & Tonic` in `EODSalesView`.
*   **Then:** `RecipesView` displays `Recipe Cost = $3.26`, `Net Sell = $10.43`, and `GP% = 68.8%`; posting the `10` sales depletes Gin `StockItem.quantity` by `0.3000` bottles (`300ml / 1000ml`), depletes Tonic by `10` units, and adds `$32.60` to `Theoretical COGS`.

### CUJ 3: Timeclock Unpaid Break Deduction & Supervisor Wage Masking

*   **Given:** A FOH Bartender (`hourlyRate = $26.00`) clocks in at `14:00`, takes a `30m Meal (Unpaid)` break and a `10m Rest (Paid)` break, and clocks out at `22:00` (`8.0` gross hours).
*   **When:** A Duty Manager (`SUPERVISOR`) views `TimesheetsView` or `RosterView`, and an Owner (`ADMIN`) views `BudgetingView`.
*   **Then:** Net paid hours are calculated as `7.50 hrs` (`8.0 - 0.5`), the Duty Manager sees `7.50 hrs` with the dollar rate masked (`••••`), and the Owner sees `$195.00` added to `Actual Labour` and live `Labour % of Revenue`.
