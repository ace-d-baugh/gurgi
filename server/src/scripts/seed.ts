import dotenv from 'dotenv';
dotenv.config({ path: require('path').join(__dirname, '..', '..', '.env') });

console.log('Loading .env from:', require('path').join(__dirname, '..', '..', '.env'));
console.log('MONGODB_URI is:', process.env.MONGODB_URI ? 'SET ✓' : 'NOT SET ✗');

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDB from '../config/database';
import { Location, Ride, AdminUser, RideType } from '../models';

const locations = [
 { name: 'Magic Kingdom', slug: 'magic-kingdom' },
 { name: 'EPCOT', slug: 'epcot' },
 { name: 'Hollywood Studios', slug: 'hollywood-studios' },
 { name: 'Animal Kingdom', slug: 'animal-kingdom' }
];

const magicKingdomRides = [
 { name: 'Barnstormer', rideType: 'Interval Batch Loader', guests: [2, 2], evenOddLines: false, singleRiders: false },
 { name: 'Big Thunder Mountain', rideType: 'Interval Batch Loader', guests: [3, 3], evenOddLines: true, singleRiders: true },
 { name: 'Seven Dwarfs Mine Train', rideType: 'Interval Batch Loader', guests: [2, 2], evenOddLines: false, singleRiders: true },
 { name: 'Space Mountain', rideType: 'Interval Batch Loader', guests: [3, 3], evenOddLines: true, singleRiders: true }
];

const epcotRides = [
 { name: 'Test Track', rideType: 'Interval Batch Loader', guests: [3, 3], evenOddLines: false, singleRiders: true },
 { name: 'Frozen Ever After', rideType: 'Interval Batch Loader', guests: [2, 2, 2, 2], evenOddLines: false, singleRiders: false }
];

const hollywoodRides = [
 { name: 'Tower of Terror', rideType: 'Interval Batch Loader', guests: [4, 4, 4, 2], evenOddLines: false, singleRiders: true },
 { name: 'Slinky Dog Dash', rideType: 'Interval Batch Loader', guests: [3, 3], evenOddLines: true, singleRiders: true }
];

const animalKingdomRides = [
 { name: 'Expedition Everest', rideType: 'Interval Batch Loader', guests: [3, 3], evenOddLines: true, singleRiders: true },
 { name: 'Kilimanjaro Safaris', rideType: 'Interval Batch Loader', guests: [9], evenOddLines: false, singleRiders: false }
];

const seedDatabase = async () => {
 try {
 await connectDB();

 await Ride.deleteMany({});
 await Location.deleteMany({});
 await AdminUser.deleteMany({});

 const locationMap = new Map<string, string>();
 for (const loc of locations) {
 const created = await Location.create({ ...loc, active: true });
 locationMap.set(loc.slug, (created as any)._id.toString());
 console.log(`Created: ${loc.name}`);
 }

 const mk = locationMap.get('magic-kingdom');
 const epcot = locationMap.get('epcot');
 const hollywood = locationMap.get('hollywood-studios');
 const animal = locationMap.get('animal-kingdom');

 for (const ride of magicKingdomRides) await Ride.create({ ...ride, location: mk, active: true });
 for (const ride of epcotRides) await Ride.create({ ...ride, location: epcot, active: true });
 for (const ride of hollywoodRides) await Ride.create({ ...ride, location: hollywood, active: true });
 for (const ride of animalKingdomRides) await Ride.create({ ...ride, location: animal, active: true });

 const hash = await bcrypt.hash('Munch13s&Crunch13s', 10);
 await AdminUser.create({ username: 'hornedking', passwordHash: hash, email: 'ace@digitalelegance.com' });

 console.log('\n✅ Database seeded successfully!');
 process.exit(0);
 } catch (error) {
 console.error('❌ Seed failed:', error);
 process.exit(1);
 }
};

seedDatabase();
