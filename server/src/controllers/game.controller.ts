import { Request, Response } from 'express';
import { Ride } from '../models';

// Guest generation probability
const groupProbabilities: Record<number, number> = {
 1: 0.06, 2: 0.34, 3: 0.12, 4: 0.18, 5: 0.08, 6: 0.075,
 7: 0.035, 8: 0.03, 9: 0.015, 10: 0.01, 11: 0.0075, 12: 0.005,
 13: 0.0025, 14: 0.0025, 15: 0.00533
};

function generateGroupSize(maxSize: number): number {
 const filtered = Object.entries(groupProbabilities)
 .filter(([size]) => parseInt(size) <= maxSize);

 let cumSum = 0;
 const cumulative = filtered.map(([size, prob]) => {
 cumSum += parseFloat(prob);
 return { size: parseInt(size), cumSum };
 });

 const random = Math.random() * cumSum;
 for (const { size, cumSum } of cumulative) {
 if (random <= cumSum) return size;
 }
 return 2;
}

export const gameController = {
 // Get game config for a ride
 getGameConfig: async (req: Request, res: Response) => {
 try {
 const { rideId } = req.params;
 const ride = await Ride.findOne({ nameSlug: rideId }).populate('location');

 if (!ride) {
 return res.status(404).json({ error: 'Ride not found' });
 }

 res.json({
 ride: {
 id: ride._id,
 name: ride.name,
 slug: ride.nameSlug,
 rideType: ride.rideType,
 guests: ride.guests,
 singleRiders: ride.singleRiders,
 doubleGroupable: ride.doubleGroupable,
 evenOddLines: ride.evenOddLines
 }
 });
 } catch (error) {
 res.status(500).json({ error: 'Failed to get game config' });
 }
 },

 // Generate guest queue
 generateGuests: async (req: Request, res: Response) => {
 try {
 const { count, maxGroupSize } = req.body;

 const groups = Array.from({ length: count || 30 }, () => generateGroupSize(maxGroupSize || 20));

 // Create guest objects with IDs
 const guests = groups.map((size, index) => ({
 id: `group-${index}`,
 size,
 isActive: false
 }));

 res.json({ groups: guests, totalGuests: groups.reduce((a, b) => a + b, 0) });
 } catch (error) {
 res.status(500).json({ error: 'Failed to generate guests' });
 }
 }
};
