import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayers } from '../contexts/PlayersContext';
import GameContainer from '../components/game/GameContainer';
import { ApiClient } from '@transcenders/api-client';
import { type CreateScoreRequest } from '@transcenders/contracts';
import { type GameResult } from '../components/game/models/GameState';

function MatchPage() {
	const { players } = usePlayers();
	const navigate = useNavigate();

	// Redirect if players aren't set up
	useEffect(() => {
		if (!players[1] || !players[2]) {
			navigate('/');
		}
	}, [players, navigate]);

	const handleGameComplete = async (result: GameResult) => {
		try {
			// Convert GameResult to CreateScoreRequest format
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
		} catch (error) {
			console.error('Failed to send match result:', error);
		}
	};

	if (!players[1] || !players[2]) {
		return (
			<div className="flex h-full justify-center items-center">
				<div className="text-2xl">Loading match...</div>
			</div>
		);
	}

	return (
		<div className="h-full pt-8">
			<div className="container mx-auto px-4">
				<div className="flex justify-center">
				<GameContainer 
					width={1000} 
					height={800} 
					gameMode="match"
					onGameComplete={handleGameComplete}
				/>
				</div>
	  		</div>
		</div>
	);
}

export default MatchPage;