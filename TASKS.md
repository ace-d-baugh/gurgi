# G.U.R.G.I. — Task List (v2)

## Fixes

- [x] ✅ **Load left to right, top to bottom.** Vehicles travel left → right, so seats fill in that
  order (and front-to-back within a row).
- [x] ✅ **Queue front definition.** Add a "grouper" attraction host standing at the front of the
  line, facing the queue. The queue itself uses switchbacks (serpentine) to reach the front.
- [x] ✅ **Preload row dividers + numbers.** Draw lines between each preload row and number the rows.
- [x] ✅ **"Call for 1" uses the single rider line.** When a single rider line is available, calling
  for a single rider auto-selects the first single rider at the front of that line.
- [x] ✅ **Better guest models.** More definition, with a walking animation — legs that move, arms
  that swing.
- [x] ✅ **Better vehicle definition.** Make it obvious which end is the front and which is the back.
  (Orange nose + headlights at the front, red marker light at the back.)
- [x] ✅ **Ride type icons.** Continuous Mover uses the airline seat emoji 💺; the carousel horse 🎠
  belongs to the Carousel ride type.
- [x] ✅ **Even/Odd queue option** in Game Options: two switchback lines side by side (even-sized
  groups in one, odd-sized in the other), still compatible with the single rider line.
- [x] ✅ **Row requests + waiting area.** Guests may request a specific row (🙏 badge). A waiting
  area of three rows holds deferred whole groups — never one larger than the vehicle capacity.
- [x] ✅ **Double grouping toggle.** Lets the trainee stage a second set of guests in the loading
  zone behind the group currently boarding; they advance and board the next vehicle.
- [x] ✅ **Scoring: 🎯 X of Y.** Target emoji instead of golf. Score is seats filled out of seats
  possible so far (19 of 20 after one 20-seat vehicle; out of 40 when the next arrives, etc.).

## New Ride Types (replacing Interval Batch Loader / Continuous Mover / Stop & Go)

- [x] ✅ **Roller Coaster 🎢** — Interval-batch look and feel with a coaster theme: a background
  track where a ghost train visibly runs the course after every dispatch. Game Options ask:
  number of sections, rows per section, and guests per each row *individually* (rows can differ).
- [x] ✅ **Carousel 🎠** — Topless carousel with rows evenly spaced in a circle (count set in Game
  Options; guests per row asked individually). Ride timer set in options; the platform spins
  ~5 turns for that duration. Guests load → spin → unload and walk off screen.
- [x] ✅ **Flying Spinner 🛸** — Hub-and-spoke vehicle, cars at spoke ends facing the direction of
  spin (counter-clockwise); it lifts while spinning. Options ask: spokes, rows per spoke, guests
  per row individually, and ride timer (~5 rotations). Load → spin → land → unload off screen.
- [x] ✅ **Continuous Mover 💺** — Small, slow vehicles in constant motion with 2–4 loading spots;
  guests board automatically when an empty vehicle lines up with a staged loading spot. Loaded
  vehicles exit off screen right; fresh empty ones enter from the left. Options: rows (default 1,
  up to 6) and seats per row (max 4, default 2), asked per row individually. Vehicles sit
  parallel to the loading zone; guests face the loading area.
- [x] ✅ **Small Theater Ride 🎭** — Stationary box-shaped vehicle sized by its rows and seats.
  Options ask: rows per box, subsections per row, and guests per each subsection individually.
  Guests load → the show runs for the configured duration (trainee uses that time to stage the
  next audience in the preload rows) → guests exit off screen.
