# Product Requirements Document (PRD)

## G.U.R.G.I. - Guest Unit Ride Grouper Interface

**Version:** 1.0  
**Last Updated:** July 1, 2026  
**Project Owner:** Digital Elegance  
**Deployment URL:** gurgi.digitalelegance.com

---

## 1. Executive Summary

### 1.1 Product Overview
G.U.R.G.I. (Guest Unit Ride Grouper Interface) is a browser-based training application designed to help theme park attraction hosts learn how to efficiently and safely group guests onto ride vehicles. The application gamifies the learning experience, allowing trainers to customize scenarios based on specific rides and operational parameters.

### 1.2 Problem Statement
New attractions hosts at theme parks need practical training on grouping guests quickly and efficiently onto various ride vehicles. Traditional training methods may not provide enough low-stakes practice opportunities before working with real guests. G.U.R.G.I. provides a safe, repeatable, and customizable training environment.

### 1.3 Target Users
- **Primary:** Theme park trainers and new attractions hosts
- **Secondary:** Theme park operations managers

### 1.4 Success Metrics
- Training completion rates
- Time to proficiency for new attraction hosts
- User satisfaction scores from trainers
- Accuracy of guest grouping in simulated scenarios

---

## 2. Product Goals & Objectives

### 2.1 Core Goals
1. Provide realistic training simulations for all major ride types
2. Enable trainers to customize training scenarios to match real operational needs
3. Create an engaging, game-like experience that builds confidence

### 2.2 Non-Goals (Out of Scope)
- Real-time operational management of actual rides
- Guest-facing applications
- Mobile native apps (browser-based only)
- Multilingual support (English only in v1.0)
- Analytics dashboard for performance tracking (future phase)

---

## 4. Functional Requirements

### 4.1 Trainer Interface (Main Page)

#### 4.1.1 Landing Page
**URL:** `gurgi.digitalelegance.com`

**Header:**
- Title: "G.U.R.G.I. - Guest Unit Ride Grouper Interface"
- Subtitle: "Attraction Host Training System"

**Ride Type Selection:**
- Three ride types icons displayed horizontally:
  - Interval Batch Loader (with icon)
  - Continuous Mover (with icon)
  - Stop and Go Single Vehicle (with icon)

**Ride Size Sections:**
- input of 1-100
- Default: 5

**Ride Rows per Section:**
- Slider with 1-20 steps
- Default: 2

**Guests per Row:**
- Slider with 1-20 steps
- Default: 2

**Action:**
- "GO" button (disabled until all three sections filled)
- Clicking "GO" loads game options popup

### 4.2 Game Options Popup

#### 4.2.1 Settings Available
**Timer Settings:**
1. **Timed Mode** (toggle switch)
   - Default: OFF
   - When ON, reveals timer duration controls

2. **Timer Duration** (time picker)
   - Visible only when Timed Mode = ON
   - Minutes: 0-10 (increment by 1)
   - Seconds: 0-59 (increment by 5)
   - Default: 2 minutes 0 seconds
   - Minimum: 30 seconds

**Guest Flow Settings:**
3. **Number of Visible Guests** (slider)
   - Range: 10-100
   - Increment: 5
   - Default: 30
   - Label shows current value

4. **Max Guests Per Group** (number input)
   - Range: 1-40
   - Default: 20
   - Note: "Larger groups are less likely to appear"

**Gameplay Settings:**
5. **Tap to Show Groups** (toggle switch)
   - Default: ON
   - When OFF, all group sizes visible from start

6. **Double Grouping Allowed** (toggle switch)
   - Default: OFF
   - Allows splitting groups across multiple vehicles

7. **Number of Vehicles to Load** (slider)
   - Range: 1-10
   - Default: 3
   - Label: "Complete [X] vehicles to finish training round"

**Actions:**
- "Play" button (bottom center)
- "Cancel" button (returns to ride selection)

#### 4.2.2 Validation
- All settings have valid ranges enforced
- Invalid inputs show inline error messages
- "Play" button disabled until all inputs valid

### 4.3 Game Interface

