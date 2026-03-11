import express from 'express';
import { rideController } from '../controllers/ride.controller';

const router = express.Router();

router.get('/', rideController.getAllRides);
router.get('/:slug', rideController.getRideBySlug);
router.post('/', rideController.createRide);
router.put('/:id', rideController.updateRide);
router.delete('/:id', rideController.deleteRide);

export default router;
