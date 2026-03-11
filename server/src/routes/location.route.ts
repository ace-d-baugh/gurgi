import express from 'express';
import { locationController } from '../controllers/location.controller';

const router = express.Router();

router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocation);
router.post('/', locationController.createLocation);
router.put('/:id', locationController.updateLocation);
router.delete('/:id', locationController.deleteLocation);

export default router;
