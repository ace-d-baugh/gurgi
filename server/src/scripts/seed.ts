import { config } from 'dotenv';
import { join } from 'path';

// Try multiple path strategies for cross-platform compatibility
const possiblePaths = [
  join(process.cwd(), '..', '..', '.env'),
  join(process.cwd(), '.env'),
  '/a0/usr/projects/gurgi/.env',
];

let loaded = false;
for (const envPath of possiblePaths) {
  try {
    const result = config({ path: envPath });
    if (!result.error && process.env.MONGODB_URI) {
      console.log('✅ Loaded .env from:', envPath);
      loaded = true;
      break;
    }
  } catch (e) {
    // Continue to next path
  }
}

if (!loaded) {
  console.error('❌ Could not load .env from any location');
}

console.log('MONGODB_URI is:', process.env.MONGODB_URI ? 'SET ✓' : 'NOT SET ✗');

import mongoose from 'mongoose';
import connectDB from '../config/database';
import { Location, Ride, AdminUser } from '../models';

// Helper to create slug
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const locations = [
  { name: 'Magic Kingdom', slug: 'magic-kingdom' },
  { name: 'EPCOT', slug: 'epcot' },
  { name: 'Hollywood Studios', slug: 'hollywood-studios' },
  { name: 'Animal Kingdom', slug: 'animal-kingdom' }
];

