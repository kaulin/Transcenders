import type { ReactNode } from "react"
import React, { createContext, useContext, useState } from 'react';
import { type GameResult } from '../components/game/models/GameState.ts';

export interface TournamentPlayer {
	id: number;
	name: string;
	avatar: string;
	isGuest: boolean;
}

export interface TournamentBracket {
	round3: {
		gameId: string;
		player1: TournamentPlayer;
		player2: TournamentPlayer;
		winner?: TournamentPlayer;
		gameResult?: GameResult;
	};
	round2: {
		gameId: string;
		player1: TournamentPlayer;
		player2: TournamentPlayer;
		winner?: TournamentPlayer;
		gameResult?: GameResult;
	};
	round1: {
		gameId: string;
		player1?: TournamentPlayer;
		player2?: TournamentPlayer;
		winner?: TournamentPlayer;
		gameResult?: GameResult;
	};
}

export interface Tournament {
	tournamentId: string;
	players: TournamentPlayer[];
	bracket: TournamentBracket;
	currentRound: 'round3' | 'round2' | 'round1' | 'completed';
	currentGame?: 'round3' | 'round2' | 'round1';
	gameResults: GameResult[];
	isActive: boolean;
}

type TournamentContextType = {
	tournament: Tournament | null;
	initializeTournament: (players: TournamentPlayer[]) => void;
	setGameResult: (round: 'round3' | 'round2' | 'round1', result: GameResult) => void;
	getCurrentGamePlayers: () => { player1: TournamentPlayer; player2: TournamentPlayer } | null;
	getNextGame: () => 'round3' | 'round2' | 'round1' | null;
	completeTournament: () => GameResult[];
	clear: () => void;
};

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// shuffles players(Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [tournament, setTournament] = useState<Tournament | null>(null);

	const initializeTournament = (players: TournamentPlayer[]) => {
		if (players.length !== 4) {
			throw new Error('Tournament requires exactly 4 players');
		}
		// Randomize player order
		const shuffledPlayers = shuffleArray(players);
		const tournamentId = `tournament-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

		const bracket: TournamentBracket = {
			round3: {
				gameId: `${tournamentId}-round3`,
				player1: shuffledPlayers[0],
				player2: shuffledPlayers[1]
			},
			round2: {
				gameId: `${tournamentId}-round2`,
				player1: shuffledPlayers[2],
				player2: shuffledPlayers[3]
			},
			round1: {
				gameId: `${tournamentId}-round1`
			}
		};

		const newTournament: Tournament = {
			tournamentId,
			players: shuffledPlayers,
			bracket,
			currentRound: 'round3',
			currentGame: 'round3',
			gameResults: [],
			isActive: true
		};

		setTournament(newTournament);
	};

	const setGameResult = (round: 'round3' | 'round2' | 'round1', result: GameResult) => {
		if (!tournament) return;

		setTournament(prev => {
			if (!prev) return null;

			const updated = { ...prev };
			updated.gameResults.push(result);

			// Determine winner
			const winner = prev.bracket[round].player1?.id === result.winner_id 
				? prev.bracket[round].player1 
				: prev.bracket[round].player2;

			updated.bracket[round].winner = winner;
			updated.bracket[round].gameResult = result;

			// Progress tournament
			if (round === 'round3') {
				updated.bracket.round1.player1 = winner;
				updated.currentRound = 'round2';
				updated.currentGame = 'round2';
			} else if (round === 'round2') {
				updated.bracket.round1.player2 = winner;
				updated.currentRound = 'round1';
				updated.currentGame = 'round1';
			} else if (round === 'round1') {
				updated.currentRound = 'completed';
				updated.currentGame = undefined;
				updated.isActive = false;
			}
			return updated;
		});
	};

	const getCurrentGamePlayers = (): { player1: TournamentPlayer; player2: TournamentPlayer } | null => {
		if (!tournament || !tournament.currentGame) return null;

		const currentGame = tournament.bracket[tournament.currentGame];
		if (!currentGame.player1 || !currentGame.player2) return null;

		return {
			player1: currentGame.player1,
			player2: currentGame.player2
		};
	};

	const getNextGame = (): 'round3' | 'round2' | 'round1' | null => {
		if (!tournament) return null;
		
		if (tournament.currentRound === 'completed') return null;
		
		return tournament.currentGame || null;
	};

	const completeTournament = (): GameResult[] => {
		if (!tournament) return [];
		
		const results = [...tournament.gameResults];
		clear();
		return results;
	};

	const clear = () => setTournament(null);

	return (
		<TournamentContext.Provider value={{ 
			tournament, 
			initializeTournament, 
			setGameResult, 
			getCurrentGamePlayers, 
			getNextGame, 
			completeTournament, 
			clear 
		}}>
			{children}
		</TournamentContext.Provider>
	);
};

export const useTournament = () => {
	const context = useContext(TournamentContext);
	if (!context) throw new Error('useTournament must be used within TournamentProvider');
	return context;
};
