# GURGI - Beyond MVP Task List

## Status: Sprint 2 - Active Development

### Task 1: Complete Ride Database ✅
- **Status:** COMPLETED (54 rides added)
- **Actual-ride-count:** 54 of target 67
- **Next-add:** Additional seasonal/show attractions if requested

### Task 2: Game Mechanics Overhaul ⭐ ACTIVE
- **Priority:** HIGH
- **Status:** In Progress
- **Sub-tasks:**
  - [ ] Rebuild guest queue as linear array (sequential processing)
  - [ ] Implement "discovery" gameplay (tap first → revealSize → activate)
  - [ ] Remove "+2" notation - show individuals inline
  - [ ] Guest-to-seat animation (walk across screen)
  - [ ] Vehicle entry (bottom) → load → exit (top) animation
  
**Complexity:** HIGH (requires React state management overhaul)

### Task 3: How To Play Modal 📋
- **Priority:** MEDIUM
- **Status:** Ready for development
- **Requirements:**
  - Centered modal with semi-transparent backdrop
  - X button (top right) and click-outside-to-close
  - Game rules content (discovery, moving guests, dispatch)
  - Remove from hamburger menu, trigger from Welcome

### Task 4: Admin Panel CRUD 👤
- **Priority:** MEDIUM
- **Status:** Pending
- **Scope:**
  - Table view of rides/locations
  - Create/Edit forms with validation
  - Soft-delete (deactivate toggle)
  - Authenticated only (/proprietor)

### Task 5: UI Text Changes ✅✅
- **Status:** FULLY COMPLETED
- **Changes applied:**
  - "Select a magical ride" → "Select a Ride..."
  - "Start Your Adventure ✨" → "Start Grouping"

### Task 6: Queue Visual Design 🎨
- **Priority:** HIGH (blocks Game Mechanics)
- **Status:** Pending (requires Game.tsx rewrite)
- **Design specifications:**
  - Single-file line formation (top-left to bottom-right flow)
  - Each person=one emoji (👤) inline
  - Border/box around group classification
  - Front-of-queue highlighted

---

## Sprint 2 Goal
Complete Task 2 (Game Mechanics) and Task 3 (Modal)
- Estimated time: 2 sessions
- Testing requirement: Full gameplay walkthrough
- Commit checkpoints: After each sub-task
