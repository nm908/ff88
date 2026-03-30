export interface User {
  _id?: string;
  username: string;
  points: number;
  totalWins: number;
  totalLosses: number;
  level: number;
  createdAt?: Date;
}

export interface AIPlayer {
  id: string;
  name: string;
  avatar: string;
  level: number;
  status: 'idle' | 'playing' | 'waiting';
  totalWins: number;
  points: number;
  personality: 'aggressive' | 'conservative' | 'balanced' | 'lucky';
}

export interface GameResult {
  gameType: 'crash' | 'horse' | 'football' | 'taixiu';
  betAmount: number;
  result: 'win' | 'lose';
  multiplier?: number;
  winAmount?: number;
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  avatar?: string;
  timestamp: Date;
  isAI?: boolean;
}

export interface GameState {
  gameType: 'crash' | 'horse' | 'football' | 'taixiu' | null;
  isPlaying: boolean;
  currentMultiplier: number;
  players: AIPlayer[];
}v
