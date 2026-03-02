# Product Requirements Document (PRD)

## G.U.R.G.I. - Guest Unit Ride Grouper Interface

**Version:** 1.0  
**Last Updated:** March 2, 2026  
**Project Owner:** Digital Elegance  
**Deployment URL:** gurgi.digitalelegance.com

---

## 1. Executive Summary

### 1.1 Product Overview
G.U.R.G.I. (Guest Unit Ride Grouper Interface) is a browser-based training application designed to help Disney theme park cast members learn how to efficiently and safely group guests onto ride vehicles. The application gamifies the learning experience, allowing trainers to customize scenarios based on specific rides and operational parameters.

### 1.2 Problem Statement
New cast members at Disney theme parks need practical training on grouping guests quickly and efficiently onto various ride vehicles. Traditional training methods may not provide enough low-stakes practice opportunities before working with real guests. G.U.R.G.I. provides a safe, repeatable, and customizable training environment.

### 1.3 Target Users
- **Primary:** Disney theme park trainers and new cast members
- **Secondary:** Theme park operations managers
- **Tertiary:** Administrators managing ride configurations

### 1.4 Success Metrics
- Training completion rates
- Time to proficiency for new cast members
- User satisfaction scores from trainers
- Accuracy of guest grouping in simulated scenarios

---

## 2. Product Goals & Objectives

### 2.1 Core Goals
1. Provide realistic training simulations for all major Disney ride types
2. Enable trainers to customize training scenarios to match real operational needs
3. Create an engaging, game-like experience that builds confidence
4. Support all four Disney World parks with extensibility for future locations

### 2.2 Non-Goals (Out of Scope)
- Real-time operational management of actual rides
- Guest-facing applications
- Mobile native apps (browser-based only)
- Multilingual support (English only in v1.0)
- Analytics dashboard for performance tracking (future phase)

---

## 3. User Personas & Stories

### 3.1 Personas

#### Admin (The Horned King)
- **Role:** System administrator
- **Technical Skill:** Moderate
- **Goals:** Maintain accurate ride database, manage system access
- **Frustrations:** Outdated or incorrect ride configurations

#### Trainer (Operations Lead)
- **Role:** Disney cast member responsible for training
- **Technical Skill:** Low to moderate
- **Goals:** Train new cast members efficiently, customize scenarios to match real conditions
- **Frustrations:** One-size-fits-all training that doesn't match actual ride configurations

#### Trainee (New Cast Member)
- **Role:** New Disney employee learning guest grouping
- **Technical Skill:** Low
- **Goals:** Learn quickly, gain confidence, understand grouping logic
- **Frustrations:** Fear of making mistakes with real guests

### 3.2 User Stories

#### Admin Stories
- As an admin, I need to create, edit, and soft-delete rides so the ride database stays current
- As an admin, I need to manage park locations so trainers can filter rides appropriately
- As an admin, I need secure login access so unauthorized users cannot modify the database
- As an admin, I need to recover my password via email so I can regain access if needed

#### Trainer Stories
- As a trainer, I need to select specific rides so I can train cast members on relevant attractions
- As a trainer, I need to filter rides by park so I can quickly find the right attraction
- As a trainer, I need to customize game settings (timer, guest flow, vehicle count) so training matches operational reality
- As a trainer, I need to enable/disable single rider lines so training reflects current operations
- As a trainer, I need to toggle timer mode so I can control pressure levels during training
- As a trainer, I need to adjust guest visibility and group sizes so I can increase difficulty progressively
- As a trainer, I need to enable double-grouping where applicable so cast members learn all operational modes
- As a trainer, I need to call for specific group sizes so I can teach cast members how to handle special requests
- As a trainer, I need direct URLs to specific rides so I can bookmark frequently used scenarios

#### Trainee Stories
- As a trainee, I need to tap on groups to reveal their size so I can practice the real grouping workflow
- As a trainee, I need visual feedback (colors, outlines) so I understand which guests I've selected
- As a trainee, I need to select guests and assign them to rows so I can learn efficient grouping patterns
- As a trainee, I need clear error feedback (red flashes, shaking) so I learn when I've made mistakes
- As a trainee, I need a "Send It!" button so I can dispatch the vehicle when I'm ready
- As a trainee, I need to work with single rider lines so I can learn to fill empty seats
- As a trainee, I need to experience timed scenarios so I can build speed and confidence
- As a trainee, I need progressive challenge so I stay engaged and motivated

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization

