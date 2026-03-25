# GURGI Project Tasks
 
## Status Legend
- ✅ Complete
- 🔄 In Progress
- ⏳ Pending
- ❌ Blocked
 
---
 
## 🔴 CRITICAL - Admin Panel Fixes
 
### Locations Page
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 1 | Fix Error "No locations found. Create your first location!" Pull information from Locations table | ⏳ | Critical |
| 2 | Sync Location information with database or change logic to show "Active" in locations table | ⏳ | Critical |
 
### Rides Page UX
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 3 | Fix error showing that 'No locations available'. -Should be fixed by fixing Task #1 | ⏳ | Critical |
 
### Rides Database
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 4 | Remove the rides collection in the test database | ⏳ | Critical |
| 5 | Add a new rides collection from /rides.json file to the test database | ⏳ | Critical | // See below for more information
 
### Vehicle Configuration Form
| # | Task | Status | Priority |
| --- | --- | --- | --- |
| 6 | Add "Add Section" & "+" button to configuration section form | ⏳ | Critical | // See below for more information
| 7 | Add "-" button to configuration section form to remove whole section | ⏳ | Critical | // See below for more information
 
## 🔴 Game Play Fixes
 
| # | Task | Status | Priority |
|---|------|--------|----------|
| 8 | Guest Queue should not be the center of the screen, they should on the left side of the screen | ⏳ | Critical | // See below for more information
| 9 | Center vehicle vertically on screen | ⏳ | Medium |
| 10 | Vehicles now have sections with visual boxes around rows contained in sections | ⏳ | Critical | // See below for more information
 
## 🟠 Ride Page (Game Interface)
 
| # | Task | Status | Priority |
|---|------|--------|----------|
| 11 | Remove Background particles from Game play | ⏳ | High |
| 12 | Allow guests queue individuals to be placed in ANY empty row of the pre-load area, up to the number of seats in the row | ⏳ | Critical | // See below for more information
 
---
 
## 🟢 PRD Features - Not Yet Implemented
 
| # | Task | Status | Priority |
|---|------|--------|----------|
| 13 | "Call for #" functionality "1", "2", "3" instead of "2", "4, "6"| ⏳ | High |
| 14 | Single rider line support | ⏳ | High |
| 15 | Automatic dispatch timer | ⏳ | Medium |
| 16 | Trainer account Creation | ⏳ | Low |
| 17 | Admin view of Trainers | ⏳ | Low |
| 18 | Password recovery via email | ⏳ | Low |
| 19 | Pixel art ride vehicles and guests to look more real | ⏳ | Low |
| 20 | Create a pre-ride queue to place guests in before getting on the ride | ⏳ | Low | // See below for more information
 
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
- **[[2,2,2],[2,2,2],[2,2,2],[2,2,2],[2,2,2]]** = 5 sections of 3 rows of 2 seats each (e.g., Big Thunder Mountain)
- **[[2],[2],[2],[2],[2],[2],[2],[2],[2],[2],[2],[2],[2],[2],[2],[2]]** = 16 sections of 1 rows of 2 seats each (e.g., Dumbo)
- **[[4,4,4,4,4,3]]** = 1 section of 6 rows of 4 or 3 seats each (e.g., it’s a small world)
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
 
### 5: Add a new rides collection from /rides.json file to the test database
 
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
  "active": true,
  "createdBy": "ObjectId(\"some number\")", // Horned King ID
  "createdAt": "some time",
  "updatedAt": "some time",
  "__v": 0
}
 
#### Solution
 
The solution is to add a new rides collection from the /rides.json file to the test database. 
 
### 6: Add "Add Section" & "+" button to configuration section form
 
#### Description
 
Currently, the configuration section form does not have an "Add Section" button or a "+" button to add more sections. Rides will now have another layer to the vehicle configuration. Sections. Foe example: Mickey and Minnie's Runnaway Railway used to have a guest array of [4,4,4,4,4,4,4,4,4,4] which meant there were 8 rows of 4 seats in each row. Now the database will be formatted as [[4,4],[4,4],[4,4],[4,4]] meaning there are 4 sections with 2 rows each and 4 seats in each row. The rows and seats are the same, but there will be grouping around certain rows. This gives a visual separation to the rows for a more accurate representation of the ride vehicle itself. This is a critical issue that needs to be fixed.
 
#### Solution
 
The solution is to add an "Add Section" button or a "+" button to add more sections. This will help match up with the new databbase format for rides. 
 
### 7: Add "-" button to configuration section form to remove whole section
 
#### Description
 
Currently, the configuration section form does not have a "-" button to remove whole sections. This is a critical issue that needs to be fixed.
 
#### Solution
 
