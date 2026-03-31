import mongoose, { Schema, Document } from 'mongoose';

export interface IGameHistory extends Document {
  username: string;
  gameType: 'crash' | 'horse' | 'football' | 'taixiu';
  betAmount: number;
  result: 'win' | 'lose';
  winAmount: number;
  multiplier?: number;
  createdAt: Date;
}

const gameHistorySchema = new Schema<IGameHistory>(
  {
    username: {
      type: String,
      required: true,
      index: true
    },
    gameType: {
      type: String,
      enum: ['crash', 'horse', 'football', 'taixiu'],
      required: true,
      index: true
    },
    betAmount: {
      type: Number,
      required: true,
      min: 1
    },
    result: {
      type: String,
      enum: ['win', 'lose'],
      required: true
    },
    winAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    multiplier: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

// Indexes
gameHistorySchema.index({ username: 1, createdAt: -1 });
gameHistorySchema.index({ gameType: 1, createdAt: -1 });
gameHistorySchema.index({ createdAt: -1 });

export const GameHistory = mongoose.model<IGameHistory>('GameHistory', gameHistorySchema);