#### 4.1.1 Admin Login
- **URL:** `gurgi.digitalelegance.com/proprietor`
- **Fields:**
  - Username input (required)
  - Password input (required, masked)
  - "Forgot Password" link
- **Credentials:**
  - Username: `hornedking`
  - Password: `Munch13s&Crunch13s`
- **Behavior:**
  - Successful login redirects to CRUD interface
  - Failed login shows error message
  - Session timeout after 60 minutes of inactivity

#### 4.1.2 Password Recovery
- Forgot password page requests username
- System sends password to `ace@digitalelegance.com`
- Confirmation message displayed to user

#### 4.1.3 Session Management
- Admin sessions persist across page refreshes
- Logout functionality available in header
- Automatic logout on session expiration

### 4.2 Admin Interface (CRUD)

#### 4.2.1 Rides Table
**Display:**
- Scrollable table showing up to 15 rows at a time
- Columns: Name, Location, [Actions]
- Default sort: Alphabetical by name
- Sort options: Name (A-Z, Z-A), Location (alphabetical)
- Filter by location (dropdown)

**Actions:**
- ✏️ Edit icon: Opens ride edit form
- 🗑️ Delete icon: Shows confirmation popup
  - Confirmation: "Are you sure you want to delete [Ride Name]?"
  - Yes: Sets `active: false` (soft delete)
  - No: Cancels action
- "Add Ride" button (top right corner)

#### 4.2.2 Locations Table
**Display:**
- Scrollable table showing up to 15 rows at a time
- Columns: Name, [Actions]
- Default sort: Creation order
- Sort options: Name (A-Z, Z-A)

**Actions:**
- ✏️ Edit icon: Opens location edit form
- 🗑️ Delete icon: Shows confirmation popup (soft delete)

#### 4.2.3 Ride Creation/Edit Form
**Fields:**
1. **Ride Name** (text input, required)
   - Max length: 100 characters
   - Validation: Must be unique

2. **Location** (dropdown, required)
   - Options populated from Locations table
   - Only shows active locations

3. **Type of Ride** (dropdown, required)
   - Interval Batch Loader
   - Multiple Interval Batch Loader
   - Continuous Mover
   - Stop and Go Single Vehicle
   - Multiple Stop and Go Single Vehicle
   - Corral Counter
   - Custom

4. **Number of Loads** (slider, 2-6)
   - Only visible when "Multiple Interval Batch Loader" or "Multiple Stop and Go Single Vehicle" selected
   - Default: 2

5. **Rows** (number input, required)
   - Min: 1, Max: 50
   - Default: 1
   - Disabled for "Corral Counter" type (defaults to 1)

6. **Guests Per Row** (number input array)
   - One input field per row
   - Min: 1, Max: 50
   - Labels: "Row 1", "Row 2", etc.

7. **Double Grouping Allowed** (checkbox)
   - Default: false
   - Allows groups to be split across vehicles/loads

8. **Single Rider Line Available** (checkbox)
   - Default: false

9. **Even and Odd Lines** (checkbox)
   - Default: false
   - Used for alternating load patterns

**Actions:**
- Save button: Validates and saves to database
- Cancel button: Returns to CRUD interface without saving
- Validation errors shown inline

#### 4.2.4 Location Creation/Edit Form
**Fields:**
1. **Location Name** (text input, required)
   - Max length: 100 characters
2. **Active Status** (checkbox, default: true)

**Actions:**
- Save button
- Cancel button

### 4.3 Trainer Interface (Main Page)

#### 4.3.1 Landing Page
**URL:** `gurgi.digitalelegance.com`

**Header:**
- Title: "G.U.R.G.I. - Guest Unit Ride Grouper Interface"
- Subtitle: "Disney Cast Member Training System"

**Park Selection:**
- Four park icons displayed horizontally:
  - Magic Kingdom (with icon)
  - EPCOT (with icon)
  - Disney's Hollywood Studios (with icon)
  - Disney's Animal Kingdom (with icon)
