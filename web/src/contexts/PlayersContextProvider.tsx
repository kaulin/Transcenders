import { useCallback, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { PlayersContext } from './PlayersContext';
import type { PlayersMap } from './PlayersContext';
import type { Player } from '../types/types';

const emptyPlayer: Player = {
  id: undefined,
  username: '',
  avatar: '',
  mode: null,
  ready: false,
};

const initialPlayers: PlayersMap = {
  1: { ...emptyPlayer }, // match player 1
  2: { ...emptyPlayer }, // match player 2
  3: { ...emptyPlayer }, // tournament player 1
  4: { ...emptyPlayer }, // tournament player 2
  5: { ...emptyPlayer }, // tournament player 3
  6: { ...emptyPlayer }, // tournament player 4
};

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<PlayersMap>({});

  const setPlayer = useCallback((num: number, data: Player) => {
    if (num < 1 || num > 6) {
      console.warn(`Invalid player slot: ${num}. Only slots 1-6 are allowed.`);
      return;
    }
    setPlayers((prev) => ({
      ...prev,
      [num]: {
        ...prev[num],
        ...data,
      },
    }));
  }, []);

  const resetPlayer = useCallback((num: number) => {
    if (num < 1 || num > 6) {
      console.warn(`Invalid player slot: ${num}. Only slots 1-6 are allowed.`);
      return;
    }
    setPlayers((prev) => ({
      ...prev,
      [num]: { ...emptyPlayer },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setPlayers({...initialPlayers});
  }, []);

  const contextValue = useMemo(
    () => ({
      players,
      setPlayer,
      resetPlayer,
      resetAll,
    }),
    [players, setPlayer, resetPlayer, resetAll],
  );

  return <PlayersContext.Provider value={contextValue}>{children}</PlayersContext.Provider>;
}
