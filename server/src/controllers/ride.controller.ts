import { Request, Response } from 'express';
import { Ride } from '../models';

export const rideController = {
 // Get all rides (filtered by location if provided)
 getAllRides: async (req: Request, res: Response) => {
 try {
 const { location } = req.query;
 const filter: any = { active: true };
 if (location) filter.location = location;

 const rides = await Ride.find(filter)
 .populate('location', 'name slug')
 .sort({ name: 1 });

 res.json(rides);
 } catch (error) {
 res.status(500).json({ error: 'Failed to fetch rides' });
 }
 },

 // Get ride by slug
 getRideBySlug: async (req: Request, res: Response) => {
 try {
 const { slug } = req.params;
 const ride = await Ride.findOne({ nameSlug: slug, active: true })
 .populate('location');

 if (!ride) {
 return res.status(404).json({ error: 'Ride not found' });
 }

 res.json(ride);
 } catch (error) {
 res.status(500).json({ error: 'Failed to fetch ride' });
 }
 },

 // Create ride (admin only)
 createRide: async (req: Request, res: Response) => {
 try {
 const ride = new Ride(req.body);
 await ride.save();
 res.status(201).json(ride);
 } catch (error: any) {
 res.status(400).json({ error: error.message });
 }
 },

 // Update ride (admin only)
 updateRide: async (req: Request, res: Response) => {
 try {
 const { id } = req.params;
 const ride = await Ride.findByIdAndUpdate(
 id,
 { ...req.body, updatedAt: new Date() },
 { new: true }
 );

 if (!ride) {
 return res.status(404).json({ error: 'Ride not found' });
 }

 res.json(ride);
 } catch (error: any) {
 res.status(400).json({ error: error.message });
 }
 },

 // Soft delete (admin only)
 deleteRide: async (req: Request, res: Response) => {
 try {
 const { id } = req.params;
 await Ride.findByIdAndUpdate(id, { active: false });
 res.json({ message: 'Ride deleted successfully' });
 } catch (error) {
 res.status(500).json({ error: 'Failed to delete ride' });
 }
 }
};