- Clickable icons filter ride dropdown

**Ride Selection:**
- Dropdown menu showing all rides
- Filtered by park when park icon clicked
- Shows ride name and location
- Sorted alphabetically

**Action:**
- "GO" button (disabled until ride selected)
- Clicking "GO" loads game options popup

#### 4.3.2 Direct URL Access
**Format:** `gurgi.digitalelegance.com/[park-slug]/[ride-slug]/`

**Examples:**
- `gurgi.digitalelegance.com/magic-kingdom/barnstormer/`
- `gurgi.digitalelegance.com/epcot/test-track/`

**Behavior:**
- Bypasses landing page
- Goes directly to game options popup for specified ride
- Shows 404 if ride not found or inactive

### 4.4 Game Options Popup

#### 4.4.1 Settings Available
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
   - Default: Based on ride configuration
   - Visible only if ride supports it
   - Allows splitting groups across multiple vehicles

7. **Number of Vehicles to Load** (slider)
   - Range: 1-10
   - Default: 3
   - Label: "Complete [X] vehicles to finish training round"

**Actions:**
- "Play" button (bottom center)
- "Cancel" button (returns to ride selection)

#### 4.4.2 Validation
- All settings have valid ranges enforced
- Invalid inputs show inline error messages
- "Play" button disabled until all inputs valid

### 4.5 Game Interface

#### 4.5.1 Layout
**Top Bar:**
- Ride name (left)
- Timer display (center, if enabled)
  - Countdown format: MM:SS
  - Turns yellow at 30 seconds remaining
  - Turns red at 10 seconds remaining
- "Send It!" button (center, replaces timer if no timer mode)
- Settings icon (right) - returns to game options

**Main Area:**
- Guest queue line (left side, scrollable)
- Ride vehicle visualization (right side)
- Single rider line (if applicable, separate queue)

**Bottom Bar:**
- "Call for [#]" button (if enabled)
- Current progress: "Vehicle [X] of [Y]"

#### 4.5.2 Guest Queue System

**Guest Appearance:**
- Guests appear as avatar icons
- Default state: Gray silhouette
- Queue displays guests in a line formation
- Scrollable if more guests than fit on screen

**Group Size Generation:**
- Groups generated using probability distribution:
  - Groups 1-2: Most common (40% combined)
  - Groups 3-6: Common (38.5% combined)
  - Groups 7-15: Less common (16.5% combined)
  - Groups 16-40: Rare (5% combined)
- Max group size respects trainer's setting
- Groups generated dynamically as queue depletes

**Group Activation (Tap to Show Mode ON):**
1. Trainee taps first guest in next group
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
- **Inactive:** Gray silhouette
- **Active Group:** Colored (one of 6 colors)
- **Selected:** White outline around individual avatars
- **Moving:** Animation shows guests walking to vehicle

#### 4.5.3 Guest Selection

**Selecting Guests:**
1. Click/tap on individual avatar to select
2. Selected avatars get white outline
3. Can select multiple guests from same group
4. Cannot exceed row capacity in selection

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

#### 4.5.4 Vehicle Row System

**Vehicle Display:**
- Visual representation of ride vehicle
- Shows all rows with seat indicators
- Empty seats shown as hollow circles/seats
- Filled seats show guest avatars
- Row capacity displayed (e.g., "Row 1: [●●○○] 2/4")

**Placing Guests in Rows:**
1. Trainee selects guests (outlined in white)
2. Trainee taps on target row
3. **If selection fits:**
   - Guests animate from queue to row
   - Seats fill left to right
   - Selected avatars disappear from queue
   - Selection cleared
4. **If selection doesn't fit:**
   - Row flashes red
   - Guests shake slightly
   - Error sound (optional)
   - Selection remains active
   - Tooltip: "Too many guests for this row"

**Row States:**
- **Empty:** All seats hollow/empty
- **Partially Filled:** Some seats filled, some empty
- **Full:** All seats filled
- **Overfull Attempt:** Red flash animation

#### 4.5.5 Single Rider Line

