
import React, { useState, useEffect, useCallback } from 'react';
import PongCanvas from './canvas/PongCanvas';
import { 
	type GameState, 
	GameStatus, 
	Controls, 
	createInitialGameState, 
	resetBall 
} from './models/GameState';
import { 
	checkWallCollision, 
	handlePaddleCollisions, 
	checkScore 
} from './utils/CollisionDetection';

interface GameContainerProps {
	width?: number;
	height?: number;
}

//react functional component
const GameContainer: React.FC<GameContainerProps> = ({ width = 800, height = 600 }) => {
	// state declarations
	const [gameState, setGameState] = useState<GameState>(
		createInitialGameState(width, height)
	);
	const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});
	
	// reference declarations
	const lastUpdateTimeRef = React.useRef<number>(0);
	const animationFrameRef = React.useRef<number>(0);
	
	// Update game state for each frame
	const updateGame = useCallback((timestamp: number) => {
		lastUpdateTimeRef.current = timestamp;
	
		if (gameState.status === GameStatus.RUNNING) {
			setGameState(prevState => {
				let newState = { ...prevState };
		
				// move the left paddle based on W/S keys
				if (keysPressed[Controls.leftPaddle.up.toLowerCase()]) {
					newState.leftPaddle.position.y = Math.max(
						0,
						newState.leftPaddle.position.y - newState.leftPaddle.speed
					);
				}
				if (keysPressed[Controls.leftPaddle.down.toLowerCase()]) {
					newState.leftPaddle.position.y = Math.min(
						newState.canvasHeight - newState.leftPaddle.height,
						newState.leftPaddle.position.y + newState.leftPaddle.speed
					);
				}
		
				// move right paddle based on arrow keys
				if (keysPressed[Controls.rightPaddle.up.toLowerCase()]) {
					newState.rightPaddle.position.y = Math.max(
						0,
						newState.rightPaddle.position.y - newState.rightPaddle.speed
					);
				}
				if (keysPressed[Controls.rightPaddle.down.toLowerCase()]) {
					newState.rightPaddle.position.y = Math.min(
						newState.canvasHeight - newState.rightPaddle.height,
						newState.rightPaddle.position.y + newState.rightPaddle.speed
					);
				}
		
				// move ball
				newState.ball.position.x += newState.ball.velocity.dx;
				newState.ball.position.y += newState.ball.velocity.dy;
		
				// check collisions
				newState = checkWallCollision(newState);
				newState = handlePaddleCollisions(newState);
		
				//point scored?
				const { newState: stateAfterScoring, scored } = checkScore(newState);
				newState = stateAfterScoring;
				if (scored)
					newState = resetBall(newState);
		
				return newState;
			});
		}
	
		// Continue game loop
		animationFrameRef.current = requestAnimationFrame(updateGame);
	}, [gameState.status, keysPressed]); //dependency array: useCallback only creates a new version of this function when these values change
	
	// Start the game loop when the component mounts
	useEffect(() => {
		animationFrameRef.current = requestAnimationFrame(updateGame);
		return () => {
			cancelAnimationFrame(animationFrameRef.current);
		};
	}, [updateGame]); //dependency array: run this effect when the updateGame changes
	
	// Handle keyboard events
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Prevent the default action to avoid scrolling with arrow keys
			if ([' ', 'ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
				e.preventDefault();
			}

			// Update keys pressed state
			setKeysPressed(prevKeys => ({
				...prevKeys,
				[e.key.toLowerCase()]: true
			}));
		
			// Handle space key for starting/pausing the game
			if (e.key === ' ') {
				setGameState(prevState => {
					if (prevState.status === GameStatus.WAITING) {
						// Start the game
						return resetBall({
							...prevState,
							status: GameStatus.RUNNING
						});
					} else if (prevState.status === GameStatus.RUNNING) {
						// Pause the game
						return {
							...prevState,
							status: GameStatus.PAUSED
						};
					} else if (prevState.status === GameStatus.PAUSED) {
						// Resume the game
						return {
							...prevState,
							status: GameStatus.RUNNING
						};
					}
					return prevState;
				});
			}
		};	
	
		const handleKeyUp = (e: KeyboardEvent) => {
			// Update keys pressed state
			setKeysPressed(prevKeys => ({
			...prevKeys,
			[e.key.toLowerCase()]: false
			}));
		};
	
		// Add event listeners: window is a browser global object
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	
		// Remove event listeners on cleanup
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);
	
	return (
		<div className="flex flex-col items-center justify-center p-4">
			<h1 className="text-3xl font-bold mb-4">Pong Game</h1>
			<div className="relative">
			<PongCanvas gameState={gameState} />
			</div>
			<div className="mt-4 space-y-2">
			<button
				className="px-4 py-2 bg-bg_primary text-white rounded hover:bg-opacity-90"
				onClick={() => {
					setGameState(prevState => {
						if (prevState.status === GameStatus.WAITING || 
							prevState.status === GameStatus.PAUSED) {
							return resetBall({
								...prevState,
								status: GameStatus.RUNNING
							});
						} else if (prevState.status === GameStatus.RUNNING) {
							return {
								...prevState,
								status: GameStatus.PAUSED
							};
						}
					return prevState;
					});
				}}
			>
				{gameState.status === GameStatus.RUNNING ? 'Pause' : 'Start/Resume'}
			</button>
			<button
				className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-opacity-90"
				onClick={() => {
					setGameState(createInitialGameState(width, height));
				}}
			>
				Reset Game
			</button>
			</div>
		</div>
	);
};

export default GameContainer;