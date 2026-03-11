import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import connectDB from './config/database';
import rideRoutes from './routes/ride.route';
import locationRoutes from './routes/location.route';
import authRoutes from './routes/auth.route';
import gameRoutes from './routes/game.route';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/rides', rideRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

app.get('/api/health', (req, res) => {
 res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const startServer = async () => {
 await connectDB();
 app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
 });
};

startServer();
