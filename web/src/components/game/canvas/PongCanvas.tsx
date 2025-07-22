import React, { useRef, useEffect, useState } from 'react';
import { type GameState, GameStatus } from '../models/GameState';
import { ApiClient } from '@transcenders/api-client';

// interface PongCanvasProps {
// 	gameState: GameState;
// 	player1Name?: string;
// 	player2Name?: string;
// }
interface PongCanvasProps {
	gameState: GameState;
	player1Name?: string;
	player2Name?: string;
	player1Id?: number;
	player2Id?: number;
	player1Avatar?: string;
	player2Avatar?: string;
}

const PongCanvas: React.FC<PongCanvasProps> = ({ 
	gameState, 
	player1Name = 'Player 1', 
	player2Name = 'Player 2',
	player1Id,
	player2Id,
	player1Avatar,
	player2Avatar
	}) => {
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

	// State for avatar images
	const [avatarImages, setAvatarImages] = useState<{
		player1Avatar: HTMLImageElement | null;
		player2Avatar: HTMLImageElement | null;
	}>({
		player1Avatar: null,
		player2Avatar: null
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
				// keep imagesLoaded as false to use shape drawing
			}
		};
		loadImages();
	}, []);

	// Load avatar images when avatar props change
	useEffect(() => {
		const loadAvatarImages = async () => {
			const newAvatarImages = {
				player1Avatar: null as HTMLImageElement | null,
				player2Avatar: null as HTMLImageElement | null
			};

			try {
				// Load player 1 avatar
				if (player1Avatar) {
					const player1AvatarImg = new Image();
					await new Promise<void>((resolve, reject) => {
						player1AvatarImg.onload = () => resolve();
						player1AvatarImg.onerror = () => {
							console.warn('Failed to load player 1 avatar:', player1Avatar);
							resolve(); // Don't reject, just skip this avatar
						};
						// Get the full avatar URL using the API client helper
						player1AvatarImg.src = ApiClient.user.getAvatarUrl(player1Avatar);
					});
					newAvatarImages.player1Avatar = player1AvatarImg;
				}

				// Load player 2 avatar
				if (player2Avatar) {
					const player2AvatarImg = new Image();
					await new Promise<void>((resolve, reject) => {
						player2AvatarImg.onload = () => resolve();
						player2AvatarImg.onerror = () => {
							console.warn('Failed to load player 2 avatar:', player2Avatar);
							resolve(); // Don't reject, just skip this avatar
						};
						// Get the full avatar URL using the API client helper
						player2AvatarImg.src = ApiClient.user.getAvatarUrl(player2Avatar);
					});
					newAvatarImages.player2Avatar = player2AvatarImg;
				}

				setAvatarImages(newAvatarImages);
			} catch (error) {
				console.error('Failed to load avatar images:', error);
			}
		};

		if (player1Avatar || player2Avatar) {
			loadAvatarImages();
		}
	}, [player1Avatar, player2Avatar]);

	//calcuulates scaled dimensions for paddle images
	const scaledDimensions = (
		image: HTMLImageElement,
		targetHeight: number
	): { width:number; height: number } => {
		const ratio = image.naturalWidth / image.naturalHeight;
		const scaledWidth = targetHeight * ratio;
		 return {
			width :scaledWidth,
			height: targetHeight
		};
	};

	//calculate avatar size
	const getAvatarSize = (): number => {
		return 60; // Size for in-game avatars
	};

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
	
		// //player names
		// context.font = '48px Arial';
		// context.textAlign = 'center';
		// context.fillText(player1Name, canvasWidth / 4, 45);
		// context.fillText(player2Name, (canvasWidth / 4) * 3, 45);
		
		// //score
		// context.font = '48px Arial';
		// context.textAlign = 'center';
		// context.fillText(leftScore.toString(), canvasWidth / 4, 95);
		// context.fillText(rightScore.toString(), (canvasWidth / 4) * 3, 95);

		// Player 1 (left side) - Avatar, Name, and Score
		const avatarSize = getAvatarSize();
		const leftSideY = 45;
		
		// Calculate positions for left side (centered as a group)
		const leftGroupWidth = avatarSize + 10 + context.measureText(player1Name).width + 10 + context.measureText(': ' + leftScore.toString()).width;
		const leftStartX = (canvasWidth / 4) - (leftGroupWidth / 2);

		// Draw Player 1 avatar
		if (avatarImages.player1Avatar) {
			const avatarX = leftStartX;
			const avatarY = leftSideY - avatarSize / 2;
			
			// Save context for clipping
			context.save();
			
			// Create circular clipping path
			context.beginPath();
			context.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
			context.clip();
			
			// Draw avatar image
			context.drawImage(
				avatarImages.player1Avatar,
				avatarX,
				avatarY,
				avatarSize,
				avatarSize
			);
			
			// Restore context
			context.restore();
			
			// Draw circular border
			context.beginPath();
			context.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
			context.strokeStyle = '#8366FF';
			context.lineWidth = 2;
			context.stroke();
		}

		// Draw Player 1 name and score
		context.fillStyle = '#FFFFFF';
		context.font = '36px Arial';
		context.textAlign = 'left';
		const player1NameX = leftStartX + avatarSize + 10;
		context.fillText(player1Name, player1NameX, leftSideY + 10);
		
		// Measure name width to position score
		const nameWidth = context.measureText(player1Name).width;
		context.fillText(': ' + leftScore.toString(), player1NameX + nameWidth + 10, leftSideY + 10);

		// Player 2 (right side) - Avatar, Name, and Score
		const rightSideY = 45;
		
		// Calculate positions for right side (centered as a group)
		const rightGroupWidth = avatarSize + 10 + context.measureText(player2Name).width + 10 + context.measureText(': ' + rightScore.toString()).width;
		const rightStartX = ((canvasWidth / 4) * 3) - (rightGroupWidth / 2);

		// Draw Player 2 avatar
		if (avatarImages.player2Avatar) {
			const avatarX = rightStartX;
			const avatarY = rightSideY - avatarSize / 2;
			
			// Save context for clipping
			context.save();
			
			// Create circular clipping path
			context.beginPath();
			context.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
			context.clip();
			
			// Draw avatar image
			context.drawImage(
				avatarImages.player2Avatar,
				avatarX,
				avatarY,
				avatarSize,
				avatarSize
			);
			
			// Restore context
			context.restore();
			
			// Draw circular border
			context.beginPath();
			context.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
			context.strokeStyle = '#8366FF';
			context.lineWidth = 2;
			context.stroke();
		}

		// Draw Player 2 name and score
		context.fillStyle = '#FFFFFF';
		context.font = '36px Arial';
		context.textAlign = 'left';
		const player2NameX = rightStartX + avatarSize + 10;
		context.fillText(player2Name, player2NameX, rightSideY + 10);
		
		// Measure name width to position score
		const name2Width = context.measureText(player2Name).width;
		context.fillText(': ' + rightScore.toString(), player2NameX + name2Width + 10, rightSideY + 10);
	
		// draw paddles and ball
		if (imagesLoaded && images.leftPaddle && images.rightPaddle && images.ball) {
			//calculate dimensions for left paddle
			const leftPaddleScaled = scaledDimensions(images.leftPaddle, leftPaddle.height);
			const leftPaddleX = leftPaddle.position.x - (leftPaddleScaled.width - leftPaddle.width) / 2;
			const leftPaddleY = leftPaddle.position.y - (leftPaddleScaled.height - leftPaddle.height) / 2;

			//dimensions for right paddle
			const rightPaddleScaled = scaledDimensions(images.rightPaddle, rightPaddle.height);
			const rightPaddleX = rightPaddle.position.x - (rightPaddleScaled.width - rightPaddle.width) / 2;
			const rightPaddleY = rightPaddle.position.y - (rightPaddleScaled.height - rightPaddle.height) / 2;
			
			// draw left paddle
			context.drawImage(
				images.leftPaddle,
				leftPaddleX,
				leftPaddleY,
				leftPaddleScaled.width,
				leftPaddleScaled.height
			);
	
			// draw right paddle
			context.drawImage(
				images.rightPaddle,
				rightPaddleX,
				rightPaddleY,
				rightPaddleScaled.width,
				rightPaddleScaled.height
			);
	
			// draw ball
			const ballSize = ball.radius * 2;
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

		if (state.status === GameStatus.ENDED) {
			context.font = '36px Arial';
			context.fillStyle = '#FFFFFF';
			context.textAlign = 'center';
			
			const winner = leftScore >= 11 ? player1Name : player2Name;
			context.fillText(`${winner} Wins!`, canvasWidth / 2, canvasHeight / 2);
			
			context.font = '18px Arial';
			context.fillText('What a Claw-some victory!', canvasWidth / 2, canvasHeight / 2 + 40);
		}
	};
  
	// React hook to draw the game whenever gameState orr image state changes
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
	}, [gameState, imagesLoaded, images]);

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