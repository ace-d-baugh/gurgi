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
      console.log('Game config request for rideId:', rideId);
      
      const ride = await Ride.findOne({ nameSlug: rideId }).populate('location');
      console.log('Found ride:', ride ? ride.name : 'NOT FOUND');

      if (!ride) {
        console.log('Ride not found, returning 404');
        return res.status(404).json({ error: 'Ride not found' });
      }

      const response = {
        id: ride._id,
        name: ride.name,
        slug: ride.nameSlug,
        rideType: ride.rideType,
        guests: ride.guests,
        singleRiders: ride.singleRiders,
        doubleGroupable: ride.doubleGroupable,
        evenOddLines: ride.evenOddLines
      };
      console.log('Sending response:', JSON.stringify(response, null, 2));
      res.json(response);
    } catch (err) {
      console.error('Error in getGameConfig:', err);
      res.status(500).json({ error: 'Failed to get game config', details: (err as Error).message });
    }
  },

  // Generate guest groups for a game
  generateGuests: async (req: Request, res: Response) => {
    try {
      const { count, maxGroupSize } = req.body;
      console.log('Generating guests:', { count, maxGroupSize });
      
      const groups = Array.from({ length: count }, (_, i) => ({
        id: `group-${i}`,
        size: generateGroupSize(maxGroupSize || 8)
      }));
      
      console.log('Generated groups:', groups.length);
      res.json({ groups });
    } catch (err) {
      console.error('Error generating guests:', err);
      res.status(500).json({ error: 'Failed to generate guests' });
    }
  }
};

export default gameController;
