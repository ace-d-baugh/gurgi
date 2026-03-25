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
| 8 | Create collapsible location headers with rides underneath | ✅ Complete | Critical |
| 9 | Maintain alphabetical sorting as default | ✅ Complete | Medium |
 
### Locations Page
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 10 | Change locations to popup modal instead of inline editing | ✅ Complete | Critical |
| 11 | Location form: show only Name field (hide slug from user) | ✅ Complete | Critical |
| 12 | Remove slug column from locations table | ✅ Complete | Critical |
| 13 | Sync Location information with database or change logic to show "Active" in locations table | ⏳ | Critical |
 
### Rides Page UX
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 14 | Make actions always visible (not hover-only) for mobile | ✅ Complete | Critical |
 
### Rides Database
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 15 | Remove the rides collection in the test database | ⏳ | Critical |
| 16 | Add a new rides collection from /rides.json file to the test database | ⏳ | Critical | // See below for more information
 
### Vehicle Configuration Form
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 17 | Redesign: "Row 1" with "Seats per Row" input | ✅ | Critical |
| 18 | Add "+" button to add more rows | ✅ | Critical |
| 19 | Add "-" button to remove rows (not on first row) | ✅ | Critical |
| 20 | Map to guests array [2,2,2] etc | ✅ | Critical |
| 21 | Ride Type Model: Click "Row 1" label to cycle through Enum types: "Stop and Go Single Vehicle", "Interval Batch Loader", "Continuous Mover", "Corral Counter", "Multiple Interval Batch Loader", "Multiple Stop and Go Single Vehicle" | ✅ | Critical |
| 22 | If type is "Corral Counter" show "Max Capacity" instead of "Row 1" (single value, no +/- buttons) | ✅ Complete | Critical |
| 23 | Fix Ride Type in edit form to include only enum types | ✅ | Critical |
| 24 | Add "Add Section" & "+" button to configuration section form | ⏳ | Critical | // See below for more information
| 25 | Add "-" button to configuration section form to remove whole section | ⏳ | Critical | // See below for more information
 
---
 
## 🔴 Game Play Fixes
 
| # | Task | Status | Priority |
|---|------|--------|----------|
| 26 | Remove "DISCOVERED" badge from groups | ✅ Complete | Critical |
| 27 | Remove "FRONT" text from queue | ✅ Complete | Critical |
| 28 | Show seat circles (hollow/filled) not just text | ✅ Complete | Critical |
| 29 | Fix sequential discovery - trainees can select from any unlocked group | ✅ Complete | Critical |
| 30 | Fix vehicle showing all rows not just one | ✅ | Critical |
| 31 | Center vehicle vertically on screen | ⏳ | Medium |
| 32 | Vehicles now have sections with visual boxes around rows contained in sections | ⏳ | Critical | // See below for more information
| 33 | Guest Queue should not be the center of the screen, they should on the left side of the screen | ⏳ | Critical | // See below for more information
 
---
 
## 🟠 Main Page & Navigation
 
| # | Task | Status | Priority |
|---|------|--------|----------|
| 34 | Fix How to Play X button to close popup | ⏳ | Critical |
| 35 | Move How to Play + Administration links to hamburger menu | ✅ Complete | Critical |
| 36 | Create About page from README/PRD | ✅ Complete | Medium |
| 37 | Fix park re-click - dropdown should reload not disappear | ✅ Complete | Critical |
| 38 | Add About link to hamburger menu | ✅ Complete | Medium |
 
---
 
## 🟠 Ride Page (Game Interface)
 
| # | Task | Status | Priority |
|---|------|--------|----------|
| 39 | Remove How to Play from Guest Queue sidebar | ✅ Complete | Critical |
| 40 | Add How to Play link to hamburger menu (reuse modal) | ✅ Complete | Critical |
| 41 | Guest queue: full view not sidebar (better animations) | ✅ Complete | Critical |
| 42 | Remove Background particles from Game play | ⏳ | High |
| 43 | Allow guests queue individuals to be placed in ANY empty seat in vehicle | ✅ Complete | Critical | // See below for more information
 
---
 
## 🟢 PRD Features - Not Yet Implemented
 
| # | Task | Status | Priority |
|---|------|--------|----------|
| 44 | Game options popup (scenario configuration) | ✅ Complete | High |
| 45 | "Call for #" functionality "1", "2", "3" | ⏳ | High |
| 46 | Single rider line support | ⏳ | High |
| 47 | Automatic dispatch timer | ⏳ | Medium |
| 48 | Trainer account Creation | ⏳ | Low |
| 49 | Admin view of Trainers | ⏳ | Low |
| 50 | Password recovery via email | ⏳ | Low |
| 51 | Pixel art ride vehicles and guests to look more real | ⏳ | Low |
| 52 | Create a pre-ride queue to place guests in before getting on the ride | ⏳ | Low | // See below for more information
 
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
 
Last Updated: 2026-03-18
 
 
## More detail on tasks
 
