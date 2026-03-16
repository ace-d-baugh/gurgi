# GURGI - Beyond MVP Task List

## Status: Sprint 2 - PARTIALLY COMPLETE ⚠️

---

### Task 1: Complete Ride Database ✅
- **Status:** COMPLETED (54 rides added)
- **Actual-ride-count:** 54 of target 67
- **Next-add:** Additional seasonal/show attractions if requested

---

### Task 2: Game Mechanics Overhaul 🟡 PARTIAL
- **Priority:** HIGH
- **Status:** PARTIALLY COMPLETE - Core implemented
- **Sub-tasks status:**
 - ✅ Rebuild guest queue as linear array (sequential processing)
 - ✅ Implement "discovery" gameplay (tap first → revealSize → activate)
 - ✅ Remove "+2" notation - show individuals inline
 - ✅ Guest-to-seat animation (walk across screen)
 - 🟡 Vehicle entry/exit animation - NEEDS VERIFICATION
 - ✅ Vehicle states: entering, loading, ready, exiting, exited
 - ✅ Mystery/Discovered group components
 - ✅ WalkingGuest animation component
 - ✅ Score tracking (loaded, dispatched)

**Implementation:** Game.tsx (745 lines) with state management
**Last commit:** 85971008e - Game.tsx fixes

---

### Task 3: How To Play Modal ✅
- **Priority:** MEDIUM
- **Status:** COMPLETED
- **Implementation:** HowToPlayModal.tsx (9,597 bytes)
- **Integration:** Landing.tsx 
- **Features:** Centered modal, backdrop, X button, escape key, 4-step rules

---

### Task 4: Admin Panel CRUD 🟡 PARTIAL
- **Priority:** MEDIUM
- **Status:** IN PROGRESS - Components exist, polish needed
**Components exist:** RidesList, RideForm, LocationsList, ConfirmDialog, Admin.tsx

**Sub-tasks IN PROGRESS / PENDING:**
 - 🟡 Remove Location column from RidesList table view
 - 🟡 Add accordion sections to RideForm for better organization
 - ✅ Table view of rides/locations
 - ✅ Create/Edit forms with validation
 - ✅ Soft-delete (deactivate toggle)
 - ✅ Authenticated only (/proprietor)
 - ✅ Toast notifications

**Notes:** Components created in commit 6b79b324c but location column still present, no accordion structure

---

### Task 5: UI Text Changes ✅
- **Status:** COMPLETED
- **Changes applied:**
 - "Select a magical ride" → "Select a Ride..."
 - "Start Your Adventure ✨" → "Start Grouping"

---

### Task 6: Queue Visual Design 🟡 PARTIAL
- **Priority:** HIGH
- **Status:** NEEDS VERIFICATION
- **Design specifications:**
 - ✅ Single-file line formation
 - ✅ Inline guest display (colored circles)
 - 🟡 Border/box around group classification - NEEDS VERIFICATION
 - 🟡 Front-of-queue highlighted - NEEDS VERIFICATION

---

## Sprint 2 Status Summary
**Real completion: ~75%**

| Task | Status | Notes |
|------|--------|-------|
| Task 1: Ride Database | ✅ Complete | 54 rides |
| Task 2: Game Mechanics | 🟡 Partial | Core done, verify animations |
| Task 3: How To Play Modal | ✅ Complete | Fully integrated |
| Task 4: Admin CRUD | 🟡 Partial | Components exist, polish needed |
| Task 5: UI Text Changes | ✅ Complete | Applied |
| Task 6: Queue Visual Design | 🟡 Partial | Verify styling |

**Critical Items for Delegation:**
1. Remove Location column from RidesList
2. Add accordion sections to RideForm
3. Verify Game.tsx vehicle animations
4. Verify queue visual highlighting

**Next Steps:**
- Complete Task 4 polish items
- Verify Task 2 animations
- Sprint 3 planning when complete

**Repository:** Clean (no uncommitted changes)
**Last verified:** 02:04 EST 2026-03-16