#### 4.3.1 Layout
**Top Bar:**
- Ride Type (left)
- Timer display (center, if enabled)
  - Countdown format: MM:SS
  - Turns yellow at 20% seconds remaining
  - Turns red at 10% seconds remaining
- "Send It!" button (center, replaces timer if no timer mode)
- Settings icon (right) - returns to game options

**Main Area:**
- Guest queue line 
   - Desktop/Tablet: left side
   - Mobile: center, bottom
- Ride vehicle visualization 
   Desktop/Tablet:right side
   Mobile: center, top
- Single rider line (if applicable, separate additional queue)
   - Desktop/Tablet: above standby queue(s)
   - Mobile: left of standby queue(s)
- Vehicle Load Area
   - Desktop/Tablet: right of standby queue(s) to the left of ride vehicle
   - Mobile: above queue(s) below ride vehicle

**Bottom Bar:**
- "Call for [#]" button (if enabled)
- Current progress: "Vehicle [X] of [Y]"

#### 4.3.2 Guest Queue System

**Guest Appearance:**
- Guests appear as humanoid 3D figures
- Default state: Gray figure
- Queue displays guests in a side by side line formation

**Group Size Generation:**
- Groups are generated using real-world party size probability distributions:
   - **4.93%** party of 1
   - **41.74%** party of 2
   - **15.95%** party of 3
   - **29.92%** party of 4
   - **2.99%** party of 5
   - **1.99%** party of 6
   - **0.6%** party of 7
   - **0.8%** party of 8
   - **0.3%** party of 9
   - **0.2%** party of 10
   - Larger parties (11–40) possible with diminishing probability
- This mirrors actual theme park demographics for authentic training.

**Group Activation (Tap to Show Mode ON):**
1. Trainee taps on first guest in next group
2. All guests in that group change from gray to color:
   - Color rotation: Blue → Red → Green → Yellow → Orange → Purple
   - Then repeats
3. White outline appears around tapped guest
4. Group size badge appears above group (e.g., "👥 4")

**Group Activation (Tap to Show Mode OFF):**
- All groups show their colors from start
- Group size badges visible on all groups
- Tapping selects entire group immediately

**Visual States:**
- **Inactive:** Gray figure
- **Active Group:** Colored (one of 6 colors)
- **Selected:** White outline around individual figure
- **Moving:** Animation shows guests walking to vehicle

#### 4.3.3 Guest Selection

**Selecting Guests:**
1. Click/tap on individual figure to select
2. Selected figure gets white outline
3. Can select multiple guests from same group by tapping on more guests from that group
4. Cannot exceed row capacity for vehicle

**Selection Rules:**
- Can only select from one group at a time
- Tapping guest from different group clears previous selection
- Can select from 1 to max row capacity guests

**"Call for [#]" Button:**
- Button labeled with specific group size (e.g., "Call for 4")
- Clicking searches queue for matching group size
- If found, that group moves to front and activates
- If not found, shows message: "No group of [#] available"
- Useful for filling specific row capacities

#### 4.3.4 Vehicle Row System

**Vehicle Display:**
- Visual representation of ride vehicle
- Shows all rows with seat indicators
- Empty seats shown in 3D space as empty seats
- Filled seats show guest figures sitting in seats in 3D space

**Placing Guests in Preload Rows:**
1. Trainee selects guests (outlined in white)
2. Trainee taps on target preload row
3. **If selection fits:**
   - Guests animate walking from queue to preload row
   - Seats fill right to left
   - Selection cleared
4. **If selection doesn't fit:**
   - Row flashes red
   - Guests shake slightly
   - Error sound (optional)
   - Selection remains active
   - Tooltip: "Too many guests for this row"

**Preload Row States:**
- **Empty:** All seats have a corresponding hollow/empty circle on the floor
- **Partially Filled:** Some circles filled with standing guests, some empty
- **Full:** All circles filled with standing guests
- **Overfull Attempt:** Red flash animation

#### 4.3.5 Single Rider Line

**When Available:**
- Separate queue labeled "Single Riders"
- Shows only guests with group size = 1
- Visual distinction (color is black)

**Usage:**
- Trainee can select from single rider line
- Used to fill remaining seats in partially filled rows
- Same selection and placement mechanics
- Trainee may add more than one single rider to a row if needed

