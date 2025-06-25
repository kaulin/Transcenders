import { useState } from 'react';
import GameContainer from '../components/game/GameContainer';
import { ApiClient } from '@transcenders/api-client';
import { type CreateScoreRequest } from '@transcenders/contracts';
import { type GameResult } from '../components/game/models/GameState';

function MatchPage() {
	const [gameKey, setGameKey] = useState(0);


	const handleGameComplete = async (result: GameResult, winnerName?: string) => {
		try {
			const scoreData: CreateScoreRequest = {
				winner_id: result.winner_id,
				loser_id: result.loser_id,
				winner_score: result.winner_score,
				loser_score: result.loser_score,
				tournament_level: result.tournament_level,
				game_duration: result.game_duration,
				game_start: result.game_start.toString(),
				game_end: result.game_end.toString(),
			};

			// Send directly to backend
			const response = await ApiClient.score.createScore(scoreData);
	
			if (!response.success) {
				throw new Error(response.error || 'Failed to save game result');
			}

			console.log('SUCCESS: sent score data to backend');

		} catch (error) {
			console.error('Failed to send score data:', error);
		}
	};

	const handleNewGame = () => {
		setGameKey(prev => prev + 1);
	};

	return (
		<div className="h-full pt-8">
			<div className="container mx-auto px-4">
				<div className="flex justify-center">
				<GameContainer 
					key ={gameKey}
					width={1000} 
					height={800} 
					gameMode="match"
					onGameComplete={handleGameComplete}
					onNewGame={handleNewGame}
				/>
				</div>
	  		</div>
		</div>
	);
}

export default MatchPage;