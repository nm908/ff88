import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  points: number;
  totalWins: number;
  totalLosses: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    points: {
      type: Number,
      default: 1000,
      min: 0
    },
    totalWins: {
      type: Number,
      default: 0,
      min: 0
    },
    totalLosses: {
      type: Number,
      default: 0,
      min: 0
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 999
    }
  },
  {
    timestamps: true
  }
);

// Indexes
userSchema.index({ points: -1 });
userSchema.index({ totalWins: -1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);