#### 4.3.6 Loading and Unloading
**Loading:**
- 

#### 4.3.7 Vehicle Dispatch

**Manual Dispatch ("Send It!" Button):**
- Button always visible (center position)
- Enabled once at least one guest placed
- Click sends current vehicle
- Triggers dispatch animation
- New empty vehicle loads
- Progress counter increments

**Automatic Dispatch (Timer Mode):**
- When timer reaches 0:00
  - Current vehicle dispatches automatically
  - Incomplete rows are noted (for scoring/feedback)
  - New vehicle loads
  - Timer resets and restarts
  - Progress counter increments

**Double Grouping:**
- If enabled, partially filled rows can continue to next vehicle
- Visual indicator shows "Continued from previous vehicle"
- Guests stay in rows across vehicle dispatch

#### 4.3.8 Round Completion

**Completion Trigger:**
- All vehicles loaded (based on trainer setting)
- Final vehicle dispatched

**Completion Screen:**
- "Training Round Complete!"
- Summary statistics:
  - Total guests loaded
  - Total time (if timer used)
  - Average time per vehicle
  - Efficiency rating (% seats filled)
- Actions:
  - "Play Again" (same settings)
  - "Change Settings" (return to options)
  - "Choose Different Ride" (return to landing)

#### 4.3.9 Error Handling

**Common Errors:**
1. **Too many guests selected:** Row flash red, shake animation
2. **No guests selected when clicking row:** Tooltip "Select guests first"
3. **Timer expires:** Auto-dispatch current vehicle state
4. **Network issues:** Offline message, allow continue with current state

### 4.6 Responsive Design Requirements

**Desktop (1920x1080 and above):**
- Full layout with side-by-side queue and vehicle
- Optimal for training presentation

**Tablet (768-1024px):**
- Stacked layout if needed
- Touch-optimized controls
- Primary target device

**Mobile (320-767px):**
- Vertical stacking
- Simplified vehicle visualization
- Functional but not primary use case

---

## 5. User Interface Design

### 5.1 Design Principles
- **Clarity:** Information should be immediately understandable
- **Efficiency:** Minimize clicks to accomplish tasks
- **Feedback:** Provide immediate visual feedback for all actions
- **Consistency:** Use consistent patterns throughout
- **Accessibility:** Usable by all attraction hosts regardless of ability

### 5.2 Color Scheme

**Primary Colors:**
- Fantasy Blue: `#0063B2` (primary actions, headers)
- Magic Purple: `#6B2B9F` (accents, highlights)

**Guest Colors (6-color rotation):**
1. Blue: `#4A90E2`
2. Red: `#E74C3C`
3. Green: `#27AE60`
4. Yellow: `#F39C12`
5. Orange: `#E67E22`
6. Purple: `#9B59B6`

**Neutral Colors:**
- Dark Gray: `#2C3E50` (text)
- Medium Gray: `#95A5A6` (inactive guests)
- Light Gray: `#ECF0F1` (backgrounds)
- White: `#FFFFFF`

**Status Colors:**
- Success: `#27AE60` (green)
- Warning: `#F39C12` (yellow)
- Error: `#E74C3C` (red)

### 5.3 Typography
- **Primary Font:** Inter or similar sans-serif
- **Headings:** 24-32px, bold
- **Body:** 16px, regular
- **Labels:** 14px, medium
- **Buttons:** 16px, semi-bold

### 5.4 Iconography
- Rows per section icon (chair emoji)
- Guests per row (person emoji)
- Settings icon (gear)
- Timer icon (clock)

### 5.5 Animation Guidelines
- Guest movement: 300-500ms ease-out
- Error flash: 200ms, 2 iterations
- Shake animation: 100ms, 3 iterations
- Fade transitions: 200ms
- Loading spinners for data fetching of ride building

### 5.6 Wireframes Priority Areas

**High Priority (MVP):**
1. Landing page with ride type selection
2. Game interface with queue and vehicle
4. Game options popup

**Medium Priority:**
5. Completion screen with stats

**Low Priority (Future):**
6. Analytics dashboard

---
