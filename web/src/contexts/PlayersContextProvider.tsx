import { useCallback, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { PlayersContext } from './PlayersContext';
import type { PlayersMap } from './PlayersContext';
import type { Player } from '../types/types';

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<PlayersMap>({});

  const setPlayer = useCallback((num: number, data: Player) => {
    setPlayers((prev) => ({
      ...prev,
      [num]: {
        ...prev[num],
        ...data,
      },
    }));
  }, []);

  const resetPlayer = useCallback((num: number) => {
    setPlayers((prev) => {
      const newPlayers = { ...prev };
      delete newPlayers[num];
      return newPlayers;
    });
  }, []);

  const resetAll = useCallback(() => {
    setPlayers({});
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