const magicKingdomRides: any[] = [
  {
    name: 'Astro Orbiter',
    rideType: 'Stop and Go Single Vehicle',
    guests: [2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Barnstormer',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Big Thunder Mountain',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Buzz Lightyear’s Space Ranger Spin',
    rideType: 'Continuous Mover',
    guests: [2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Dumbo',
    rideType: 'Stop and Go Single Vehicle',
    guests: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'it’s a small world',
    rideType: 'Interval Batch Loader',
    guests: [4,4,4,4,4,3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Jungle Cruise Port',
    rideType: 'Interval Batch Loader',
    guests: [14],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Jungle Cruise Starboard',
    rideType: 'Interval Batch Loader',
    guests: [16],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Mad Tea Party',
    rideType: 'Stop and Go Single Vehicle',
    guests: [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Magic Carpets of Aladdin',
    rideType: 'Stop and Go Single Vehicle',
    guests: [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Peter Pan’s Flight',
    rideType: 'Continuous Mover',
    guests: [3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Pirates of the Caribbean',
    rideType: 'Interval Batch Loader',
    guests: [4,4,4,4,4,3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Prince Charming Regal Carrousel',
    rideType: 'Corral Counter',
    guests: [90],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Seven Dwarfs Mine Train',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2,2,2,2,2,2,2,2],
    evenOddLines: true,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Space Mountain',
    rideType: 'Interval Batch Loader',
    guests: [6,6],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Tiana’s Bayou Adventure',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Tomorrowland Speedway',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'TRON Lightcycle / Run',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2,2,2,2,2],
    evenOddLines: true,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
];

const epcotRides: any[] = [
  {
    name: 'Frozen Ever After',
    rideType: 'Interval Batch Loader',
    guests: [4,4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Gran Fiesta Tour',
    rideType: 'Interval Batch Loader',
    guests: [4,4,4,4,3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Guardians of the Galaxy: Cosmic Rewind',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2,2,2,2,2,2,2,2],
    evenOddLines: true,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Journey Into Imagination with Figment',
    rideType: 'Interval Batch Loader',
    guests: [3,4,3,4,3,4,3,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Living with the Land',
    rideType: 'Interval Batch Loader',
    guests: [4,4,4,4,4,4,4,4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Mission: SPACE',
    rideType: 'Multiple Interval Batch Loader',
    guests: [4,4,4,4,4,4,4,4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Remy’s Ratatouille Adventure',
    rideType: 'Multiple Interval Batch Loader',
    guests: [3,3,3,3,3,3],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'The Seas with Nemo and Friends',
    rideType: 'Continuous Mover',
    guests: [3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Soarin’ Wing',
    rideType: 'Stop and Go Single Vehicle',
    guests: [10,10,7],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Soarin’ Middle',
    rideType: 'Stop and Go Single Vehicle',
    guests: [11,11,11],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Spaceship Earth',
    rideType: 'Continuous Mover',
    guests: [2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Test Track',
    rideType: 'Interval Batch Loader',
    guests: [3,3,3,3,3,3,3,3],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: true,
    active: true
  },
];

const hollywoodRides: any[] = [
  {
    name: 'Alien Swirling Saucers',
    rideType: 'Multiple Stop and Go Single Vehicle',
    guests: [3,3,3,3,3,3,3,3,3,3,3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Mickey and Minnie’s Runaway Railway',
    rideType: 'Interval Batch Loader',
    guests: [4,4,4,4,4,4,4,4],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Millennium Falcon: Smugglers Run',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Rockin’ Rollercoaster',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Slinky Dog Dash',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2,2,2,2,2,2,2],
    evenOddLines: true,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Star Tours',
    rideType: 'Stop and Go Single Vehicle',
    guests: [8,8,7,8,9],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Star Wars: Rise of the Resistance',
    rideType: 'Interval Batch Loader',
    guests: [4,4,4,4],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Toy Story Mania!',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'The Twilight Zone Tower of Terror',
    rideType: 'Multiple Interval Batch Loader',
    guests: [3,4,3,4,3,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
];

const animalKingdomRides: any[] = [
  {
    name: 'Avatar Flight of Passage',
    rideType: 'Multiple Interval Batch Loader',
    guests: [8,8],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Dinosaur',
    rideType: 'Multiple Interval Batch Loader',
    guests: [4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Expedition Everest',
    rideType: 'Interval Batch Loader',
    guests: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Indiana Jones',
    rideType: 'Multiple Interval Batch Loader',
    guests: [4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
  {
    name: 'Kali River Rapids',
    rideType: 'Continuous Mover',
    guests: [12],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false,
    active: true
  },
  {
    name: 'Kilimanjaro Safaris',
    rideType: 'Interval Batch Loader',
    guests: [5,5,5,5,5,5,5,5,5],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true,
    active: true
  },
];


const locationPhotoUrls: Record<string, string> = {
  'magic-kingdom': 'https://images.unsplash.com/photo-1597466599360-3b9be9f27c5d?w=800&q=80',
  'epcot': 'https://images.unsplash.com/photo-1597466599360-3b9be9f27c5d?w=800&q=80',
  'hollywood-studios': 'https://images.unsplash.com/photo-1542382257-80f0e9b1647c?w=800&q=80',
  'animal-kingdom': 'https://images.unsplash.com/photo-1534723320830-9529e5a9df19?w=800&q=80'
};

const seedDatabase = async () => {
  try {
    await connectDB();

    await Ride.deleteMany({});
    await Location.deleteMany({});
    await AdminUser.deleteMany({});

    const locationMap: Map<string, string> = new Map();
    for (const loc of locations) {
      const created = await Location.create({
        ...loc,
        isActive: true,
        photoUrl: locationPhotoUrls[loc.slug] || ''
      });
      locationMap.set(loc.slug, (created as any)._id.toString());
      console.log(`Created: ${loc.name}`);
    }

    const mk = locationMap.get('magic-kingdom');
    const epcot = locationMap.get('epcot');
    const hollywood = locationMap.get('hollywood-studios');
    const animal = locationMap.get('animal-kingdom');

    let createdCount = 0;

    for (const ride of magicKingdomRides) {
      await Ride.create({
        ...ride,
        location: mk,
        isActive: true,
        nameSlug: slugify(ride.name),
        photoUrl: ''
      });
      createdCount++;
    }
    for (const ride of epcotRides) {
      await Ride.create({
        ...ride,
        location: epcot,
        isActive: true,
        nameSlug: slugify(ride.name),
        photoUrl: ''
      });
      createdCount++;
    }
    for (const ride of hollywoodRides) {
      await Ride.create({
        ...ride,
        location: hollywood,
        isActive: true,
        nameSlug: slugify(ride.name),
        photoUrl: ''
      });
      createdCount++;
    }
    for (const ride of animalKingdomRides) {
      await Ride.create({
        ...ride,
        location: animal,
        isActive: true,
        nameSlug: slugify(ride.name),
        photoUrl: ''
      });
      createdCount++;
    }

    console.log(`Created ${createdCount} rides total!`);
    console.log(` - ${magicKingdomRides.length} Magic Kingdom rides`);
    console.log(` - ${epcotRides.length} EPCOT rides`);
    console.log(` - ${hollywoodRides.length} Hollywood Studios rides`);
    console.log(` - ${animalKingdomRides.length} Animal Kingdom rides`);

    // Try to create admin user
    try {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('Munch13s&Crunch13s', 10);
      await AdminUser.create({ username: 'hornedking', passwordHash: hash, email: 'ace@digitalelegance.com' });
      console.log('✅ Admin user created');
    } catch (bcryptError) {
      console.log('⚠️ Skipping admin user creation (bcrypt module issue)');
    }

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
