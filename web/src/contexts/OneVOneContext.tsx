import type { ReactNode } from "react"
import React, { createContext, useContext, useState } from 'react';

export type OneVOne = {
	player1: {
		id: number;
		name: string;
		avatar: string;
	};
	player2: {
		id: number;
		name: string;
		avatar: string;
	};
}

type OneVOneContextType = {
	oneVOneData: OneVOne | null;
	setPlayer1: (player: OneVOne['player1']) => void;
	setPlayer2: (player: OneVOne['player2']) => void;
	clear: () => void;
};

const OneVOneContext = createContext<OneVOneContextType | undefined>(undefined);

export const OneVOneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [oneVOneData, setOneVOneData] = useState<OneVOne | null>(null);

	const setPlayer1 = (player: OneVOne['player1']) => {
		setOneVOneData(prev => ({
		player1: player,
		player2: prev?.player2 || { id: -1, name: 'Guest', avatar: '' }
		}));
	};

	const setPlayer2 = (player: OneVOne['player2']) => {
		setOneVOneData(prev => ({
		player1: prev?.player1 || { id: -1, name: 'Guest', avatar: '' },
		player2: player
		}));
	};
  
	const clear = () => setOneVOneData(null);

	return (
		<OneVOneContext.Provider value={{ oneVOneData, setPlayer1, setPlayer2, clear }}>
			{children}
		</OneVOneContext.Provider>
	);
};

export const useOneVOne = () => {
	const context = useContext(OneVOneContext);	//gets data from nearest Provider
	if (!context) throw new Error('useOneVOne must be used within OneVOneProvider');
	return context;
};
