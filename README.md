# 🎢 G.U.R.G.I. - Guest Unit Ride Grouper Interface
 
> **Transform theme park training with gamified learning**
 
A browser-based training application that helps Disney theme park cast members master the art of efficiently and safely grouping guests onto ride vehicles—before they ever work with real guests.
 
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-green)](https://www.mongodb.com/)
 
---
 
## 🎯 Why G.U.R.G.I.?
 
Training new theme park ride attendants to group guests efficiently is challenging. G.U.R.G.I. provides:
 
- ✅ **Safe Practice Environment** - Learn without the pressure of real guests waiting
- ✅ **Realistic Scenarios** - Train on actual Disney World ride configurations
- ✅ **Progressive Difficulty** - Adjustable settings let trainers increase complexity over time
- ✅ **Immediate Feedback** - Visual cues help trainees understand mistakes instantly
- ✅ **Gamified Experience** - Fun, engaging interface keeps trainees motivated
**The Result:** Confident, well-trained cast members who can efficiently group guests from day one.
 
---
 
## 🚀 Quick Start
 
### Prerequisites
 
- Node.js 18+ and npm
- Supabase 13+ 
- A modern browser (Chrome, Safari, Firefox, or Edge)
### Installation
 
```bash
# Clone the repository
git clone https://github.com/your-org/gurgi.git
cd gurgi
 
# Install dependencies for both client and server
npm run install:all
 
# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase URI and other settings
 
# Seed the database with ride data
npm run seed
 
# Start development servers (client + server)
npm run dev
```
 
Visit `http://localhost:5173` and you're ready to train!
 
---
 
## 🎮 How It Works
 
### For Trainers
 
1. **Select a Ride Type** - Choose from three different ride types
2. **Configure Settings** - Adjust ride size, timer, guest flow, difficulty, and visibility options
3. **Start Training** - Hand over to your trainee and observe
4. **Review Performance** - Use completion stats to guide improvement
### For Trainees
 
1. **Tap Groups** - Reveal how many guests are in each party
2. **Select Guests** - Choose the right number for each row
3. **Place in Vehicle** - Tap a load row or seat for your selected guests to go to the loading zone
4. **Dispatch** - Send the vehicle when ready or it will send when the timer runs out
5. **Repeat** - Complete multiple vehicles to finish your training round
### Visual Learning
 
Guests are rendered as an Unreal Engine human figure, starting **gray**. When a trainee taps the first guest in a group, the entire party changes to a **random color**, revealing how many guests are in that party. A selected group that the trainee is actively placing is visually distinguished (e.g., highlighted outline). If you place too many guests in a row, the row **flashes red** and **shakes**—instant feedback that guides better decisions.
 
---
 
## 🏰 Supported Parks & Rides
 
### Magic Kingdom
Classics like **Space Mountain**, **Big Thunder Mountain**, **Seven Dwarfs Mine Train**, **TRON Lightcycle**, and more.
 
### EPCOT
**Test Track**, **Guardians of the Galaxy: Cosmic Rewind**, **Frozen Ever After**, and more.
 
### Hollywood Studios
**Slinky Dog Dash**, **Rise of the Resistance**, **Tower of Terror**, and other studio favorites.
 
### Animal Kingdom
**Expedition Everest**, **Avatar Flight of Passage**, **Kilimanjaro Safaris**, and more.
 
All attractions are fully configured with accurate vehicle layouts and operational parameters.
 
---
 
## 🛠️ Tech Stack
 
### Frontend (FIX THIS SECTION AS NEEDED)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Unreal Engine** for 3D guest and vehicle rendering
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Vite** for lightning-fast builds
### Backend
- **Node.js 18** with Express
- **TypeScript** for type safety
- **Supabase** with Postgres
- **JWT** authentication
- **bcrypt** for password security
### Deployment
- **Nginx** reverse proxy
- **PM2** process management
- **Let's Encrypt** SSL certificates
- Deployed at **gurgi.digitalelegance.com**
---
 
## 🎨 Key Features
 
### 🧍 Unreal Engine Guest Rendering
 
Guests are rendered as nondescript humanoid using Unreal Engine. Their default state is **gray**. When a trainee taps the lead guest in a queue group, that entire party changes to a **random color**, revealing group size. The trainee can then select that group to begin placing them in the vehicle loading zone, or tap another group to reveal its size first. Seated guests animate into their vehicle positions.
 
### 🎲 Procedurally Balanced Guest Queue
 
Rather than purely random generation, the guest queue is pre-generated as an ordered array designed to progress from **easy-to-group combinations** toward increasingly **difficult combinations**, eventually producing scenarios that are nearly impossible to group optimally without using the "Call for #" feature. This gives trainees a natural difficulty ramp within a single session.
 
Groups are generated using real-world party size probability distributions:
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
This mirrors actual theme park demographics for authentic training.
 
### 🎯 Scoring
 
Scoring is inspired by golf: **lower is better**. Your score is the total number of **empty seats** dispatched across all vehicles. A perfect round is a score of **0**—every seat filled on every vehicle. Trainees are encouraged to minimize wasted capacity.
 
### ⏱️ Flexible Training Modes
 
**Timed Mode** - Add pressure with countdown timers (configurable from 30 seconds to 10 minutes)
 
**Practice Mode** - No timer, focus on technique and accuracy
 
**Trainer-Configurable Settings** (set before handing off to trainee):
- Ride Type (Interval Batch Loader, Continuous Mover, Stop and Go Single Vehicle)
- Size of vehicle (1–20 rows)
- Number of vehicle divisions (1-20)
- Number of guests per row (1–20)
- Countdown timer on/off and duration
- Group size visibility (hidden until tapped, or always visible)
- Number of visible guests in queue (10–100)
- Max group size (1–40)
- Number of vehicles to complete (1–10)
- Double grouping on/off
- Single rider queue on/off
- Row requests on/off
- Even/odd queue mode
### 🚗 Ride Types
 
**Interval Batch Loader** - The vehicle enters the load area empty, loads fully, then dispatches off screen. The next vehicle arrives shortly after. Short, focused grouping windows.
 
**Continuous Mover** - A string of vehicles continuously passes through the load area. Each vehicle loads guests in a small window of time or space as it moves on. Quick, small-scale grouping decisions are made in rapid succession.
 
**Stop and Go Single Vehicle** - One vehicle loads a group, runs the attraction, then returns to unload and reload simultaneously. The trainee has only the ride's runtime to group the next set of guests before the vehicle returns.
 
### 📋 Queue Modes
 
**Standard Queue** - A single queue of guests in mixed party sizes. Filling the queue two by two (unless the group is) of an odd number then there is an empty space next to them.
 
**Even/Odd Queues** - Two separate queues: one containing only even-numbered groups, one containing only odd-numbered groups. Used for attractions where guests approach from separated lanes.
 
**Single Rider Addition** - either queue option can optionally have a separate single rider queue enabled, used to fill individual empty seats. Groups in this queue are ALWAYS single and the color is always the same (black)
 
### 📞 "Call for #" Feature
 
The trainee can press a numbered button (1–9) to request a specific group size from the standby queue. If a group of that exact size exists in the upcoming queue, the **first matching group** changes color and animatedly moves forward to the front. If no matching group exists, a message is displayed: *"No groups of [#] available."* Only one group moves forward per call.
 
### 🔁 Double Grouping
 
When enabled, the trainee can load a second set of guests into the loading zone behind the current group that is boarding the vehicle. This pre-stages the next vehicle's guests for faster throughput. Recommended for more experienced trainees.
 
### 🙋 Row Requests
 
When enabled, a guest dialog may occasionally appear from the lead guest in the queue indicating a row preference. The trainee can either honor it (seat them in the requested row) or defer the group to the side. A maximum of **3 groups** can be held in the deferred side queue at one time, and they will be prioritized on the next load cycle.
 
---
 
## 📬 Contact
 
**Project Maintainer:** Digital Elegance
**Email:** ace@digitalelegance.com
**Website:** [gurgi.digitalelegance.com](https://gurgi.digitalelegance.com)
 
---
 
## 🎢 Ready to Train?
 
Visit **[gurgi.digitalelegance.com](https://gurgi.digitalelegance.com)** to start training your Theme Park Attractions Hosts today!
 
---
 
<div align="center">
  <sub>Built with ❤️ for Theme Park Attractions Hosts everywhere</sub>
</div>