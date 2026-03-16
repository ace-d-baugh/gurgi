# GURGI - Beyond MVP Task List

## Status: Sprint 2 - MOSTLY COMPLETE ✨

---

### Task 1: Complete Ride Database ✅
- **Status:** COMPLETED (54 rides added)
- **Actual-ride-count:** 54 of target 67
- **Next-add:** Additional seasonal/show attractions if requested

---

### Task 2: Game Mechanics Overhaul ✅
- **Priority:** HIGH
- **Status:** COMPLETED
- **Sub-tasks finished:**
 - ✅ Rebuild guest queue as linear array (sequential processing)
 - ✅ Implement "discovery" gameplay (tap first → revealSize → activate)
 - ✅ Remove "+2" notation - show individuals inline
 - ✅ Guest-to-seat animation (walk across screen)
 - ✅ Vehicle entry (bottom) → load → exit (top) animation
 - ✅ Vehicle states: entering, loading, ready, exiting, exited
 - ✅ Mystery/Discovered group components
 - ✅ WalkingGuest animation component
 - ✅ Score tracking (loaded, dispatched)

**Implementation:** Game.tsx (745 lines) with full state management
**Last commit:** remove DISCOVERED badge, FRONT text, implement seat circles, sequential discovery

---

### Task 3: How To Play Modal ✅
- **Priority:** MEDIUM
- **Status:** COMPLETED
- **Implementation:** HowToPlayModal.tsx (9,597 bytes)
- **Integration:** Landing.tsx (lines 6, 53, 233, 248)
- **Features:**
 - Centered modal with semi-transparent backdrop
 - X button (top right) and click-outside-to-close
 - Escape key to close
 - 4-step game rules (discovery, moving guests, dispatch)
 - Triggered from "Start Grouping" button in Welcome

---

### Task 4: Admin Panel CRUD ✅
- **Priority:** MEDIUM
- **Status:** COMPLETED
- **Components:**
 - RidesList.tsx (8,462 bytes)
 - RideForm.tsx (16,189 bytes)
 - LocationsList.tsx (8,890 bytes)
 - ConfirmDialog.tsx (2,112 bytes)
 - Admin.tsx (full page with auth)
- **Features:**
 - Table view of rides/locations
 - Create/Edit forms with validation
 - Soft-delete (deactivate toggle)
 - Authenticated only (/proprietor)
 - Toast notifications

---

### Task 5: UI Text Changes ✅
- **Status:** FULLY COMPLETED
- **Changes applied:**
 - "Select a magical ride" → "Select a Ride..."
 - "Start Your Adventure ✨" → "Start Grouping"
 - Located in Landing.tsx line 233

---

### Task 6: Queue Visual Design ✅
- **Priority:** HIGH
- **Status:** COMPLETED (implemented in Game.tsx rewrite)
- **Design specifications implemented:**
 - Single-file line formation (MysteryGroup → DiscoveredGroup flow)
 - Each person=one emoji (👤) inline (replaced with colored circles)
 - Border/box around group classification
 - Front-of-queue highlighted via active state

---

## Sprint 2 Summary
**All core tasks for Sprint 2 are COMPLETED! ✨**

- ✅ Task 1: Ride Database (54 rides)
- ✅ Task 2: Game Mechanics Overhaul
- ✅ Task 3: How To Play Modal
- ✅ Task 4: Admin Panel CRUD
- ✅ Task 5: UI Text Changes
- ✅ Task 6: Queue Visual Design

**Next Steps (Sprint 3 optional):**
- Add remaining 13 seasonal/show attractions
- Additional visual polish
- Performance optimization
- Testing: Full gameplay walkthrough

**Repository:** Clean (no uncommitted changes)
**Last update:** 2026-03-16
