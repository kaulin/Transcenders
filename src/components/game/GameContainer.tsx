import React, { useState, useEffect, useCallback, useRef } from 'react';
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
	const [gameState, setGameState] = useState<GameState>(createInitialGameState(width, height));
	const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});
	
	// Ref for game loop to prevent stale closures
	const gameStateRef = useRef(gameState);
	const animationFrameRef = useRef<number>(0);
	
	// Keep ref in sync with state
	useEffect(() => {
		gameStateRef.current = gameState;
	}, [gameState]);

	const updateGame = useCallback((timestamp: number) => {
		// Read from ref (always current)
		const currentState = gameStateRef.current;
		
		if (currentState.status !== GameStatus.RUNNING) {
			animationFrameRef.current = requestAnimationFrame(updateGame);
			return;
		}

		let newState = { ...currentState };

		// move paddles
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

		// move ball
		newState.ball.position.x += newState.ball.velocity.dx;
		newState.ball.position.y += newState.ball.velocity.dy;

		// check collisions
		newState = checkWallCollision(newState);
		newState = handlePaddleCollisions(newState);

		// check scoring
		const { newState: stateAfterScoring, scored } = checkScore(newState);
		
		if (scored) {
			newState = resetBall(stateAfterScoring);
		} else {
			newState = stateAfterScoring;
		}

		// update state triggers re-render
		setGameState(newState);

		// continue game loop
		animationFrameRef.current = requestAnimationFrame(updateGame);
	}, [keysPressed]);

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
	
		// add event listeners: window is a browser global object
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	
		// remove event listeners on cleanup
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);
	
	return (
		<div className="flex flex-col items-center justify-center p-4">
			<h1 className="text-3xl font-bold mb-4">Paw-Paw Pong</h1>
			<div className="text-xl font-bold mb-2">
				Score: {gameState.leftScore} - {gameState.rightScore}
			</div>
			
			{/* <div className="relative"> */}
				<PongCanvas gameState={gameState} />
			{/* </div> */}
			
			<div className="flex w-full justify-center gap-10">
				<button
					className="play-button"
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
					className="play-button"
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