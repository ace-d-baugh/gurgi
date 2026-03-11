import mongoose, { Schema, Document } from 'mongoose';

export interface IRide extends Document {
 name: string;
 nameSlug: string;
 location: mongoose.Types.ObjectId;
 rideType: string;
 guests: number[][] | number[];
 evenOddLines: boolean;
 singleRiders: boolean;
 rowRequest: boolean;
 doubleGroupable: boolean;
 active: boolean;
 createdAt: Date;
 updatedAt: Date;
}

export enum RideType {
 INTERVAL_BATCH_LOADER = "Interval Batch Loader",
 MULTIPLE_INTERVAL_BATCH_LOADER = "Multiple Interval Batch Loader",
 CONTINUOUS_MOVER = "Continuous Mover",
 STOP_AND_GO_SINGLE_VEHICLE = "Stop and Go Single Vehicle",
 MULTIPLE_STOP_AND_GO_SINGLE_VEHICLE = "Multiple Stop and Go Single Vehicle",
 CORRAL_COUNTER = "Corral Counter",
 CUSTOM = "Custom"
}

const RideSchema = new Schema<IRide>({
 name: { type: String, required: true, unique: true },
 nameSlug: { type: String, required: true, unique: true },
 location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
 rideType: { 
 type: String, 
 enum: Object.values(RideType),
 required: true 
 },
 guests: { type: Schema.Types.Mixed, required: true },
 evenOddLines: { type: Boolean, default: false },
 singleRiders: { type: Boolean, default: false },
 rowRequest: { type: Boolean, default: false },
 doubleGroupable: { type: Boolean, default: false },
 active: { type: Boolean, default: true }
}, { timestamps: true });

RideSchema.pre('save', function(next) {
 if (this.isModified('name')) {
 this.nameSlug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
 }
 next();
});

// Index defined via schema options
// Compound index for queries

export const Ride = mongoose.model<IRide>('Ride', RideSchema);
