# GURGI Project Tasks

## Status Legend
- ✅ Complete
- 🔄 In Progress
- ⏳ Pending
- ❌ Blocked

---

## 🔴 CRITICAL - Admin Panel Fixes

### UI Cleanup
| # | Task | Status | Priority |
|---|------|--------|----------|
| 1 | Remove second "+ Add New Ride" button (keep top one only) | ✅ Complete | Critical |
| 2 | Remove search bar from rides page | ✅ Complete | Critical |
| 3 | Remove "Capacity" column from rides table | ✅ Complete | Critical |
| 4 | Fix Status column - showing inactive instead of active | ✅ Complete | *Needs visual verification | Critical |
| 5 | Move "logged in as" div under GURGI admin panel in sidebar | ✅ Complete | Medium |
| 6 | Create Return to Main link above Sign Out | ✅ Complete | Medium |
| 7 | Make Return to Main & Sign Out sticky at bottom of sidebar | ✅ Complete | Medium |

### Accordion & Organization
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 8 | Create collapsible location headers with rides underneath | ⏳ | Critical |
| 9 | Maintain alphabetical sorting as default | ⏳ | Medium |

### Locations Page
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 10 | Change locations to popup modal instead of inline editing | ⏳ | Critical |
| 11 | Location form: show only Name field (hide slug from user) | ⏳ | Critical |
| 12 | Remove slug column from locations table | ⏳ | Critical |

### Rides Page UX
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 13 | Make actions always visible (not hover-only) for mobile | ⏳ | Critical |

### Vehicle Configuration Form
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 14 | Redesign: "Row 1" with "Seats per Row" input | ⏳ | Critical |
| 15 | Add "+" button to add more rows | ⏳ | Critical |
| 16 | Add "-" button to remove rows (not on first row) | ⏳ | Critical |
| 17 | Map to guests array [2,2,2] etc | ⏳ | Critical |
| 18 | Ride Type Model: Click "Row 1" label to cycle through Enum types: "Stop and Go Single Vehicle", "Interval Batch Loader", "Continuous Mover", "Corral Counter", "Multiple Interval Batch Loader", "Multiple Stop and Go Single Vehicle" | ⏳ | Critical |
| 19 | If type is "Corral Counter" show "Max Capacity" instead of "Row 1" (single value, no +/- buttons) | ⏳ | Critical |
| 20 | Fix Ride Type in edit form to include only enum types | ⏳ | Critical |

---

## 🔴 Game Play Fixes

| # | Task | Status | Priority |
|---|------|--------|----------|
| 21 | Remove "DISCOVERED" badge from groups | ⏳ | Critical |
| 22 | Remove "FRONT" text from queue | ⏳ | Critical |
| 23 | Show seat circles (hollow/filled) not just text | ⏳ | Critical |
| 24 | Fix sequential discovery - unlock 1st then 2nd then 3rd | ⏳ | Critical |
| 25 | Fix vehicle showing all rows not just one | ⏳ | Critical |
| 26 | Center vehicle vertically on screen | ⏳ | Medium |

---

## 🟠 Main Page & Navigation

| # | Task | Status | Priority |
|---|------|--------|----------|
| 27 | Fix How to Play X button to close popup | ⏳ | Critical |
| 28 | Move How to Play + Administration links to hamburger menu | ⏳ | Critical |
| 29 | Create About page from README/PRD | ⏳ | Medium |
| 30 | Fix park re-click - dropdown should reload not disappear | ⏳ | Critical |
| 31 | Add About link to hamburger menu | ⏳ | Medium |

---

## 🟠 Ride Page (Game Interface)

| # | Task | Status | Priority |
|---|------|--------|----------|
| 32 | Remove How to Play from Guest Queue sidebar | ⏳ | Critical |
| 33 | Add How to Play link to hamburger menu (reuse modal) | ⏳ | Critical |
| 34 | Guest queue: full view not sidebar (better animations) | ⏳ | Critical |
| 35 | Background particles: Change color every 3 seconds (gold → bronze → copper → yellow → gold) | ⏳ | Low |

---

## 🟢 PRD Features - Not Yet Implemented

| # | Task | Status | Priority |
|---|------|--------|----------|
| 36 | Game options popup (scenario configuration) | ⏳ | High |
| 37 | "Call for #" functionality | ⏳ | High |
| 38 | Single rider line support | ⏳ | High |
| 39 | Automatic dispatch timer | ⏳ | Medium |
| 40 | Drag-and-drop guest placement | ⏳ | Medium |
| 41 | Session timeout handling | ⏳ | Low |
| 42 | Password recovery via email | ⏳ | Low |

---

## 📋 Definitions

### Ride Type Enum
Only these should exist:
1. Stop and Go Single Vehicle
2. Interval Batch Loader
3. Continuous Mover
4. Corral Counter
5. Multiple Interval Batch Loader
6. Multiple Stop and Go Single Vehicle

### Vehicle Configuration Examples
- **[2,2,2]** = 3 rows, 2 seats each (e.g., Astro Orbiter)
- **[6,6]** = 2 rows, 6 seats each (e.g., Space Mountain)
- **[10]** = 1 corral, 10 capacity (e.g., Corral Counter)

### Slugs
All slugs auto-generated from name, NEVER manually entered by user.

---

## Summary

**Critical Tasks:** 35
**High Priority:** 3
**Medium/Low:** 4
**Total Remaining:** 42

Last Updated: 2026-03-16
