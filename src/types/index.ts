export interface Player {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  name: string;
  date: Date;
  chipToCashRatio?: number; // e.g. 0.01 means 1 chip = 0.01 ILS
  status: 'active' | 'completed';
}

export interface BuyIn {
  id: string;
  playerId: string;
  amount: number; // ILS
  timestamp: Date;
}

export interface Result {
  id: string;
  playerId: string;
  finalChips?: number;
  finalCash: number; // always ILS
}

export interface PlayerNet {
  playerId: string;
  playerName: string;
  totalBuyIn: number;
  finalCash: number;
  net: number; // finalCash - totalBuyIn
}

export interface Transfer {
  from: string; // player name
  to: string;   // player name
  amount: number; // ILS
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  totalSessions: number;
  totalInvested: number;
  totalCashedOut: number;
  totalNet: number;
  biggestWin: number;
  biggestLoss: number;
}