**When Available:**
- Separate queue labeled "Single Riders"
- Shows only guests with group size = 1
- Generated with same probability as main line
- Visual distinction (different icon or badge)

**Usage:**
- Trainee can select from single rider line
- Used to fill remaining seats in partially filled rows
- Same selection and placement mechanics

#### 4.5.6 Vehicle Dispatch

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

#### 4.5.7 Round Completion

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

#### 4.5.8 Error Handling

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

## 5. Data Model

### 5.1 Database Schema

#### 5.1.1 Rides Collection
```typescript
interface Ride {
  _id: ObjectId;              // Auto-generated MongoDB ID
  name: string;               // Display name (unique)
  nameSlug: string;           // URL-friendly slug (unique)
  location: ObjectId;         // Reference to Locations collection
  rideType: RideTypeEnum;     // See enum below
  guests: number[][] | number[]; // 2D array for multi-interval, 1D for others
  evenOddLines: boolean;      // Alternating load pattern
  singleRiders: boolean;      // Single rider line available
  rowRequest: boolean;        // Guests can request specific rows
  doubleGroupable: boolean;   // Groups can span vehicles
  active: boolean;            // Soft delete flag
  createdAt: Date;            // Timestamp
  updatedAt: Date;            // Timestamp
}
```

**RideTypeEnum:**
```typescript
enum RideType {
  INTERVAL_BATCH_LOADER = "Interval Batch Loader",
  MULTIPLE_INTERVAL_BATCH_LOADER = "Multiple Interval Batch Loader",
  CONTINUOUS_MOVER = "Continuous Mover",
  STOP_AND_GO_SINGLE_VEHICLE = "Stop and Go Single Vehicle",
  MULTIPLE_STOP_AND_GO_SINGLE_VEHICLE = "Multiple Stop and Go Single Vehicle",
  CORRAL_COUNTER = "Corral Counter",
  CUSTOM = "Custom"
}
```

**Guests Array Structure:**
- Single interval: `[2, 2, 2, 2]` = 4 rows of 2 guests each
- Multiple intervals: `[[2,2,2], [2,2,2]]` = 2 loads, each with 3 rows of 2
- Single large vehicle: `[14]` = 1 row of 14 guests
- Mixed rows: `[4, 4, 4, 4, 4, 3]` = 5 rows of 4, 1 row of 3

#### 5.1.2 Locations Collection
```typescript
interface Location {
  _id: ObjectId;              // Auto-generated MongoDB ID
  name: string;               // Display name (unique)
  slug: string;               // URL-friendly slug (unique)
  active: boolean;            // Soft delete flag
  createdAt: Date;            // Timestamp
  updatedAt: Date;            // Timestamp
}
```

#### 5.1.3 Admin Users Collection
```typescript
interface AdminUser {
  _id: ObjectId;              // Auto-generated MongoDB ID
  username: string;           // Unique username
  passwordHash: string;       // Hashed password (bcrypt)
  email: string;              // For password recovery
  lastLogin: Date;            // Last login timestamp
  createdAt: Date;            // Timestamp
  updatedAt: Date;            // Timestamp
}
```

### 5.2 Initial Data Load

#### 5.2.1 Locations (4 Records)
1. Magic Kingdom
2. EPCOT
3. Disney's Hollywood Studios
4. Disney's Animal Kingdom

#### 5.2.2 Rides (67+ Records)
**Magic Kingdom (18 rides):**
- Astro Orbiter
- Barnstormer
- Big Thunder Mountain
- Buzz Lightyear's Space Ranger Spin
- Dumbo
- it's a small world
- Jungle Cruise: Port
- Jungle Cruise: Starboard
- Mad Tea Party
- Magic Carpets of Aladdin
- Peter Pan's Flight
- Pirates of the Caribbean
- Prince Charming Regal Carrousel
- Seven Dwarfs Mine Train
- Space Mountain
- Tiana's Bayou Adventure
- Tomorrowland Speedway
- TRON Lightcycle / Run

**EPCOT (11 rides):**
- Frozen Ever After
- Gran Fiesta Tour
- Guardians of the Galaxy: Cosmic Rewind
- Journey Into Imagination with Figment
- Living with the Land
- Mission: SPACE
- Remy's Ratatouille Adventure
- The Seas with Nemo and Friends
- Soarin' Wing
- Soarin' Middle
- Spaceship Earth
- Test Track

