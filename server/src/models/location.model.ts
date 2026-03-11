import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
 name: string;
 slug: string;
 active: boolean;
 createdAt: Date;
 updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>({
 name: { type: String, required: true, unique: true },
 slug: { type: String, required: true, unique: true },
 active: { type: Boolean, default: true }
}, { timestamps: true });

LocationSchema.pre('save', function(next) {
 if (this.isModified('name')) {
 this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
 }
 next();
});

export const Location = mongoose.model<ILocation>('Location', LocationSchema);
