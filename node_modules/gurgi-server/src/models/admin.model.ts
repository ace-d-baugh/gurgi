import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminUser extends Document {
 username: string;
 passwordHash: string;
 email: string;
 lastLogin: Date | null;
 createdAt: Date;
 updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>({
 username: { type: String, required: true, unique: true },
 passwordHash: { type: String, required: true },
 email: { type: String, required: true },
 lastLogin: { type: Date, default: null }
}, { timestamps: true });

export const AdminUser = mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
