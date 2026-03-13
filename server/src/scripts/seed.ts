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

const magicKingdomRides = [
 { name: 'Astro Orbiter', description: 'Pilot a rocket ship high above Tomorrowland on this spinning intergalactic adventure.', rideType: 'Stop and Go Single Vehicle', width: 4, rows: 1, height: 4.5, capacity: 24, guests: [2,2,2,2,2,2,2,2,2,10,2,12], evenOddLines: false, singleRiders: false },
 { name: 'Barnstormer', description: 'Take flight above Storybook Circus on this junior coaster featuring Goofy.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 16, guests: [2,2,2,2,2,2,2,2], evenOddLines: false, singleRiders: false },
 { name: 'Big Thunder Mountain', description: 'Race through a haunted gold mine on this rip-roaring roller coaster.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 30, guests: [2,2,2,2,2,2,2,2,2,10,2,12,2,2,2], evenOddLines: false, singleRiders: false },
 { name: 'Buzz Lightyears Space Ranger Spin', description: 'Blast your way across the galaxy and defeat Emperor Zurg.', rideType: 'Continuous Mover', width: 8, rows: 2, height: 4, capacity: 2, guests: [2], evenOddLines: false, singleRiders: false },
 { name: 'Dumbo', description: 'Take a magical flight above Fantasyland on everyones favorite flying elephant.', rideType: 'Stop and Go Single Vehicle', width: 4, rows: 1, height: 4.5, capacity: 32, guests: [2,2,2,2,2,2,2,2,2,10,2,12,2,2,2,2], evenOddLines: false, singleRiders: false },
 { name: 'its a small world', description: 'Embark on a delightful boat tour through international scenes.', rideType: 'Interval Batch Loader', width: 4, rows: 4, height: 4.5, capacity: 23, guests: [4,4,4,4,4,3], evenOddLines: false, singleRiders: false },
 { name: 'Jungle Cruise Port', description: 'Cruise down exotic rivers in search of wildlife.', rideType: 'Interval Batch Loader', width: 4, rows: 7, height: 4.5, capacity: 14, guests: [14], evenOddLines: false, singleRiders: false },
 { name: 'Jungle Cruise Starboard', description: 'Cruise down exotic rivers in search of wildlife.', rideType: 'Interval Batch Loader', width: 4, rows: 8, height: 4.5, capacity: 16, guests: [16], evenOddLines: false, singleRiders: false },
 { name: 'Mad Tea Party', description: 'Spin wildly in oversized teacups.', rideType: 'Stop and Go Single Vehicle', width: 4, rows: 1, height: 4.5, capacity: 72, guests: [4,4,4,4,4,4,4,4,4,10,4,4,4,4,4,4,4,4], evenOddLines: false, singleRiders: false },
 { name: 'Magic Carpets of Aladdin', description: 'Soar over the desert on a magic carpet.', rideType: 'Stop and Go Single Vehicle', width: 4, rows: 1, height: 4.5, capacity: 64, guests: [4,4,4,4,4,4,4,4,4,10,4,4,4,4,4,4], evenOddLines: false, singleRiders: false },
 { name: 'Many Adventures of Winnie the Pooh', description: 'Journey through the Hundred Acre Wood.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 18, guests: [2,2,2,2,2,2,2,2,2], evenOddLines: false, singleRiders: false },
 { name: 'Peter Pans Flight', description: 'Soar over London and Never Land with Peter Pan.', rideType: 'Continuous Mover', width: 4, rows: 2, height: 4.5, capacity: 3, guests: [3], evenOddLines: false, singleRiders: false },
 { name: 'Pirates of the Caribbean', description: 'Sail past pirate ships on this iconic adventure.', rideType: 'Interval Batch Loader', width: 4, rows: 4, height: 4.5, capacity: 23, guests: [4,4,4,4,4,3], evenOddLines: false, singleRiders: false },
 { name: 'Prince Charming Regal Carrousel', description: 'Gallop through a fairytale on this magnificent carousel.', rideType: 'Corral Counter', width: 4, rows: 1, height: 4.5, capacity: 90, guests: [90], evenOddLines: false, singleRiders: false },
 { name: 'Seven Dwarfs Mine Train', description: 'Race through the diamond mine on this family coaster.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 20, guests: [2,2,2,2,2,2,2,2,2,2], evenOddLines: true, singleRiders: false },
 { name: 'Space Mountain', description: 'Blast off on this high-speed roller coaster.', rideType: 'Interval Batch Loader', width: 4, rows: 3, height: 4.5, capacity: 12, guests: [6,6], evenOddLines: false, singleRiders: false },
 { name: 'Tianas Bayou Adventure', description: 'Join Princess Tiana on a musical journey.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 24, guests: [2,2,2,2,2,2,2,2,2,10,2,12], evenOddLines: false, singleRiders: false },
 { name: 'Tomorrowland Speedway', description: 'Take the wheel and race along the tracks.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4, capacity: 24, guests: [2,2,2,2,2,2,2,2,2,10,2,12], evenOddLines: false, singleRiders: false },
 { name: 'Tomorrowland PeopleMover', description: 'Relax on this scenic elevated tram tour.', rideType: 'Continuous Mover', width: 4, rows: 4, height: 4, capacity: 20, guests: [4,4,4,4,4], evenOddLines: false, singleRiders: false },
 { name: 'TRON Lightcycle Run', description: 'Race through the Grid on high-speed Lightcycles.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 14, guests: [2,2,2,2,2,2,2], evenOddLines: true, singleRiders: false }
];

const epcotRides = [
 { name: 'Frozen Ever After', description: 'Voyage to Arendelle on a boat tour.', rideType: 'Interval Batch Loader', width: 4, rows: 4, height: 4.5, capacity: 16, guests: [4,4,4,4], evenOddLines: false, singleRiders: false },
 { name: 'Gran Fiesta Tour', description: 'Cruise through Mexico with the Three Caballeros.', rideType: 'Interval Batch Loader', width: 4, rows: 4, height: 4.5, capacity: 19, guests: [4,4,4,4,3], evenOddLines: false, singleRiders: false },
 { name: 'Guardians of the Galaxy Cosmic Rewind', description: 'Join Rocket and Groot on this coaster.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 20, guests: [2,2,2,2,2,2,2,2,2,10], evenOddLines: true, singleRiders: false },
 { name: 'Journey Into Imagination', description: 'Explore your imagination with Figment.', rideType: 'Interval Batch Loader', width: 4, rows: 3, height: 4.5, capacity: 28, guests: [3,4,3,4,3,4,3,4], evenOddLines: false, singleRiders: false },
 { name: 'Living with the Land', description: 'Sail through innovative greenhouses.', rideType: 'Interval Batch Loader', width: 4, rows: 4, height: 4.5, capacity: 40, guests: [4,4,4,4,4,4,4,4,4,10], evenOddLines: false, singleRiders: false },
 { name: 'Mission SPACE', description: 'Blast off for a simulated space adventure.', rideType: 'Multiple Interval Batch Loader', width: 4, rows: 4, height: 4.5, capacity: 40, guests: [4,4,4,4,4,4,4,4,4,10], evenOddLines: false, singleRiders: false },
 { name: 'Remys Ratatouille Adventure', description: 'Shrink to Chef Remy size in 4D.', rideType: 'Multiple Interval Batch Loader', width: 4, rows: 3, height: 4.5, capacity: 12, guests: [3,3,3,3], evenOddLines: false, singleRiders: true },
 { name: 'The Seas with Nemo', description: 'Clown around on a clam-mobile.', rideType: 'Continuous Mover', width: 6, rows: 2, height: 4, capacity: 3, guests: [3], evenOddLines: false, singleRiders: false },
 { name: 'Soarin Wing', description: 'Glide above the world most spectacular sights.', rideType: 'Stop and Go Single Vehicle', width: 4, rows: 9, height: 4.5, capacity: 27, guests: [10,10,7], evenOddLines: false, singleRiders: false },
 { name: 'Soarin Middle', description: 'Glide above the world most spectacular sights.', rideType: 'Stop and Go Single Vehicle', width: 4, rows: 11, height: 4.5, capacity: 33, guests: [11,11,11], evenOddLines: false, singleRiders: false },
 { name: 'Spaceship Earth', description: 'Travel through the history of communication.', rideType: 'Continuous Mover', width: 4, rows: 2, height: 4.5, capacity: 4, guests: [2,2], evenOddLines: false, singleRiders: false },
 { name: 'Test Track', description: 'Design your concept car for a test drive.', rideType: 'Interval Batch Loader', width: 6, rows: 2, height: 4.5, capacity: 24, guests: [3,3,3,3,3,3,3,3], evenOddLines: false, singleRiders: true }
];

const hollywoodRides = [
 { name: 'Alien Swirling Saucers', description: 'Silly aliens spin you through the stars.', rideType: 'Multiple Stop and Go Single Vehicle', width: 4, rows: 1, height: 4, capacity: 66, guests: [3,3,3,3,3,3,3,3,3,10,3,13], evenOddLines: false, singleRiders: false },
 { name: 'Mickey and Minnies Runaway Railway', description: 'Zip away on a zany adventure.', rideType: 'Interval Batch Loader', width: 4, rows: 4, height: 4.5, capacity: 32, guests: [4,4,4,4,4,4,4,4], evenOddLines: false, singleRiders: true },
 { name: 'Millennium Falcon Smugglers Run', description: 'Take control of the fastest hunk of junk.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 6, guests: [2,2,2], evenOddLines: false, singleRiders: false },
 { name: 'Rockin Rollercoaster', description: 'Zoom from zero to 60 mph with Aerosmith.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 24, guests: [2,2,2,2,2,2,2,2,2,10,2,12], evenOddLines: false, singleRiders: true },
 { name: 'Slinky Dog Dash', description: 'Zoom around Andys backyard.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 18, guests: [2,2,2,2,2,2,2,2,2], evenOddLines: true, singleRiders: false },
 { name: 'Star Tours', description: 'Embark on a thrilling 3D adventure.', rideType: 'Stop and Go Single Vehicle', width: 4, rows: 5, height: 4.5, capacity: 40, guests: [8,8,7,8,9], evenOddLines: false, singleRiders: false },
 { name: 'Star Wars Rise of the Resistance', description: 'Join the Resistance against the First Order.', rideType: 'Interval Batch Loader', width: 4, rows: 4, height: 4.5, capacity: 16, guests: [4,4,4,4], evenOddLines: false, singleRiders: true },
 { name: 'Toy Story Mania', description: 'Put on 3D glasses for the shooting arcade.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4, capacity: 16, guests: [2,2,2,2,2,2,2,2], evenOddLines: false, singleRiders: false },
 { name: 'Twilight Zone Tower of Terror', description: 'Drop into another dimension.', rideType: 'Multiple Interval Batch Loader', width: 4, rows: 3, height: 4.5, capacity: 21, guests: [3,4,3,4,3,4], evenOddLines: false, singleRiders: false }
];

const animalKingdomRides = [
 { name: 'Avatar Flight of Passage', description: 'Soar on a Banshee through Pandora.', rideType: 'Multiple Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 16, guests: [8,8], evenOddLines: false, singleRiders: false },
 { name: 'Dinosaur', description: 'Travel back to save a dinosaur.', rideType: 'Multiple Interval Batch Loader', width: 4, rows: 4, height: 4.5, capacity: 12, guests: [4,4,4], evenOddLines: false, singleRiders: false },
 { name: 'Expedition Everest', description: 'Race through the Himalayas.', rideType: 'Interval Batch Loader', width: 4, rows: 2, height: 4.5, capacity: 34, guests: [2,2,2,2,2,2,2,2,2,10,2,10,2,2], evenOddLines: false, singleRiders: true },
 { name: 'Indiana Jones', description: 'Experience Disney-style stunt spectacular.', rideType: 'Multiple Interval Batch Loader', width: 4, rows: 4, height: 4.5, capacity: 12, guests: [4,4,4], evenOddLines: false, singleRiders: false },
 { name: 'Kali River Rapids', description: 'Brave Class IV rapids on the river.', rideType: 'Continuous Mover', width: 6, rows: 3, height: 4.5, capacity: 12, guests: [12], evenOddLines: false, singleRiders: false },
 { name: 'Kilimanjaro Safaris', description: 'Spot exotic animals on this safari.', rideType: 'Interval Batch Loader', width: 4, rows: 5, height: 4.5, capacity: 45, guests: [5,5,5,5,5,5,5,5,5], evenOddLines: false, singleRiders: false },
 { name: 'Navi River Journey', description: 'Float through bioluminescent forests.', rideType: 'Interval Batch Loader', width: 4, rows: 4, height: 4.5, capacity: 17, guests: [4,4,4,5], evenOddLines: false, singleRiders: false }
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
 active: true,
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
 active: true, 
 nameSlug: slugify(ride.name),
 photoUrl: ''
 });
 createdCount++;
 }
 for (const ride of epcotRides) {
 await Ride.create({ 
 ...ride, 
 location: epcot, 
 active: true, 
 nameSlug: slugify(ride.name),
 photoUrl: ''
 });
 createdCount++;
 }
 for (const ride of hollywoodRides) {
 await Ride.create({ 
 ...ride, 
 location: hollywood, 
 active: true, 
 nameSlug: slugify(ride.name),
 photoUrl: ''
 });
 createdCount++;
 }
 for (const ride of animalKingdomRides) {
 await Ride.create({ 
 ...ride, 
 location: animal, 
 active: true, 
 nameSlug: slugify(ride.name),
 photoUrl: ''
 });
 createdCount++;
 }

 console.log(`✅ Created ${createdCount} rides total!`);
 console.log(` - ${magicKingdomRides.length} Magic Kingdom rides`);
 console.log(` - ${epcotRides.length} EPCOT rides`);
 console.log(` - ${hollywoodRides.length} Hollywood Studios rides`);
 console.log(` - ${animalKingdomRides.length} Animal Kingdom rides`);

 // Try to create admin user without bcrypt
 try {
 const bcrypt = await import('bcrypt');
 const hash = await bcrypt.hash('Munch13s&Crunch13s', 10);
 await AdminUser.create({ username: 'hornedking', passwordHash: hash, email: 'ace@digitalelegance.com' });
 console.log('✅ Admin user created');
 } catch (bcryptError) {
 console.log('⚠️  Skipping admin user creation (bcrypt module issue)');
 }

 console.log('✅ Database seeded successfully!');
 process.exit(0);
 } catch (error) {
 console.error('❌ Seed failed:', error);
 process.exit(1);
 }
};

seedDatabase();
