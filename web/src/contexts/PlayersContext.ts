import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Player } from '../types/types';

export type PlayersMap = Record<number, Player>;

interface PlayersContextType {
  players: PlayersMap;
  setPlayer: (playerNumber: number, data: Player) => void;
  resetPlayer: (playerNumber: number) => void;
  resetAll: () => void;
}

export const PlayersContext = createContext<PlayersContextType | undefined>(undefined);
