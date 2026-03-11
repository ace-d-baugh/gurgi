import express from 'express';
import { gameController } from '../controllers/game.controller';

const router = express.Router();

router.get('/config/:rideId', gameController.getGameConfig);
router.post('/generate-guests', gameController.generateGuests);

export default router;
