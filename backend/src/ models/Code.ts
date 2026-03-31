import mongoose, { Schema, Document } from 'mongoose';

export interface ICode extends Document {
  code: string;
  points: number;
  used: boolean;
  usedBy: string | null;
  usedAt: Date | null;
  createdAt: Date;
  expiresAt?: Date;
}

const codeSchema = new Schema<ICode>(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 5
    },
    points: {
      type: Number,
      required: true,
      min: 1
    },
    used: {
      type: Boolean,
      default: false,
      index: true
    },
    usedBy: {
      type: String,
      default: null
    },
    usedAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  },
  {
    timestamps: true
  }
);

// TTL Index for auto-delete expired codes
codeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Code = mongoose.model<ICode>('Code', codeSchema);