**Disney's Hollywood Studios (9 rides):**
- Alien Swirling Saucers
- Mickey and Minnie's Runaway Railway
- Millennium Falcon: Smugglers Run
- Rockin' Rollercoaster
- Slinky Dog Dash
- Star Tours
- Star Wars: Rise of the Resistance
- Toy Story Mania!
- The Twilight Zone Tower of Terror

**Disney's Animal Kingdom (6 rides):**
- Avatar Flight of Passage
- Expedition Everest
- Kali River Rapids
- Kilimanjaro Safaris
- Na'vi River Journey

**Note:** Rides with incomplete data (Winnie the Pooh, PeopleMover, Dinosaur, Indiana Jones) are excluded from initial load and marked for future completion.

### 5.3 Group Size Probability Distribution

Used for random guest group generation:

```javascript
const groupSizeProbabilities = {
  1: 0.06,      2: 0.34,      3: 0.12,      4: 0.18,
  5: 0.08,      6: 0.075,     7: 0.035,     8: 0.03,
  9: 0.015,     10: 0.01,     11: 0.0075,   12: 0.005,
  13: 0.0025,   14: 0.0025,   15: 0.00533,  16: 0.00459,
  17: 0.00395,  18: 0.00340,  19: 0.00293,  20: 0.00252,
  21: 0.00217,  22: 0.00187,  23: 0.00161,  24: 0.00138,
  25: 0.00119,  26: 0.00102,  27: 0.00088,  28: 0.00076,
  29: 0.00065,  30: 0.00056,  31: 0.00048,  32: 0.00042,
  33: 0.00036,  34: 0.00031,  35: 0.00027,  36: 0.00023,
  37: 0.00020,  38: 0.00017,  39: 0.00015,  40: 0.00013
};
```

**Implementation:**
- Generate cumulative probability array
- Use random number (0-1) to select group size
- Respect trainer's max group size setting
- Generate new groups as queue depletes

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Page load time: < 3 seconds on standard broadband
- Game response time: < 100ms for user interactions
- Support 50+ concurrent users
- Database queries: < 500ms average

### 6.2 Security
- Admin password hashed with bcrypt (10+ rounds)
- HTTPS required for all pages
- Session tokens expire after 60 minutes
- SQL injection prevention (using MongoDB with parameterized queries)
- XSS protection (input sanitization)
- CSRF tokens for admin forms

### 6.3 Browser Compatibility
- Chrome 90+ (primary)
- Safari 14+ (primary, iPad focus)
- Firefox 88+
- Edge 90+
- No Internet Explorer support

### 6.4 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly (semantic HTML)
- Color contrast ratios: 4.5:1 minimum
- Touch targets: 44x44px minimum

### 6.5 Scalability
- Horizontal scaling capability for web servers
- MongoDB sharding ready
- CDN for static assets
- Caching strategy for ride data

### 6.6 Reliability
- 99% uptime target
- Automated database backups (daily)
- Error logging and monitoring
- Graceful degradation for offline scenarios

---

## 7. Technical Architecture

### 7.1 Technology Stack

**Frontend:**
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API or Redux Toolkit
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Animation:** Framer Motion or React Spring
- **Build Tool:** Vite

**Backend:**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Authentication:** JWT + bcrypt
- **Email:** Nodemailer

**Database:**
- **Primary:** MongoDB 6+
- **ODM:** Mongoose
- **Hosting:** MongoDB Atlas (cloud) or self-hosted

**Deployment:**
- **Server:** VPS at gurgi.digitalelegance.com
- **Web Server:** Nginx (reverse proxy)
- **Process Manager:** PM2
- **SSL:** Let's Encrypt (auto-renewal)

**DevOps:**
- **Version Control:** Git
- **CI/CD:** GitHub Actions or similar
- **Environment Management:** Docker (optional)

### 7.2 System Architecture Diagram

```
[Browser/Client]
       ↓
   [Nginx]
       ↓
  [Node.js/Express API]
       ↓
   [MongoDB]
```

