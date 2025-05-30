import React, { useRef, useEffect, useState } from 'react';
import { type GameState, GameStatus } from '../models/GameState';

interface PongCanvasProps {
  gameState: GameState;
}

const PongCanvas: React.FC<PongCanvasProps> = ({ gameState }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	
	// State to track if images are loaded
	const [imagesLoaded, setImagesLoaded] = useState(false);
	const [images, setImages] = useState<{
		leftPaddle: HTMLImageElement | null;
		rightPaddle: HTMLImageElement | null;
		ball: HTMLImageElement | null;
	}>({
		leftPaddle: null,
		rightPaddle: null,
		ball: null
	});

	// Load images when component mounts
	useEffect(() => {
		const loadImages = async () => {
			try {
				// Create image objects
				const leftPaddleImg = new Image();
				const rightPaddleImg = new Image();
				const ballImg = new Image();

				// Set up promise-based loading
				const loadImage = (img: HTMLImageElement, src: string): Promise<void> => {
					return new Promise((resolve, reject) => {
						img.onload = () => resolve();
						img.onerror = reject;
						img.src = src;
					});
				};

				// Load all images (replace these paths with your actual image paths)
				await Promise.all([
					loadImage(leftPaddleImg, '/images/player1.png'),
					loadImage(rightPaddleImg, '/images/player2.png'),
					loadImage(ballImg, '/images/ball.png')
				]);

				// Update state with loaded images
				setImages({
					leftPaddle: leftPaddleImg,
					rightPaddle: rightPaddleImg,
					ball: ballImg
				});
				setImagesLoaded(true);
			} catch (error) {
				console.error('Failed to load game images:', error);
				// Fallback: keep imagesLoaded as false to use shape drawing
			}
		};
		loadImages();
	}, []);

	const drawGame = (context: CanvasRenderingContext2D, state: GameState) => {
		const { leftPaddle, rightPaddle, ball, leftScore, rightScore, canvasWidth, canvasHeight } = state;
	
		context.clearRect(0, 0, canvasWidth, canvasHeight);
	
		// context.fillStyle = '#8366FF'; // text color
		context.fillStyle = '#FFFFFF';
		context.strokeStyle = '#FFB6C1'; // center line
	
		// center line
		context.beginPath();
		context.setLineDash([10, 15]);
		context.moveTo(canvasWidth / 2, 0);
		context.lineTo(canvasWidth / 2, canvasHeight);
		context.lineWidth = 2;
		context.stroke();
		context.setLineDash([]);
	
		// score
		context.font = '48px Arial';
		context.textAlign = 'center';
		context.fillText(leftScore.toString(), canvasWidth / 4, 60);
		context.fillText(rightScore.toString(), (canvasWidth / 4) * 3, 60);
	
		// draw paddles and ball
		if (imagesLoaded && images.leftPaddle && images.rightPaddle && images.ball) {
			// need to make paddles bigger to see the images better
			const paddleScale = 1.5;
			const paddleWidth = leftPaddle.width * paddleScale;
			const paddleHeight = leftPaddle.height * paddleScale;
			
			// Center the larger image on the original paddle position
			const leftPaddleX = leftPaddle.position.x - (paddleWidth - leftPaddle.width) / 2;
			const leftPaddleY = leftPaddle.position.y - (paddleHeight - leftPaddle.height) / 2;
			const rightPaddleX = rightPaddle.position.x - (paddleWidth - rightPaddle.width) / 2;
			const rightPaddleY = rightPaddle.position.y - (paddleHeight - rightPaddle.height) / 2;
			
			// draw left paddle
			context.drawImage(
				images.leftPaddle,
				leftPaddleX,
				leftPaddleY,
				paddleWidth,
				paddleHeight
			);
	
			// draw right paddle
			context.drawImage(
				images.rightPaddle,
				rightPaddleX,
				rightPaddleY,
				paddleWidth,
				paddleHeight
			);
	
			// Make ball bigger too
			const ballScale = 2;
			const ballSize = ball.radius * 2 * ballScale;
			context.drawImage(
				images.ball,
				ball.position.x - (ballSize / 2),
				ball.position.y - (ballSize / 2),
				ballSize,
				ballSize
			);
		} else {
			// Fallback to shape drawing if images aren't loaded
			context.fillStyle = '#8366FF';
			
			context.fillRect(
				leftPaddle.position.x,
				leftPaddle.position.y,
				leftPaddle.width,
				leftPaddle.height
			);
	
			context.fillRect(
				rightPaddle.position.x,
				rightPaddle.position.y,
				rightPaddle.width,
				rightPaddle.height
			);
	
			context.beginPath();
			context.arc(
				ball.position.x,
				ball.position.y,
				ball.radius,
				0,
				Math.PI * 2
			);
			context.fill();
		}
	
		// Game status messages
		if (state.status === GameStatus.WAITING) {
			context.fillStyle = '#FFFFFF';
			context.font = '24px Arial';
			context.fillText('Press Space to Start', canvasWidth / 2, canvasHeight / 2 + 60);

			context.font = '18px Arial';
			context.fillText('Player 1: W (up) and S (down)', canvasWidth / 4, canvasHeight - 50);
			context.fillText('Player 2: ↑ and ↓ keys', (canvasWidth / 4) * 3, canvasHeight - 50);
		}
	
		if (state.status === GameStatus.PAUSED) {
			context.font = '36px Arial';
			context.fillStyle = '#FFFFFF';
			context.fillText('PaW-SED', canvasWidth / 2, canvasHeight / 2);
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
	
		// Canvas background
		context.fillStyle = '#B366FF';
		context.fillRect(0, 0, canvas.width, canvas.height);
	
		// Draw the game elements
		drawGame(context, gameState);
	}, [gameState, imagesLoaded, images]); // Added dependencies for image state

	return (
		<canvas
			ref={canvasRef}
			width={gameState.canvasWidth}
			height={gameState.canvasHeight}
			className="profile-box"
		/>
	);
};

export default PongCanvas;