The solution is to add a "-" button to remove whole sections. This will help match up with the new databbase format for rides. Make sure that when editing or creating a ride the sections, rows and seats are updated according to the new format of [[#],[#]] depending on the number of sections and rows and seats.
 
### 10: Vehicles now have sections with visual boxes around rows contained in sections
 
#### Description
 
Currently, the vehicles are displayed as a set of rows, with each row containing a set of seats. This is a simple and straightforward solution, but it can be improved by adding visual boxes around the rows and sections. For example, if a ride has a section with two rows, the visual boxes could be added around the rows to make it clear that they are part of the same section.
 
#### Solution
 
The solution is to add visual boxes around the rows and sections. This will make it clear that the rows and sections are part of the same section and will improve the overall visual experience.
 
### 8: Guest Queue should not be the center of the screen, they should on the left side of the screen
 
#### Description
 
Currently, the guest queue is displayed in the center of the screen, which can be distracting and take away from the main gameplay. This is a critical issue that needs to be fixed. The guest queue should be on the left side of the screen, with the vehicle on the right side.
 
#### Solution
 
The solution is to move the guest queue to the left side of the screen, with the vehicle on the right side. This will improve the overall visual experience and make it clearer that the guest queue is separate from the vehicle. But do not create a separate view for the guest queue, as this will create confusion and make it difficult for users to navigate the game and animate the guests "walking" to their seats.
 
### 12: Allow guests queue individuals to be placed in ANY empty seat in vehicle
 
#### Description
 
Currently, the guests queue is limited to being placed in the first row of seats. This means that if a group of guests is larger than the row, they will not be able to fit in the vehicle. This is a critical issue that needs to be fixed.
 
#### Solution
 
The solution is to allow the guests to be placed in any pre-load row up to the number of seats in that row.
 
### 20: Create a pre-ride queue to place guests in before getting on the ride
 
#### Description
 
Currently, the animation takes a guest from the queue and places them in their seat. Normally, in real life, a guest would go from the queue to a staging spot (pre-load) before getting on the ride. This would be nice to have for timed rides and for rides that allow for double grouping. However, this is not a requirement for all rides, so it should be implemented on Interval Batch Loader rides only, but we will add it for all ride types for now.
 
#### Solution
 
The solution is to create a pre-ride queue that allows guests to be placed in a row before getting in their seats on the ride. The Pre-Load area is static and always there. The ride vehicle animates next to it. The user will place the queue guests in a specific row instead of the seats, but cannot fill the Pre-Load row more than there are seats.This will improve the overall experience and make it easier for users to navigate the game and animate the guests "walking" to their seats.

#### Interval Batch Loader Example

As the game starts, on the left hand side, there is a queue with 8-10 groups of guests, in a single file line, signified by a single guest for each group. I would like it to be an animated human avatar, 2-d pixel-art graphic like the style of Super Mario Bros. To the right of the queue, there is a load platform and the vehicle. The vehicle is based on the database ride guests array. The vehicle will have sections of rows or just rows of seats. The load platform is static and always there. The ride vehicle animates up from off screen next to it. On the load platform next to where the vehicle animates to, are empty rows with horizontal lines between the rows. This is the Pre-Load area. 
To start the game the trainee will select the first gray guest group avatar to reveal the amount of guests in the group and their group color. The size of group could range from 1-40 so there needs to be enough space to push back the line to see up to 40 colored guest avatars. The trainee may choose to start grouping from the revealed group or choose to reveal the group directly behind the first group. The trainee may then select one or more avatars from any of the revealed, colored groups or proceed down the line exposing the size of the groups and their colors. Revealing the groups is not automatic. They must be selected, in order, in order to be expanded and designated with a color. When the trainee chooses to place an individual avatar in a row, they will select the avatar and select a row for them to walk to instead of the seats of the vehicle. They can select one or more avatars from any exposed groups and place them in any row they want to, but cannot fill the Pre-Load row more than there are seats available for that row. 

If the vehicle has 4 rows of 4 seats, and the queue has 5 groups (2,4,2,6,2). The trainee selects the first group avatar and finds that there are 2 in the first group. He selects the both individuals in the revealed group and then selects the first row to start the animation of those avatars walking to the first row. He then selects the second group leader, which has moved to the front of the line, and finds that there are 4 in that group by seeing that number of avatars and the color of the group changing from gray to a different color. The trainee selects each avatar from the group and places them in the second pre-load row. The trainee then selects the third group leader and finds that there are 2 in that group by seeing that number of avatars and the color of the group changing from gray to a different color. The trainee selects each avatar from the group and places them in the first pre-load row and they walk to the row with the initial group of 2 avatars. The trainee then selects the fourth group leader and finds that there are 6 in that group by seeing that number of avatars and the color of the group changing from gray to a different color. The trainee chooses to reveal the fifth group to see how many people are in it. This reveals a group of 2. The trainee selects 4 individuals from the fourth group and chooses to place them in the third pre-load row. Then the trainee selects the other two from the the fourth group and places them in the fourth pre-load row. The trainee then selects the 2 avatars from the fifth group and places them in the fourth pre-load row with the other 2 already placed. The trainee then selects the send vehicle and all of the avatars move from the pre-load area to their seats and the vehicle animates up off the screen. The trainee then get's to fill another pre-load area with more avatars. 

Not all seats need to be filled in order to send a vehicle. If the trainee wanted to, they could load from the back row first and then move to the front row. The trainee could also load from the front row first and then move to the back row or start in any row they wish. 