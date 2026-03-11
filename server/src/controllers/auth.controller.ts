import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AdminUser } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_EXPIRY = '1h';

function generateToken(userId: string): string {
 return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export const authController = {
 // Login
 login: async (req: Request, res: Response) => {
 try {
 const { username, password } = req.body;

 const user = await AdminUser.findOne({ username });
 if (!user) {
 return res.status(401).json({ error: 'Invalid credentials' });
 }

 const valid = await bcrypt.compare(password, user.passwordHash);
 if (!valid) {
 return res.status(401).json({ error: 'Invalid credentials' });
 }

 const token = generateToken(user._id.toString());
 user.lastLogin = new Date();
 await user.save();

 res.json({ 
 token, 
 user: { username: user.username, email: user.email } 
 });
 } catch (error) {
 res.status(500).json({ error: 'Login failed' });
 }
 },

 // Verify token (for protected routes)
 verify: async (req: Request, res: Response) => {
 try {
 const token = req.headers.authorization?.replace('Bearer ', '');
 if (!token) {
 return res.status(401).json({ error: 'No token provided' });
 }

 const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
 res.json({ valid: true, userId: decoded.userId });
 } catch (error) {
 res.status(401).json({ valid: false, error: 'Invalid token' });
 }
 }
};