**Static Assets:** Served via Nginx  
**API Endpoints:** Proxied to Express backend  
**Database:** MongoDB connection via Mongoose

### 7.3 API Endpoints

#### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `POST /api/auth/forgot-password` - Password recovery
- `GET /api/auth/verify` - Verify session token

#### Rides Endpoints
- `GET /api/rides` - List all active rides (with optional location filter)
- `GET /api/rides/:slug` - Get single ride by slug
- `POST /api/rides` - Create new ride (admin only)
- `PUT /api/rides/:id` - Update ride (admin only)
- `DELETE /api/rides/:id` - Soft delete ride (admin only)

#### Locations Endpoints
- `GET /api/locations` - List all active locations
- `GET /api/locations/:id` - Get single location
- `POST /api/locations` - Create location (admin only)
- `PUT /api/locations/:id` - Update location (admin only)
- `DELETE /api/locations/:id` - Soft delete location (admin only)

#### Game Endpoints
- `GET /api/game/config/:rideId` - Get game configuration for ride
- `POST /api/game/generate-guests` - Generate guest queue (using probabilities)

### 7.4 Folder Structure

```
gurgi-app/
├── client/                 # Frontend React app
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── admin/     # Admin CRUD components
│   │   │   ├── game/      # Game interface components
│   │   │   ├── trainer/   # Trainer selection components
│   │   │   └── shared/    # Shared/common components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript types/interfaces
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Backend Express API
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   └── server.ts      # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                 # Shared types between client/server
│   └── types/
│
├── docs/                   # Documentation
├── scripts/                # Build/deployment scripts
├── .env.example
└── README.md
```

### 7.5 Deployment Plan

**VPS Setup (gurgi.digitalelegance.com):**
1. Configure Nginx as reverse proxy
2. Install Node.js 18+
3. Install MongoDB or configure MongoDB Atlas connection
4. Set up SSL with Let's Encrypt
5. Configure PM2 for process management
6. Set up automated backups

