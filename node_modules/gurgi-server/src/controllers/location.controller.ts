import { Request, Response } from 'express';
import { Location } from '../models';

export const locationController = {
 // Get all locations
 getAllLocations: async (req: Request, res: Response) => {
 try {
 const locations = await Location.find({ isActive: true }).sort({ name: 1 });
 res.json(locations);
 } catch (error) {
 res.status(500).json({ error: 'Failed to fetch locations' });
 }
 },

 // Get location by ID
 getLocation: async (req: Request, res: Response) => {
 try {
 const { id } = req.params;
 const location = await Location.findById(id);

 if (!location) {
 return res.status(404).json({ error: 'Location not found' });
 }

 res.json(location);
 } catch (error) {
 res.status(500).json({ error: 'Failed to fetch location' });
 }
 },

 // Create location (admin only)
 createLocation: async (req: Request, res: Response) => {
 try {
 const location = new Location(req.body);
 await location.save();
 res.status(201).json(location);
 } catch (error: any) {
 res.status(400).json({ error: error.message });
 }
 },

 // Update location (admin only)
 updateLocation: async (req: Request, res: Response) => {
 try {
 const { id } = req.params;
 const location = await Location.findByIdAndUpdate(
 id,
 { ...req.body, updatedAt: new Date() },
 { new: true }
 );

 if (!location) {
 return res.status(404).json({ error: 'Location not found' });
 }

 res.json(location);
 } catch (error: any) {
 res.status(400).json({ error: error.message });
 }
 },

 // Soft delete (admin only)
 deleteLocation: async (req: Request, res: Response) => {
 try {
 const { id } = req.params;
 await Location.findByIdAndUpdate(id, { isActive: false });
 res.json({ message: 'Location deleted successfully' });
 } catch (error) {
 res.status(500).json({ error: 'Failed to delete location' });
 }
 }
};
