
import React, { useRef, useEffect } from 'react';	//useRef gives access to DOM elements (the canvas) //useEffect is a react hook
import { type GameState, GameStatus } from '../models/GameState';

interface PongCanvasProps {
  gameState: GameState;
}

//React.FC = React Functional Component that takes prop of type pongcanvasprop
const PongCanvas: React.FC<PongCanvasProps> = ({ gameState }) => {
	// create a reference to directly access the HTML canvas element
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Function to draw the game elements on the canvas
	const drawGame = (context: CanvasRenderingContext2D, state: GameState) => {
		const { leftPaddle, rightPaddle, ball, leftScore, rightScore, canvasWidth, canvasHeight } = state;
	
		context.clearRect(0, 0, canvasWidth, canvasHeight);
	
		context.fillStyle = '#FFB6C1'; // Light pink
		context.strokeStyle = '#DDA0DD'; // Plum
	
		//center line
		context.beginPath();
		context.setLineDash([10, 15]); // Create dashed line
		context.moveTo(canvasWidth / 2, 0);
		context.lineTo(canvasWidth / 2, canvasHeight);
		context.lineWidth = 2;
		context.stroke();
		context.setLineDash([]); // Reset to solid line
	
		//score
		context.font = '48px Arial';
		context.textAlign = 'center';
		context.fillText(leftScore.toString(), canvasWidth / 4, 60);
		context.fillText(rightScore.toString(), (canvasWidth / 4) * 3, 60);
	
		//left paddle
		context.fillRect(
			leftPaddle.position.x,
			leftPaddle.position.y,
			leftPaddle.width,
			leftPaddle.height
		);
	
		//right paddle
		context.fillRect(
			rightPaddle.position.x,
			rightPaddle.position.y,
			rightPaddle.width,
			rightPaddle.height
		);
	
		//ball
		context.beginPath();
		context.arc(
			ball.position.x,
			ball.position.y,
			ball.radius,
			0,
			Math.PI * 2
		);
		context.fill();
	
		if (state.status === GameStatus.WAITING) {
			context.font = '24px Arial';
			context.fillText('Press Space to Start', canvasWidth / 2, canvasHeight / 2 + 60);

			context.font = '18px Arial';
			context.fillText('Player 1: W (up) and S (down)', canvasWidth / 4, canvasHeight - 50);
			context.fillText('Player 2: ↑ and ↓ keys', (canvasWidth / 4) * 3, canvasHeight - 50);
		}
	
		if (state.status === GameStatus.PAUSED) {
			context.font = '36px Arial';
			context.fillStyle = 'rgba(240, 233, 31, 0.97)';
			context.fillText('PAUSED', canvasWidth / 2, canvasHeight / 2);
			context.font = '18px Arial';
			context.fillText('Press Space to Resume', canvasWidth / 2, canvasHeight / 2 + 30);
		}
	};
  
	// React hook to draw the game whenever gameState changes
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
	
		const context = canvas.getContext('2d');
		if (!context) return;
	
		//canvas background
		context.fillStyle = '#8E24AA'; // Medium purple
		context.fillRect(0, 0, canvas.width, canvas.height);
	
		// draw the game elements
		drawGame(context, gameState);
	}, [gameState]);

	return (
		<canvas
		ref={canvasRef}
		width={gameState.canvasWidth}
		height={gameState.canvasHeight}
		className="bg-pink-900 border border-purple-400 rounded shadow-lg"
		/>
	);
};

export default PongCanvas;