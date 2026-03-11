import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDB from '../config/database';
import { Location, Ride, AdminUser, RideType } from '../models';

const locations = [
 { name: 'Magic Kingdom', slug: 'magic-kingdom', active: true },
 { name: 'EPCOT', slug: 'epcot', active: true },
 { name: "Hollywood Studios", slug: 'hollywood-studios', active: true },
 { name: "Animal Kingdom", slug: 'animal-kingdom', active: true }
];

const magicKingdomRides = [
 { name: 'Barnstormer', rideType: RideType.INTERVAL_BATCH_LOADER, guests: [2, 2], evenOddLines: false, singleRiders: false },
 { name: 'Big Thunder Mountain', rideType: RideType.INTERVAL_BATCH_LOADER, guests: [3, 3], evenOddLines: true, singleRiders: true },
 { name: "Seven Dwarfs Mine Train", rideType: RideType.INTERVAL_BATCH_LOADER, guests: [2, 2], evenOddLines: false, singleRiders: true },
 { name: "Space Mountain", rideType: RideType.INTERVAL_BATCH_LOADER, guests: [3, 3], evenOddLines: true, singleRiders: true }
];

const epcotRides = [
 { name: "Test Track", rideType: RideType.INTERVAL_BATCH_LOADER, guests: [3, 3], evenOddLines: false, singleRiders: true },
 { name: "Frozen Ever After", rideType: RideType.INTERVAL_BATCH_LOADER, guests: [2, 2, 2, 2], evenOddLines: false, singleRiders: false }
];

const hollywoodRides = [
 { name: "Tower of Terror", rideType: RideType.INTERVAL_BATCH_LOADER, guests: [4, 4, 4, 2], evenOddLines: false, singleRiders: true },
 { name: "Slinky Dog Dash", rideType: RideType.INTERVAL_BATCH_LOADER, guests: [3, 3], evenOddLines: true, singleRiders: true }
];

const animalKingdomRides = [
 { name: "Expedition Everest", rideType: RideType.INTERVAL_BATCH_LOADER, guests: [3, 3], evenOddLines: true, singleRiders: true },
 { name: "Kilimanjaro Safaris", rideType: RideType.INTERVAL_BATCH_LOADER, guests: [9], evenOddLines: false, singleRiders: false }
];

const seedDatabase = async () => {
 try {
 await connectDB();

 await Ride.deleteMany({});
 await Location.deleteMany({});
 await AdminUser.deleteMany({});

 const locationMap: Map<string, string> = new Map();
 for (const loc of locations) {
 const created = await Location.create(loc);
 locationMap.set(loc.slug, created._id.toString());
 console.log(`Created: ${loc.name}`);
 }

 const mk = locationMap.get('magic-kingdom')!;
 const epcot = locationMap.get('epcot')!;
 const hollywood = locationMap.get('hollywood-studios')!;
 const animal = locationMap.get('animal-kingdom')!;

 for (const ride of magicKingdomRides) await Ride.create({ ...ride, location: mk });
 for (const ride of epcotRides) await Ride.create({ ...ride, location: epcot });
 for (const ride of hollywoodRides) await Ride.create({ ...ride, location: hollywood });
 for (const ride of animalKingdomRides) await Ride.create({ ...ride, location: animal });

 const hashedPassword = await bcrypt.hash('Munch13s&Crunch13s', 10);
 await AdminUser.create({
 username: 'hornedking',
 passwordHash: hashedPassword,
 email: 'ace@digitalelegance.com'
 });

 console.log('\nDatabase seeded!');
 process.exit(0);
 } catch (error) {
 console.error('Seed failed:', error);
 process.exit(1);
 }
};

seedDatabase();
