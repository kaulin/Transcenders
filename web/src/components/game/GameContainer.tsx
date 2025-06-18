import React, { useState, useEffect, useCallback, useRef } from 'react';
import PongCanvas from './canvas/PongCanvas';
import { useOneVOne } from '../../contexts/OneVOneContext';
import { useTournament } from '../../contexts/TournamentContext';
// import { Scoring, handleGameStatsError } from '../../services/gameStatsApi';

import { 
	type GameState, 
	GameStatus, 
	Controls, 
	createInitialGameState, 
	resetBall,
	createGameResult
} from './models/GameState';
import { 
	checkWallCollision, 
	handlePaddleCollisions, 
	checkScore 
} from './utils/CollisionDetection';

interface GameContainerProps {
	width?: number;
	height?: number;
	gameMode?: '1v1' | 'tournament';
}

const GameContainer: React.FC<GameContainerProps> = ({ 
	width = 800, 
	height = 600, 
	gameMode = '1v1' 
}) => {
	const [gameState, setGameState] = useState<GameState>(createInitialGameState(width, height));
	const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});
	const [gameStartTime, setGameStartTime] = useState<number | null>(null);
	const [isProcessingGameEnd, setIsProcessingGameEnd] = useState(false);
	
	// Contexts
	const { oneVOneData } = useOneVOne();
	const { tournament, setGameResult, getCurrentGamePlayers, getNextGame, completeTournament } = useTournament();
	
	// Ref for game loop to prevent stale closures
	const gameStateRef = useRef(gameState);
	const animationFrameRef = useRef<number>(0);

	// Keep ref in sync with state
	useEffect(() => {
		gameStateRef.current = gameState;
	}, [gameState]);

	// Get current players based on game mode
	const getCurrentPlayers = () => {
		if (gameMode === 'tournament') {
			return getCurrentGamePlayers();
		} else {
			return oneVOneData ? {
				player1: oneVOneData.player1,
				player2: oneVOneData.player2
			} : null;
		}
	};

	const currentPlayers = getCurrentPlayers();

	// Handle game end and stats submission
	const handleGameEnd = useCallback(async (finalGameState: GameState) => {
		if (isProcessingGameEnd || !gameStartTime || !currentPlayers) return;
		
		setIsProcessingGameEnd(true);
		
		const gameEndTime = Date.now();
		const player1Score = finalGameState.leftScore;
		const player2Score = finalGameState.rightScore;
		
		// Determine tournament level
		let tournamentLevel = 0;
		if (gameMode === 'tournament' && tournament) {
			const nextGame = getNextGame();
			if (nextGame === 'round3') {
				tournamentLevel = 3;
			} else if (nextGame === 'round2') {
				tournamentLevel = 2;
			} else if (nextGame === 'round1') {
				tournamentLevel = 1;
			}
		}

		const gameResult = createGameResult(
			currentPlayers.player1.id,
			currentPlayers.player2.id,
			player1Score,
			player2Score,
			gameStartTime,
			gameEndTime,
			tournamentLevel
		);

		try {
			if (gameMode === '1v1') {
				// Send immediately for 1v1 games
				// await GameStatsAPI.sendGameResult(gameResult);
				// console.log('1v1 game result sent to backend successfully');
			} else if (gameMode === 'tournament') {
				// store locally for tournament games
				const currentGame = getNextGame();
				if (currentGame) {
					setGameResult(currentGame, gameResult);
					console.log(`Tournament ${currentGame} result stored locally`);
					
					// If tournament is completed, send all results
					if (currentGame === 'round1') {
						setTimeout(async () => {
							// const allResults = completeTournament();
							// await GameStatsAPI.sendTournamentResults(allResults);
							console.log('Tournament results sent to backend successfully');
						}, 2000); // Give time for user to see final results
					}
				}
			}
		} catch (error) {
			// handleGameStatsError(error as Error, 'save game statistics');
		} finally {
			setIsProcessingGameEnd(false);
		}
	}, [gameStartTime, currentPlayers, gameMode, tournament, getNextGame, setGameResult, completeTournament, isProcessingGameEnd]);

	const updateGame = useCallback(() => {
		const currentState = gameStateRef.current;
		
		if (currentState.status !== GameStatus.RUNNING) {
			animationFrameRef.current = requestAnimationFrame(updateGame);
			return;
		}

		let newState = { ...currentState };

		// Move paddles
		if (keysPressed[Controls.leftPaddle.up.toLowerCase()]) {
			newState.leftPaddle.position.y = Math.max(0, newState.leftPaddle.position.y - newState.leftPaddle.speed);
		}
		if (keysPressed[Controls.leftPaddle.down.toLowerCase()]) {
			newState.leftPaddle.position.y = Math.min(newState.canvasHeight - newState.leftPaddle.height, newState.leftPaddle.position.y + newState.leftPaddle.speed);
		}
		if (keysPressed[Controls.rightPaddle.up.toLowerCase()]) {
			newState.rightPaddle.position.y = Math.max(0, newState.rightPaddle.position.y - newState.rightPaddle.speed);
		}
		if (keysPressed[Controls.rightPaddle.down.toLowerCase()]) {
			newState.rightPaddle.position.y = Math.min(newState.canvasHeight - newState.rightPaddle.height, newState.rightPaddle.position.y + newState.rightPaddle.speed);
		}

		// Move ball
		newState.ball.position.x += newState.ball.velocity.dx;
		newState.ball.position.y += newState.ball.velocity.dy;

		// Check collisions
		newState = checkWallCollision(newState);
		newState = handlePaddleCollisions(newState);

		// Check scoring
		const { newState: stateAfterScoring, scored } = checkScore(newState);
		
		if (scored) {
			if (stateAfterScoring.rightScore >= 11 || stateAfterScoring.leftScore >= 11) {
				const finalState = {
					...stateAfterScoring,
					status: GameStatus.ENDED,
					gameEndTime: Date.now()
				};
				setGameState(finalState);
				
				// Handle game end asynchronously
				handleGameEnd(finalState);
				return;
			}
			newState = resetBall(stateAfterScoring);
		} else {
			newState = stateAfterScoring;
		}

		setGameState(newState);
		animationFrameRef.current = requestAnimationFrame(updateGame);
	}, [keysPressed, handleGameEnd]);

	// Start the game loop when the component mounts
	useEffect(() => {
		animationFrameRef.current = requestAnimationFrame(updateGame);
		return () => {
			cancelAnimationFrame(animationFrameRef.current);
		};
	}, [updateGame]);
	
	// Handle keyboard events
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ([' ', 'ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
				e.preventDefault();
			}

			setKeysPressed(prevKeys => ({
				...prevKeys,
				[e.key.toLowerCase()]: true
			}));
		
			if (e.key === ' ') {
				setGameState(prevState => {
					if (prevState.status === GameStatus.WAITING) {
						// Start the game and record start time
						const startTime = Date.now();
						setGameStartTime(startTime);
						return resetBall({
							...prevState,
							status: GameStatus.RUNNING,
							gameStartTime: startTime
						});
					} else if (prevState.status === GameStatus.ENDED) {
						// Restart from ended game
						const startTime = Date.now();
						setGameStartTime(startTime);
						return resetBall({
							...createInitialGameState(width, height),
							status: GameStatus.RUNNING,
							gameStartTime: startTime
						});
					} else if (prevState.status === GameStatus.RUNNING) {
						return { ...prevState, status: GameStatus.PAUSED };
					} else if (prevState.status === GameStatus.PAUSED) {
						return { ...prevState, status: GameStatus.RUNNING };
					}
					return prevState;
				});
			}
		};	
	
		const handleKeyUp = (e: KeyboardEvent) => {
			setKeysPressed(prevKeys => ({
				...prevKeys,
				[e.key.toLowerCase()]: false
			}));
		};
	
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, [width, height]);

	// Get display names
	const getDisplayNames = () => {
		if (!currentPlayers) {
			return { player1Name: 'Player 1', player2Name: 'Player 2' };
		}
		
		return {
			player1Name: currentPlayers.player1.name || 'Player 1',
			player2Name: currentPlayers.player2.name || 'Player 2'
		};
	};

	const { player1Name, player2Name } = getDisplayNames();

	// Show loading if no players are set for the current game mode
	if (gameMode === 'tournament' && !getCurrentGamePlayers()) {
		return (
			<div className="flex flex-col items-center justify-center p-4">
				<h2 className="text-2xl font-bold mb-4">Waiting for tournament setup...</h2>
			</div>
		);
	}

	if (gameMode === '1v1' && !oneVOneData) {
		return (
			<div className="flex flex-col items-center justify-center p-4">
				<h2 className="text-2xl font-bold mb-4">Waiting for players...</h2>
			</div>
		);
	}
	
	return (
		<div className="flex flex-col items-center justify-center p-4">
			<h1 className="text-3xl font-bold mb-4">
				{gameMode === 'tournament' ? 'Paw-Paw Pong Tournament' : 'Paw-Paw Pong'}
			</h1>
			
			{gameMode === 'tournament' && tournament && (
				<div className="text-lg font-semibold mb-2">
					{(() => {
  						const game = getNextGame();
  						if (!game) return 'Tournament Complete';
  
  						switch (game) {
    					case 'round3': return 'FIRST MATCH';
    					case 'round2': return 'SECOND MATCH';
    					case 'round1': return 'FINAL MATCH';
    					default: return 'Tournament Complete';
  						}
					})()}
				</div>
			)}
			
			<div className="text-xl font-bold mb-2">
				Score: {gameState.leftScore} - {gameState.rightScore}
			</div>
			
			<PongCanvas 
				gameState={gameState} 
				player1Name={player1Name}
				player2Name={player2Name}
			/>
		
			<div className="flex w-full justify-center gap-10">
				{gameState.status === GameStatus.ENDED ? (
					<div className="flex flex-col items-center gap-4">
						{isProcessingGameEnd && (
							<div className="text-lg text-blue-600">Saving game results...</div>
						)}
						<button
							className="play-button"
							disabled={isProcessingGameEnd}
							onClick={() => {
								const startTime = Date.now();
								setGameStartTime(startTime);
								setGameState(resetBall({
									...createInitialGameState(width, height),
									rightScore: 0,
									leftScore: 0,
									status: GameStatus.RUNNING,
									gameStartTime: startTime
								}));
								animationFrameRef.current = requestAnimationFrame(updateGame);
							}}
						>
							{gameMode === 'tournament' && getNextGame() ? 'Next Game' : 'Start New Game'}
						</button>
					</div>
				) : (
					<>
						<button
							className="play-button"
							onClick={() => {
								setGameState(prevState => {
									if (prevState.status === GameStatus.WAITING) {
										const startTime = Date.now();
										setGameStartTime(startTime);
										return resetBall({
											...prevState,
											status: GameStatus.RUNNING,
											gameStartTime: startTime
										});
									} else if (prevState.status === GameStatus.RUNNING) {
										return { ...prevState, status: GameStatus.PAUSED };
									} else if (prevState.status === GameStatus.PAUSED) {
										return { ...prevState, status: GameStatus.RUNNING };
									}
									return prevState;
								});
							}}
						>
							{gameState.status === GameStatus.RUNNING ? 'Pause' : 'Start/Resume'}
						</button>
						
						<button
							className="play-button"
							onClick={() => {
								setGameState(createInitialGameState(width, height));
								setGameStartTime(null);
							}}
						>
							Reset Game
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default GameContainer;