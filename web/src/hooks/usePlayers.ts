import { useContext } from 'react';
import { PlayersContext } from '../contexts/PlayersContext';

export function usePlayers() {
  const context = useContext(PlayersContext);
  if (!context) {
    throw new Error('usePlayers must be used within a PlayersProvider');
  }

  return context;
}
