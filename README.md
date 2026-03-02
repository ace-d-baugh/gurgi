# 🎢 G.U.R.G.I. - Guest Unit Ride Grouper Interface

> **Transform theme park training with gamified learning**

A browser-based training application that helps Disney theme park cast members master the art of efficiently and safely grouping guests onto ride vehicles—before they ever work with real guests.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-green)](https://www.mongodb.com/)

---

## 🎯 Why G.U.R.G.I.?

Training new cast members to group guests efficiently is challenging. G.U.R.G.I. provides:

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
- MongoDB 6+ (local or MongoDB Atlas)
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
# Edit .env with your MongoDB URI and other settings

# Seed the database with Disney ride data
npm run seed

# Start development servers (client + server)
npm run dev
```

Visit `http://localhost:5173` and you're ready to train!

---

## 🎮 How It Works

### For Trainers

1. **Select a Ride** - Choose from 67+ Disney World attractions across all 4 parks
2. **Configure Settings** - Adjust timer, guest flow, and difficulty
3. **Start Training** - Hand over to your trainee and observe
4. **Review Performance** - Use completion stats to guide improvement

### For Trainees

1. **Tap Groups** - Reveal how many guests are in each party
2. **Select Guests** - Choose the right number for each row
3. **Place in Vehicle** - Tap a row to seat your selected guests
4. **Dispatch** - Send the vehicle when full or time runs out
5. **Repeat** - Complete multiple vehicles to finish your training round

### Visual Learning

Guests start **gray** and turn **colored** when activated. Select individuals with **white outlines**, and watch them **animate** to their seats. If you select too many, the row **flashes red** and **shakes**—instant feedback that guides better decisions.

---

## 🏰 Supported Parks & Rides

### Magic Kingdom (18 rides)
From **Barnstormer** to **TRON Lightcycle**, including classics like **Space Mountain**, **Big Thunder Mountain**, and **Seven Dwarfs Mine Train**.

### EPCOT (11 rides)
Train on **Test Track**, **Guardians of the Galaxy: Cosmic Rewind**, **Frozen Ever After**, and more.

### Hollywood Studios (9 rides)
Master **Slinky Dog Dash**, **Rise of the Resistance**, **Tower of Terror**, and other studio favorites.

### Animal Kingdom (6 rides)
Practice with **Expedition Everest**, **Avatar Flight of Passage**, **Kilimanjaro Safaris**, and more.

**Total: 67+ fully configured attractions** with accurate vehicle layouts and operational parameters.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Vite** for lightning-fast builds

### Backend
- **Node.js 18** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **bcrypt** for password security

### Deployment
- **Nginx** reverse proxy
- **PM2** process management
- **Let's Encrypt** SSL certificates
- Deployed at **gurgi.digitalelegance.com**

---

## 📁 Project Structure

```
gurgi-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── admin/     # Admin CRUD interface
│   │   │   ├── game/      # Game mechanics
│   │   │   ├── trainer/   # Ride selection
│   │   │   └── shared/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API communication
│   │   └── types/         # TypeScript definitions
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth & validation
│   │   └── services/      # Business logic
│   └── package.json
│
└── shared/                 # Shared TypeScript types
```

---

## 🔐 Admin Access

Administrators can manage the ride database through a secure interface:

- **URL:** `gurgi.digitalelegance.com/proprietor`
- **Features:**
  - Create, edit, and delete rides
  - Manage park locations
  - Configure ride-specific settings (single riders, double grouping, etc.)
  - Soft delete functionality (rides remain in database but hidden)

All admin actions require authentication and are protected by JWT tokens.

---

## 🎨 Key Features

### 🎲 Realistic Guest Generation
Groups are generated using real-world probability distributions:
- **40%** of groups are 1-2 people
- **38%** are 3-6 people  
- **17%** are 7-15 people
- **5%** are 16-40 people

This mirrors actual Disney park demographics for authentic training.

### ⏱️ Flexible Training Modes

**Timed Mode** - Add pressure with countdown timers (configurable from 30 seconds to 10 minutes)

**Practice Mode** - No timer, focus on technique and accuracy

**Progressive Difficulty** - Trainers can adjust:
- Number of visible guests (10-100)
- Max group size (1-40)
- Number of vehicles to complete (1-10)
- Whether group sizes are hidden or visible

### 🎯 Special Features

- **"Call for #" Button** - Request a specific group size (e.g., "Call for 3")
- **Single Rider Lines** - Practice filling empty seats efficiently
- **Double Grouping** - Learn to continue groups across multiple vehicles
- **Row Requests** - Handle guests who want specific seating
- **Even/Odd Loading** - Train on alternating load patterns

---

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/login              # Admin login
POST   /api/auth/logout             # Admin logout  
POST   /api/auth/forgot-password    # Password recovery
GET    /api/auth/verify             # Verify session
```

### Rides
```
GET    /api/rides                   # List all rides (optional location filter)
GET    /api/rides/:slug             # Get ride by slug
POST   /api/rides                   # Create ride (admin only)
PUT    /api/rides/:id               # Update ride (admin only)
DELETE /api/rides/:id               # Soft delete (admin only)
```

### Locations
```
GET    /api/locations               # List all locations
GET    /api/locations/:id           # Get single location
POST   /api/locations               # Create location (admin only)
PUT    /api/locations/:id           # Update location (admin only)
DELETE /api/locations/:id           # Soft delete (admin only)
```

### Game
```
GET    /api/game/config/:rideId     # Get game configuration
POST   /api/game/generate-guests    # Generate guest queue
```

---

## 🗄️ Database Schema

### Rides Collection
```typescript
{
  _id: ObjectId,
  name: string,              // "Barnstormer"
  nameSlug: string,          // "barnstormer"
  location: ObjectId,        // Reference to Location
  rideType: RideTypeEnum,    // "Interval Batch Loader"
  guests: number[][] | number[], // [[2,2,2,2]] or [2,2,2,2]
  evenOddLines: boolean,
  singleRiders: boolean,
  rowRequest: boolean,
  doubleGroupable: boolean,
  active: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Locations Collection
```typescript
{
  _id: ObjectId,
  name: string,              // "Magic Kingdom"
  slug: string,              // "magic-kingdom"
  active: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📊 Development Roadmap

### ✅ Phase 1: Foundation (Weeks 1-2)
- Database setup and seeding
- Authentication system
- Basic API structure

### ✅ Phase 2: Admin Interface (Weeks 3-4)
- CRUD operations for rides and locations
- Admin authentication
- Password recovery

### 🔄 Phase 3: Trainer Interface (Weeks 5-6)
- Landing page with park selection
- Ride filtering and selection
- Game options configuration

### 🔄 Phase 4: Game Interface (Weeks 7-9)
- Guest queue rendering
- Vehicle visualization
- Selection and placement mechanics
- Animations and feedback

### 📋 Phase 5: Polish & Testing (Weeks 10-11)
- Comprehensive testing
- Performance optimization
- Accessibility improvements

### 🚀 Phase 6: Deployment (Week 12)
- Production deployment
- Documentation finalization
- User onboarding materials

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:server

# Run frontend tests only
npm run test:client

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

**Testing Stack:**
- Jest + React Testing Library (unit/integration)
- Cypress (E2E)
- Supertest (API testing)

**Target Coverage:** 80%+

---

## 🚀 Deployment

### VPS Setup

1. **Server Requirements:**
   - Ubuntu 22.04+ or similar Linux distro
   - 2GB+ RAM recommended
   - Node.js 18+
   - MongoDB 6+ (local or Atlas)
   - Nginx for reverse proxy

2. **Initial Setup:**
```bash
# Install dependencies
sudo apt update
sudo apt install nginx nodejs npm mongodb

# Install PM2 globally
sudo npm install -g pm2

# Clone and build
git clone https://github.com/your-org/gurgi.git
cd gurgi
npm run install:all
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

3. **Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name gurgi.digitalelegance.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gurgi.digitalelegance.com;
    
    ssl_certificate /etc/letsencrypt/live/gurgi.digitalelegance.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gurgi.digitalelegance.com/privkey.pem;
    
    # Serve React build
    location / {
        root /var/www/gurgi;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **SSL Setup:**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d gurgi.digitalelegance.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

5. **Environment Variables:**
```bash
# Create production .env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gurgi
JWT_SECRET=
ADMIN_EMAIL=ace@digitalelegance.com
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Standards
- TypeScript for all new code
- ESLint configuration must pass
- Write tests for new features
- Follow existing component patterns
- Use semantic commit messages

---

## 📝 Documentation

- **[Product Requirements Document](./docs/PRD.md)** - Complete product specification
- **[API Documentation](./docs/API.md)** - Detailed endpoint reference
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[User Guide](./docs/USER_GUIDE.md)** - Trainer and trainee documentation

---

## 🐛 Known Issues & Limitations

### Current Limitations (v1.0)
- English language only
- No analytics dashboard (coming in v2.0)
- Single admin account only
- Desktop and tablet optimized (mobile functional but not primary)

### Planned Enhancements
- 📊 Performance analytics and reporting
- 🏆 Leaderboards and achievements
- 🌍 Multi-language support
- 📱 Native mobile apps
- 👥 Multi-tenant support for other theme parks

See [Issues](https://github.com/your-org/gurgi/issues) for bug reports and feature requests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👏 Acknowledgments

- **Disney Operations Teams** - For operational insights and ride configurations
- **Cast Member Trainers** - For feedback during development
- **Theme Park Community** - For inspiration and support

---

## 📬 Contact

**Project Maintainer:** Digital Elegance  
**Email:** ace@digitalelegance.com  
**Website:** [gurgi.digitalelegance.com](https://gurgi.digitalelegance.com)

---

## 🎢 Ready to Train?

Visit **[gurgi.digitalelegance.com](https://gurgi.digitalelegance.com)** to start training your cast members today!

---

<div align="center">
  <sub>Built with ❤️ for Disney cast members everywhere</sub>
</div>