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
    description: 'A stop and go single vehicle ride at Magic Kingdom.',
    rideType: 'Stop and Go Single Vehicle',
    width: 2,
    rows: 12,
    height: 4.5,
    capacity: 24,
    guests: [2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Barnstormer',
    description: 'A interval batch loader ride at Magic Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 8,
    height: 4.5,
    capacity: 16,
    guests: [2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Big Thunder Mountain',
    description: 'A interval batch loader ride at Magic Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 15,
    height: 4.5,
    capacity: 30,
    guests: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Buzz Lightyear’s Space Ranger Spin',
    description: 'A continuous mover ride at Magic Kingdom.',
    rideType: 'Continuous Mover',
    width: 2,
    rows: 1,
    height: 4.5,
    capacity: 2,
    guests: [2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Dumbo',
    description: 'A stop and go single vehicle ride at Magic Kingdom.',
    rideType: 'Stop and Go Single Vehicle',
    width: 2,
    rows: 16,
    height: 4.5,
    capacity: 32,
    guests: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'it’s a small world',
    description: 'A interval batch loader ride at Magic Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 4,
    rows: 6,
    height: 4.5,
    capacity: 23,
    guests: [4,4,4,4,4,3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Jungle Cruise Port',
    description: 'A interval batch loader ride at Magic Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 14,
    rows: 1,
    height: 4.5,
    capacity: 14,
    guests: [14],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Jungle Cruise Starboard',
    description: 'A interval batch loader ride at Magic Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 16,
    rows: 1,
    height: 4.5,
    capacity: 16,
    guests: [16],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Mad Tea Party',
    description: 'A stop and go single vehicle ride at Magic Kingdom.',
    rideType: 'Stop and Go Single Vehicle',
    width: 4,
    rows: 18,
    height: 4.5,
    capacity: 72,
    guests: [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Magic Carpets of Aladdin',
    description: 'A stop and go single vehicle ride at Magic Kingdom.',
    rideType: 'Stop and Go Single Vehicle',
    width: 4,
    rows: 16,
    height: 4.5,
    capacity: 64,
    guests: [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Peter Pan’s Flight',
    description: 'A continuous mover ride at Magic Kingdom.',
    rideType: 'Continuous Mover',
    width: 3,
    rows: 1,
    height: 4.5,
    capacity: 3,
    guests: [3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Pirates of the Caribbean',
    description: 'A interval batch loader ride at Magic Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 4,
    rows: 6,
    height: 4.5,
    capacity: 23,
    guests: [4,4,4,4,4,3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Prince Charming Regal Carrousel',
    description: 'A corral counter ride at Magic Kingdom.',
    rideType: 'Corral Counter',
    width: 90,
    rows: 1,
    height: 4.5,
    capacity: 90,
    guests: [90],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Seven Dwarfs Mine Train',
    description: 'A interval batch loader ride at Magic Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 10,
    height: 4.5,
    capacity: 20,
    guests: [2,2,2,2,2,2,2,2,2,2],
    evenOddLines: true,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Space Mountain',
    description: 'A interval batch loader ride at Magic Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 6,
    rows: 2,
    height: 4.5,
    capacity: 12,
    guests: [6,6],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Tiana’s Bayou Adventure',
    description: 'A interval batch loader ride at Magic Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 12,
    height: 4.5,
    capacity: 24,
    guests: [2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Tomorrowland Speedway',
    description: 'A interval batch loader ride at Magic Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 12,
    height: 4.5,
    capacity: 24,
    guests: [2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'TRON Lightcycle / Run',
    description: 'A interval batch loader ride at Magic Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 7,
    height: 4.5,
    capacity: 14,
    guests: [2,2,2,2,2,2,2],
    evenOddLines: true,
    singleRiders: false,
    doubleGrouping: true
  },
];

const epcotRides: any[] = [
  {
    name: 'Frozen Ever After',
    description: 'A interval batch loader ride at EPCOT.',
    rideType: 'Interval Batch Loader',
    width: 4,
    rows: 4,
    height: 4.5,
    capacity: 16,
    guests: [4,4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Gran Fiesta Tour',
    description: 'A interval batch loader ride at EPCOT.',
    rideType: 'Interval Batch Loader',
    width: 4,
    rows: 5,
    height: 4.5,
    capacity: 19,
    guests: [4,4,4,4,3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Guardians of the Galaxy: Cosmic Rewind',
    description: 'A interval batch loader ride at EPCOT.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 10,
    height: 4.5,
    capacity: 20,
    guests: [2,2,2,2,2,2,2,2,2,2],
    evenOddLines: true,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Journey Into Imagination with Figment',
    description: 'A interval batch loader ride at EPCOT.',
    rideType: 'Interval Batch Loader',
    width: 4,
    rows: 8,
    height: 4.5,
    capacity: 28,
    guests: [3,4,3,4,3,4,3,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Living with the Land',
    description: 'A interval batch loader ride at EPCOT.',
    rideType: 'Interval Batch Loader',
    width: 4,
    rows: 10,
    height: 4.5,
    capacity: 40,
    guests: [4,4,4,4,4,4,4,4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Mission: SPACE',
    description: 'A multiple interval batch loader ride at EPCOT.',
    rideType: 'Multiple Interval Batch Loader',
    width: 4,
    rows: 10,
    height: 4.5,
    capacity: 40,
    guests: [4,4,4,4,4,4,4,4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Remy’s Ratatouille Adventure',
    description: 'A multiple interval batch loader ride at EPCOT.',
    rideType: 'Multiple Interval Batch Loader',
    width: 3,
    rows: 6,
    height: 4.5,
    capacity: 18,
    guests: [3,3,3,3,3,3],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: true
  },
  {
    name: 'The Seas with Nemo and Friends',
    description: 'A continuous mover ride at EPCOT.',
    rideType: 'Continuous Mover',
    width: 3,
    rows: 1,
    height: 4.5,
    capacity: 3,
    guests: [3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Soarin’ Wing',
    description: 'A stop and go single vehicle ride at EPCOT.',
    rideType: 'Stop and Go Single Vehicle',
    width: 10,
    rows: 3,
    height: 4.5,
    capacity: 27,
    guests: [10,10,7],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Soarin’ Middle',
    description: 'A stop and go single vehicle ride at EPCOT.',
    rideType: 'Stop and Go Single Vehicle',
    width: 11,
    rows: 3,
    height: 4.5,
    capacity: 33,
    guests: [11,11,11],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Spaceship Earth',
    description: 'A continuous mover ride at EPCOT.',
    rideType: 'Continuous Mover',
    width: 2,
    rows: 2,
    height: 4.5,
    capacity: 4,
    guests: [2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Test Track',
    description: 'A interval batch loader ride at EPCOT.',
    rideType: 'Interval Batch Loader',
    width: 3,
    rows: 8,
    height: 4.5,
    capacity: 24,
    guests: [3,3,3,3,3,3,3,3],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: true
  },
];

const hollywoodRides: any[] = [
  {
    name: 'Alien Swirling Saucers',
    description: 'A multiple stop and go single vehicle ride at Disney’s Hollywood Studios.',
    rideType: 'Multiple Stop and Go Single Vehicle',
    width: 3,
    rows: 11,
    height: 4.5,
    capacity: 33,
    guests: [3,3,3,3,3,3,3,3,3,3,3],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Mickey and Minnie’s Runaway Railway',
    description: 'A interval batch loader ride at Disney’s Hollywood Studios.',
    rideType: 'Interval Batch Loader',
    width: 4,
    rows: 8,
    height: 4.5,
    capacity: 32,
    guests: [4,4,4,4,4,4,4,4],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: true
  },
  {
    name: 'Millennium Falcon: Smugglers Run',
    description: 'A interval batch loader ride at Disney’s Hollywood Studios.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 3,
    height: 4.5,
    capacity: 6,
    guests: [2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Rockin’ Rollercoaster',
    description: 'A interval batch loader ride at Disney’s Hollywood Studios.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 12,
    height: 4.5,
    capacity: 24,
    guests: [2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: true
  },
  {
    name: 'Slinky Dog Dash',
    description: 'A interval batch loader ride at Disney’s Hollywood Studios.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 9,
    height: 4.5,
    capacity: 18,
    guests: [2,2,2,2,2,2,2,2,2],
    evenOddLines: true,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Star Tours',
    description: 'A stop and go single vehicle ride at Disney’s Hollywood Studios.',
    rideType: 'Stop and Go Single Vehicle',
    width: 9,
    rows: 5,
    height: 4.5,
    capacity: 40,
    guests: [8,8,7,8,9],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Star Wars: Rise of the Resistance',
    description: 'A interval batch loader ride at Disney’s Hollywood Studios.',
    rideType: 'Interval Batch Loader',
    width: 4,
    rows: 4,
    height: 4.5,
    capacity: 16,
    guests: [4,4,4,4],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: false
  },
  {
    name: 'Toy Story Mania!',
    description: 'A interval batch loader ride at Disney’s Hollywood Studios.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 8,
    height: 4.5,
    capacity: 16,
    guests: [2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'The Twilight Zone Tower of Terror',
    description: 'A multiple interval batch loader ride at Disney’s Hollywood Studios.',
    rideType: 'Multiple Interval Batch Loader',
    width: 4,
    rows: 6,
    height: 4.5,
    capacity: 21,
    guests: [3,4,3,4,3,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
];

const animalKingdomRides: any[] = [
  {
    name: 'Avatar Flight of Passage',
    description: 'A multiple interval batch loader ride at Disney’s Animal Kingdom.',
    rideType: 'Multiple Interval Batch Loader',
    width: 8,
    rows: 2,
    height: 4.5,
    capacity: 16,
    guests: [8,8],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Dinosaur',
    description: 'A multiple batch interval loader ride at Disney’s Animal Kingdom.',
    rideType: 'Multiple Interval Batch Loader',
    width: 4,
    rows: 3,
    height: 4.5,
    capacity: 12,
    guests: [4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Expedition Everest',
    description: 'A interval batch loader ride at Disney’s Animal Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 2,
    rows: 17,
    height: 4.5,
    capacity: 34,
    guests: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    evenOddLines: false,
    singleRiders: true,
    doubleGrouping: true
  },
  {
    name: 'Indiana Jones',
    description: 'A multiple batch interval loader ride at Disney’s Animal Kingdom.',
    rideType: 'Multiple Interval Batch Loader',
    width: 4,
    rows: 3,
    height: 4.5,
    capacity: 12,
    guests: [4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'Kali River Rapids',
    description: 'A continuous mover ride at Disney’s Animal Kingdom.',
    rideType: 'Continuous Mover',
    width: 12,
    rows: 1,
    height: 4.5,
    capacity: 12,
    guests: [12],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: false
  },
  {
    name: 'Kilimanjaro Safaris',
    description: 'A interval batch loader ride at Disney’s Animal Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 5,
    rows: 9,
    height: 4.5,
    capacity: 45,
    guests: [5,5,5,5,5,5,5,5,5],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
  },
  {
    name: 'EPCOT',
    description: 'A interval batch loader ride at Disney’s Animal Kingdom.',
    rideType: 'Interval Batch Loader',
    width: 4,
    rows: 3,
    height: 4.5,
    capacity: 12,
    guests: [4,4,4],
    evenOddLines: false,
    singleRiders: false,
    doubleGrouping: true
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