### 16: Add a new rides collection from /rides.json file to the test database
 
#### Description
 
Currently, the test database contains the rides, but in a previous format. This means that the guests array is not in the correct format and the ride type will not being parsed correctly.
 
#### Current format
 
json
{
  "_id": "ObjectId(\"some number\")",
  "name": "Mickey and Minnie's Runaway Railway",
  "nameSlug": "mickey-and-minnie-s-runaway-railway",
  "location": "ObjectId for Hollywood Studios",
  "rideType": "Interval Batch Loader",
  "guests": [4,4,4,4,4,4,4,4],
  "evenOddLines": false,
  "singleRiders": true,
  "doubleGrouping": true,
  "active": true,
  "createdAt": "some time",
  "updatedAt": "some time",
  "__v": 0
}
 
#### Desired format
 
json
{
  "_id": "ObjectId(\"some number\")",
  "name": "Mickey and Minnie's Runaway Railway",
  "nameSlug": "mickey-and-minnie-s-runaway-railway",
  "location": "ObjectId for Hollywood Studios",
  "rideType": "Interval Batch Loader",
  "guests": [[4,4],[4,4],[4,4],[4,4]],
  "evenOddLines": false,
  "singleRiders": true,
  "doubleGrouping": true,
  "active": true
  "createdAt": "some time",
  "updatedAt": "some time",
  "__v": 0
}
 
#### Solution
 
The solution is to add a new rides collection from the /rides.json file to the test database. 
 
### 24: Add "Add Section" & "+" button to configuration section form
 
#### Description
 
Currently, the configuration section form does not have an "Add Section" button or a "+" button to add more sections. Rides will now have another layer to the vehicle configuration. Sections. Foe example: Mickey and Minnie's Runnaway Railway used to have a guest array of [4,4,4,4,4,4,4,4,4,4] which meant there were 8 rows of 4 seats in each row. Now the database will be formatted as [[4,4],[4,4],[4,4],[4,4]] meaning there are 4 sections with 2 rows each and 4 seats in each row. The rows and seats are the same, but there will be grouping around certain rows. This gives a visual separation to the rows for a more accurate representation of the ride vehicle itself. This is a critical issue that needs to be fixed.
 
#### Solution
 
The solution is to add an "Add Section" button or a "+" button to add more sections. This will help match up with the new databbase format for rides. 
 
### 25: Add "-" button to configuration section form to remove whole section
 
#### Description
 
Currently, the configuration section form does not have a "-" button to remove whole sections. This is a critical issue that needs to be fixed.
 
#### Solution
 
The solution is to add a "-" button to remove whole sections. This will help match up with the new databbase format for rides. Make sure that when editing or creating a ride the sections, rows and seats are updated according to the new format of [[#],[#]] depending on the number of sections and rows and seats.
 
### 32: Vehicles now have sections with visual boxes around rows contained in sections
 
#### Description
 
Currently, the vehicles are displayed as a set of rows, with each row containing a set of seats. This is a simple and straightforward solution, but it can be improved by adding visual boxes around the rows and sections. For example, if a ride has a section with two rows, the visual boxes could be added around the rows to make it clear that they are part of the same section.
 
#### Solution
 
The solution is to add visual boxes around the rows and sections. This will make it clear that the rows and sections are part of the same section and will improve the overall visual experience.
 
### 33: Guest Queue should not be the center of the screen, they should on the left side of the screen
 
#### Description
 
Currently, the guest queue is displayed in the center of the screen, which can be distracting and take away from the main gameplay. This is a critical issue that needs to be fixed. The guest queue should be on the left side of the screen, with the vehicle on the right side.
 
#### Solution
 
The solution is to move the guest queue to the left side of the screen, with the vehicle on the right side. This will improve the overall visual experience and make it clearer that the guest queue is separate from the vehicle. But do not create a separate view for the guest queue, as this will create confusion and make it difficult for users to navigate the game and animate the guests "walking" to their seats.
 
### 43: Allow guests queue individuals to be placed in ANY empty seat in vehicle
 
#### Description
 
Currently, the guests queue is limited to being placed in the first row of seats. This means that if a group of guests is larger than the row, they will not be able to fit in the vehicle. This is a critical issue that needs to be fixed.
 
#### Solution
 
The solution is to allow the guests queue individuals to be placed in any empty seat in any row in the vehicle. This will allow for more flexibility in the guest queue and allow for a more dynamic experience.
 
### 52: Create a pre-ride queue to place guests in before getting on the ride
 
#### Description
 
Currently, the animation takes a guest from the queue and places them in their seat. Normally, in real life, a guest would go from the queue to a staging spot before getting on the ride. This would be nice to have for timed rides and for rides that allow for double grouping. However, this is not a requirement for all rides, so it should be optional.
 
#### Solution
 
The solution is to create a pre-ride queue that allows guests to be placed in their seats before getting on the ride. This will improve the overall experience and make it easier for users to navigate the game and animate the guests "walking" to their seats.