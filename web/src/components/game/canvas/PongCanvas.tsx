import React, { useRef, useEffect, useState } from 'react';
import { type GameState, GameStatus } from '../models/GameState';

interface PongCanvasProps {
  gameState: GameState;
  player1Name?: string;
  player2Name?: string;
}

const PongCanvas: React.FC<PongCanvasProps> = ({
  gameState,
  player1Name = 'Player 1',
  player2Name = 'Player 2',
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
    ball: null,
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
          loadImage(ballImg, '/images/ball.png'),
        ]);

        // Update state with loaded images
        setImages({
          leftPaddle: leftPaddleImg,
          rightPaddle: rightPaddleImg,
          ball: ballImg,
        });
        setImagesLoaded(true);
      } catch (error) {
        console.error('Failed to load game images:', error);
        // keep imagesLoaded as false to use shape drawing
      }
    };
    loadImages();
  }, []);

  //calcuulates scaled dimensions for paddle images
  const scaledDimensions = (
    image: HTMLImageElement,
    targetHeight: number,
  ): { width: number; height: number } => {
    const ratio = image.naturalWidth / image.naturalHeight;
    const scaledWidth = targetHeight * ratio;
    return {
      width: scaledWidth,
      height: targetHeight,
    };
  };

  const drawGame = (context: CanvasRenderingContext2D, state: GameState) => {
    const { leftPaddle, rightPaddle, ball, leftScore, rightScore, canvasWidth, canvasHeight } =
      state;

    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // context.fillStyle = '#8366FF'; // text color
    context.fillStyle = '#FFFFFF';
    context.strokeStyle = '#FFF'; // center line

    // center line
    context.beginPath();
    context.setLineDash([10, 15]);
    context.moveTo(canvasWidth / 2, 0);
    context.lineTo(canvasWidth / 2, canvasHeight);
    context.lineWidth = 2;
    context.stroke();
    context.setLineDash([]);

    //player names
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText(player1Name, canvasWidth / 4, 45);
    context.fillText(player2Name, (canvasWidth / 4) * 3, 45);

    // score
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText(leftScore.toString(), canvasWidth / 4, 95);
    context.fillText(rightScore.toString(), (canvasWidth / 4) * 3, 95);

    // draw paddles and ball
    if (imagesLoaded && images.leftPaddle && images.rightPaddle && images.ball) {
      //calculate dimensions for left paddle
      const leftPaddleScaled = scaledDimensions(images.leftPaddle, leftPaddle.height);
      const leftPaddleX = leftPaddle.position.x - (leftPaddleScaled.width - leftPaddle.width) / 2;
      const leftPaddleY = leftPaddle.position.y - (leftPaddleScaled.height - leftPaddle.height) / 2;

      //dimensions for right paddle
      const rightPaddleScaled = scaledDimensions(images.rightPaddle, rightPaddle.height);
      const rightPaddleX =
        rightPaddle.position.x - (rightPaddleScaled.width - rightPaddle.width) / 2;
      const rightPaddleY =
        rightPaddle.position.y - (rightPaddleScaled.height - rightPaddle.height) / 2;

      // draw left paddle
      context.drawImage(
        images.leftPaddle,
        leftPaddleX,
        leftPaddleY,
        leftPaddleScaled.width,
        leftPaddleScaled.height,
      );

      // draw right paddle
      context.drawImage(
        images.rightPaddle,
        rightPaddleX,
        rightPaddleY,
        rightPaddleScaled.width,
        rightPaddleScaled.height,
      );

      // draw ball
      const ballSize = ball.radius * 2;
      context.drawImage(
        images.ball,
        ball.position.x - ballSize / 2,
        ball.position.y - ballSize / 2,
        ballSize,
        ballSize,
      );
    } else {
      // Fallback to shape drawing if images aren't loaded
      context.fillStyle = '#8366FF';

      context.fillRect(
        leftPaddle.position.x,
        leftPaddle.position.y,
        leftPaddle.width,
        leftPaddle.height,
      );

      context.fillRect(
        rightPaddle.position.x,
        rightPaddle.position.y,
        rightPaddle.width,
        rightPaddle.height,
      );

      context.beginPath();
      context.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
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
      className="box bg-[#6e5d41]/5"
    />
  );
};

export default PongCanvas;