**Environment Variables:**
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gurgi
JWT_SECRET=<secure-random-string>
ADMIN_EMAIL=ace@digitalelegance.com
SMTP_HOST=<email-server>
SMTP_PORT=587
SMTP_USER=<email-user>
SMTP_PASS=<email-password>
```

**Nginx Configuration:**
- Serve React build from `/var/www/gurgi`
- Proxy `/api/*` to `localhost:3000`
- Enable gzip compression
- Configure SSL certificates
- Set up redirects (HTTP → HTTPS)

---

## 8. User Interface Design

### 8.1 Design Principles
- **Clarity:** Information should be immediately understandable
- **Efficiency:** Minimize clicks to accomplish tasks
- **Feedback:** Provide immediate visual feedback for all actions
- **Consistency:** Use consistent patterns throughout
- **Accessibility:** Usable by all cast members regardless of ability

### 8.2 Color Scheme

**Primary Colors:**
- Disney Blue: `#0063B2` (primary actions, headers)
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

### 8.3 Typography
- **Primary Font:** Inter or similar sans-serif
- **Headings:** 24-32px, bold
- **Body:** 16px, regular
- **Labels:** 14px, medium
- **Buttons:** 16px, semi-bold

### 8.4 Iconography
- Park icons for each Disney location
- Seat/guest avatars (simple silhouette style)
- Edit/delete icons (pencil, trash can)
- Settings icon (gear)
- Timer icon (clock)

### 8.5 Animation Guidelines
- Guest movement: 300-500ms ease-out
- Error flash: 200ms, 2 iterations
- Shake animation: 100ms, 3 iterations
- Fade transitions: 200ms
- Loading spinners for data fetching

### 8.6 Wireframes Priority Areas

**High Priority (MVP):**
1. Landing page with park selection
2. Game interface with queue and vehicle
3. Admin login and CRUD tables
4. Game options popup

**Medium Priority:**
5. Ride creation/edit forms
6. Completion screen with stats

**Low Priority (Future):**
7. Analytics dashboard
8. User management interface

---

## 9. Development Phases

### Phase 1: Foundation (Weeks 1-2)
**Backend:**
- Set up MongoDB database
- Create Mongoose models
- Implement authentication system
- Build CRUD API endpoints
- Seed initial ride and location data

**Frontend:**
- Initialize React project with TypeScript
- Set up routing structure
- Create basic component structure
- Implement API service layer

**DevOps:**
- Configure VPS environment
- Set up Nginx
- Configure SSL certificates
- Set up MongoDB (local or Atlas)

### Phase 2: Admin Interface (Weeks 3-4)
**Backend:**
- Finalize admin authentication
- Password recovery email system
- Admin API endpoints testing

**Frontend:**
- Admin login page
- CRUD interface for rides
- CRUD interface for locations
- Form validation
- Admin dashboard layout

### Phase 3: Trainer Interface (Weeks 5-6)
**Backend:**
- Guest generation algorithm
- Game configuration endpoints

**Frontend:**
- Landing page with park selection
- Ride selection dropdown with filtering
- Game options popup
- Settings persistence
- Direct URL routing to rides

### Phase 4: Game Interface (Weeks 7-9)
**Backend:**
- Real-time guest generation API
- Game state management

**Frontend:**
- Guest queue rendering
- Vehicle visualization
- Guest selection mechanics
- Row placement logic
- Color and animation system
- Timer functionality
- "Send It!" dispatch system
- Single rider line (if applicable)
- "Call for #" functionality

### Phase 5: Polish & Testing (Weeks 10-11)
- Comprehensive testing (unit, integration, E2E)
- Bug fixes
- Performance optimization
- Accessibility audit
- Cross-browser testing
- User acceptance testing with trainers

### Phase 6: Deployment & Launch (Week 12)
- Production deployment
- Database migration
- Monitoring setup
- Documentation finalization
- Trainer onboarding materials
- Soft launch with limited users

---

## 10. Testing Strategy

### 10.1 Unit Testing
- Backend: Jest + Supertest
- Frontend: Jest + React Testing Library
- Target: 80%+ code coverage

### 10.2 Integration Testing
- API endpoint testing
- Database interaction testing
- Authentication flow testing

### 10.3 End-to-End Testing
- Cypress or Playwright
- Critical user flows:
  1. Admin login → Create ride → Save
  2. Trainer selects ride → Configure game → Play
  3. Trainee completes full round
  4. Direct URL access to specific ride

### 10.4 User Acceptance Testing
- Test with real trainers and trainees
- Collect feedback on usability
- Validate training effectiveness
- Iterate based on feedback

### 10.5 Performance Testing
- Load testing with k6 or Apache JMeter
- Test concurrent user scenarios
- Database query optimization

### 10.6 Security Testing
- OWASP Top 10 vulnerability scan
- Penetration testing (basic)
- Authentication bypass attempts
- SQL injection tests (even though using NoSQL)

---

## 11. Known Limitations & Future Enhancements

### 11.1 Known Limitations (V1.0)
- No mobile native apps
- English language only
- No performance analytics/reporting
- No multi-tenant support (single admin)
- No role-based access control
- Single-player only (no multiplayer training)

### 11.2 Future Enhancements

**Phase 2 Features:**
- Performance analytics dashboard
- Trainer feedback and scoring system
- Leaderboards for trainees
- Export training completion reports
- Ride difficulty ratings

**Phase 3 Features:**
- Multi-language support (Spanish, French, etc.)
- Mobile native apps (iOS/Android)
- Multiplayer training mode (compete with peers)
- Advanced AI suggestions for optimal grouping
- Voice command support

**Phase 4 Features:**
- Integration with Disney training LMS
- VR/AR training mode
- Real-time operational data integration
- Predictive guest flow modeling
- Custom ride builder with drag-and-drop

**Other Theme Parks:**
- Universal Studios configuration
- Six Flags configuration
- Generic theme park templates
- Multi-tenant architecture for licensing

---

## 12. Success Criteria & KPIs

### 12.1 Launch Success Criteria
- ✅ All 4 Disney parks loaded with accurate ride data
- ✅ 50+ rides available for training
- ✅ Admin can create/edit/delete rides without technical support
- ✅ Trainers can select and configure games in < 2 minutes
- ✅ Game runs smoothly on iPad and desktop browsers
- ✅ Zero critical bugs in production

### 12.2 Key Performance Indicators

**Technical KPIs:**
- Uptime: > 99%
- Page load time: < 3 seconds
- API response time: < 500ms
- Error rate: < 1%

**User Engagement KPIs:**
- Active trainers per week: Target 20+
- Training sessions per week: Target 100+
- Average session duration: Target 10-15 minutes
- Return user rate: Target 70%+

**Training Effectiveness KPIs:**
- Trainee confidence rating: Target 4+/5
- Time to proficiency: Target < 2 weeks
- Real-world grouping accuracy: Target 90%+
- Trainer satisfaction: Target 4.5+/5

### 12.3 Measurement & Monitoring

**Analytics Tools:**
- Google Analytics for page tracking
- Custom logging for game events
- MongoDB queries for usage statistics
- User feedback forms

**Monitoring:**
- Uptime monitoring (e.g., UptimeRobot)
- Error tracking (e.g., Sentry)
- Performance monitoring (e.g., New Relic)
- Server health monitoring (PM2 dashboard)

---

## 13. Risks & Mitigation

### 13.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| VPS downtime | High | Medium | Implement monitoring, automated backups, quick restore procedures |
| MongoDB data loss | High | Low | Daily automated backups, replication setup |
| Browser compatibility issues | Medium | Medium | Comprehensive cross-browser testing, graceful degradation |
| Performance degradation with scale | Medium | Medium | Load testing, optimization, caching strategy |
| Security breach | High | Low | Security best practices, regular audits, HTTPS enforcement |

### 13.2 Product Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user adoption | High | Medium | User testing, trainer feedback loop, onboarding materials |
| Inaccurate ride data | Medium | Medium | Validation with Disney operations, easy update mechanism |
| Poor training effectiveness | High | Low | Pilot testing, iterative improvements, feedback collection |
| Feature creep delaying launch | Medium | High | Strict scope management, MVP focus, phased releases |

### 13.3 Operational Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Lack of maintenance resources | Medium | Medium | Documentation, modular architecture, external support option |
| Disney operational changes | Low | Medium | Flexible configuration system, admin control |
| Scaling beyond capacity | Medium | Low | Cloud migration plan, horizontal scaling architecture |

---

## 14. Documentation Requirements

### 14.1 Technical Documentation
- Architecture diagram
- API documentation (Swagger/OpenAPI)
- Database schema documentation
- Deployment guide
- Environment setup guide
- Troubleshooting guide

### 14.2 User Documentation
- Admin user guide (CRUD operations)
- Trainer user guide (game setup)
- Trainee quick start guide
- Video tutorials (3-5 minutes each)
- FAQ document

### 14.3 Code Documentation
- Inline code comments
- Component documentation (JSDoc/TSDoc)
- README files for each major module
- Changelog maintenance

---

## 15. Appendix

### 15.1 Glossary

| Term | Definition |
|------|------------|
| Cast Member | Disney employee who works at the theme parks |
| Grouping | The process of organizing guests into ride vehicles efficiently |
| Interval Batch Loader | Ride type where vehicles load in batches at timed intervals |
| Continuous Mover | Ride type where vehicles move continuously (e.g., conveyor belt) |
| Soft Delete | Setting `active: false` instead of permanently deleting data |
| Single Rider | Guest traveling alone who can fill empty seats |
| Double Grouping | Allowing groups to continue across multiple vehicles |
| Even/Odd Lines | Alternating which load line is active |

### 15.2 References
- Disney Operations Manual (internal reference)
- Theme park ride type classifications
- User experience research on training applications
- Accessibility standards (WCAG 2.1)

### 15.3 Contact Information
- **Project Owner:** Digital Elegance
- **Technical Contact:** ace@digitalelegance.com
- **Deployment:** gurgi.digitalelegance.com

### 15.4 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 2, 2026 | Digital Elegance | Initial PRD creation |

---

## 16. Approval & Sign-off

**Document Prepared By:** Claude (Anthropic)  
**Document Reviewed By:** _Pending_  
**Document Approved By:** _Pending_  
**Approval Date:** _Pending_

---

**End of Product Requirements Document**
