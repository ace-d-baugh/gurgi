# GURGI - Beyond MVP Task List

## Status: Sprint 2 - COMPLETE ✨

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

**Implementation:** Game.tsx (745 lines)
**Commit:** 85971008e

---

### Task 3: How To Play Modal ✅
- **Priority:** MEDIUM
- **Status:** COMPLETED
- **Implementation:** HowToPlayModal.tsx (9,597 bytes)
- **Features:** Modal, backdrop, escape key, 4-step rules

---

### Task 4: Admin Panel CRUD ✅
- **Priority:** MEDIUM
- **Status:** COMPLETED
- **Components:** All CRUD components functional
- **Polish Completed:**
 - ✅ Remove Location column from RidesList (commit d404a52e7)
 - ✅ Add accordion sections to RideForm:
   * Basic Info (name, nameSlug, rideType, active)
   * Vehicle Configuration (dimensions, capacity)
   * Loading Preferences (evenOddLines, singleRiders, rowRequest, doubleGroupable)
 - ✅ Table view of rides/locations
 - ✅ Create/Edit forms with validation
 - ✅ Soft-delete (deactivate toggle)
 - ✅ Authenticated only (/proprietor)
 - ✅ Toast notifications

**Commit:** d404a52e7 (2026-03-16)

---

### Task 5: UI Text Changes ✅
- **Status:** COMPLETED
- **Changes applied:** "Select a magical ride" → "Select a Ride...", "Start Your Adventure" → "Start Grouping"

---

### Task 6: Queue Visual Design ✅
- **Priority:** HIGH
- **Status:** COMPLETED
- **Design specs:**
 - ✅ Single-file line formation
 - ✅ Inline guest display (colored circles)
 - ✅ Border/box around groups
 - ✅ Front-of-queue highlighted

---

## Sprint 2 Complete! 🎉

**All 6 core tasks finished!**

| Task | Status |
|------|--------|
| Task 1: Ride Database | ✅ Complete |
| Task 2: Game Mechanics | ✅ Complete |
| Task 3: How To Play Modal | ✅ Complete |
| Task 4: Admin CRUD | ✅ Complete |
| Task 5: UI Text Changes | ✅ Complete |
| Task 6: Queue Visual Design | ✅ Complete |

**Repository:** Updated and pushed
**Tasks in queue:** 0
**Subagents needed:** 0

**Next Steps (Optional Sprint 3):**
- Add remaining 13 seasonal/show attractions
- Visual polish
- Performance optimization

**Last verified:** 03:12 EST 2026-03-16
