import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PongCanvas from './canvas/PongCanvas';
import { usePlayers } from '../../contexts/PlayersContext';
import { type GameResult } from './models/GameState';

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
	gameMode?: 'match' | 'tournament';
	onGameComplete?: (result: GameResult, winnerName?: string) => void;
	isRoundComplete?: boolean;
	onContinueToNextRound?: () => void;
	isFinalRound?: boolean;
	onNewGame?: () => void; 
}

const GameContainer: React.FC<GameContainerProps> = ({ 
	width = 800, 
	height = 600, 
	gameMode = 'match',
	onGameComplete,
	isRoundComplete = false,
	onContinueToNextRound,
	isFinalRound = false,
	onNewGame
}) => {
	const [gameState, setGameState] = useState<GameState>(createInitialGameState(width, height));
	const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});
	const [gameStartTime, setGameStartTime] = useState<number | null>(null);
	const [isProcessingGameEnd, setIsProcessingGameEnd] = useState(false);
	
	// Contexts
	const { players } = usePlayers();
	
	// Ref for game loop to prevent stale closures
	const gameStateRef = useRef(gameState);
	const animationFrameRef = useRef<number>(0);

	const navigate = useNavigate();

	// Keep ref in sync with state
	useEffect(() => {
		gameStateRef.current = gameState;
	}, [gameState]);

	// Get current players based on game mode
	const getCurrentPlayers = () => {
		// For match: use players[1] and players[2]
		// For tournament: use players[1] and players[2] for current match
		if (players[1] && players[2]) {
			return {
				player1: {
				id: players[1].id ?? 1,	// ?? only uses the fallback if the value is null or undefined
				name: players[1].username || 'Player 1',
				avatar: players[1].avatar || ''
				},
				player2: {
				id: players[2].id ?? 2, 
				name: players[2].username || 'Player 2',
				avatar: players[2].avatar || ''
				}
			};
		}
		return null;
	};

	const currentPlayers = getCurrentPlayers();

	// Handle game end and stats submission
	const handleGameEnd = useCallback(async (finalGameState: GameState) => {
		if (isProcessingGameEnd || !gameStartTime || !currentPlayers) return;
		
		setIsProcessingGameEnd(true);

		const leftPlayerWon = finalGameState.leftScore > finalGameState.rightScore;
		const actualWinner = leftPlayerWon ? currentPlayers.player1 : currentPlayers.player2;
		
		const gameResult = createGameResult(
			currentPlayers.player1.id,
			currentPlayers.player2.id,
			finalGameState.leftScore,
			finalGameState.rightScore,
			gameStartTime,
			Date.now(),
			0 // tournament level handled by parent
		);
	  
		try {
			// Let parent page handle game completion (Match or Tournament)
			onGameComplete?.(gameResult, actualWinner.name);
		} catch (error) {
			console.error('Failed to save game result:', error);
		} finally {
			setIsProcessingGameEnd(false);
		}
	}, [gameStartTime, currentPlayers, gameMode, onGameComplete, isProcessingGameEnd]);

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
						const startTime = Date.now();
						setGameStartTime(startTime);
						return resetBall({
							...prevState,
							status: GameStatus.RUNNING,
						});
					} else if (prevState.status === GameStatus.ENDED) {
						if (gameMode === 'tournament') {
							return prevState;
						}
						onNewGame?.();
						return prevState;
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
		return {
			player1Name: players[1]?.username || 'Player 1',
			player2Name: players[2]?.username || 'Player 2'
		};
	};

	const { player1Name, player2Name } = getDisplayNames();
	
	return (
		<div className="flex flex-col items-center justify-center p-4">
			<h1 className="text-3xl font-bold mb-4">
				{gameMode === 'tournament' ? 'Paw-Paw Pong Tournament' : 'Paw-Paw Pong'}
			</h1>
		
			<PongCanvas 
				gameState={gameState} 
				player1Name={player1Name}
				player2Name={player2Name}
				player1Id={players[1]?.id}
    			player2Id={players[2]?.id}
    			player1Avatar={players[1]?.avatar}
    			player2Avatar={players[2]?.avatar}
			/>
	  
			<div className="flex w-full justify-center gap-10">
				{gameState.status === GameStatus.ENDED ? (
					<div className="flex flex-col items-center gap-4">
						{isProcessingGameEnd && (
						  <div className="text-lg text-blue-600">Saving game results...</div>
						)}
						{gameMode === 'tournament' && isRoundComplete ? (
							<button
								className="play-button"
								disabled={isProcessingGameEnd}
								onClick={() => {
									if (isFinalRound) {
										navigate('/');
									} else {
										onContinueToNextRound?.();
									}
								}}
							>
								{isFinalRound ? 'Return Home' : 'Continue to Next Round...'}
							</button>
						) : gameMode === 'match' ? (
							<button
								className="play-button"
								disabled={isProcessingGameEnd}
								onClick={() => onNewGame?.()}
								>
									Start New Game
							</button>
						) : null}
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
