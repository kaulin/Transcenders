import React, { useRef, useEffect, useState, useCallback } from 'react';
import { type GameState } from '../models/GameState';

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

        // Load images
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
      }
    };
    loadImages();
  }, []);

  // Calculate scaled dimensions for paddle images
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

  const drawGame = useCallback(
    (context: CanvasRenderingContext2D, state: GameState) => {
      const { leftPaddle, rightPaddle, ball, canvasWidth, canvasHeight } = state;

      context.clearRect(0, 0, canvasWidth, canvasHeight);

      context.fillStyle = '#FFFFFF';
      context.strokeStyle = '#FFF'; // center line

      // Center line
      context.beginPath();
      context.setLineDash([10, 15]);
      context.moveTo(canvasWidth / 2, 0);
      context.lineTo(canvasWidth / 2, canvasHeight);
      context.lineWidth = 2;
      context.stroke();
      context.setLineDash([]);

      // Draw paddles and ball
      if (imagesLoaded && images.leftPaddle && images.rightPaddle && images.ball) {
        // Calculate dimensions for left paddle
        const leftPaddleScaled = scaledDimensions(images.leftPaddle, leftPaddle.height);
        const leftPaddleX = leftPaddle.position.x - (leftPaddleScaled.width - leftPaddle.width) / 2;
        const leftPaddleY =
          leftPaddle.position.y - (leftPaddleScaled.height - leftPaddle.height) / 2;

        // Dimensions for right paddle
        const rightPaddleScaled = scaledDimensions(images.rightPaddle, rightPaddle.height);
        const rightPaddleX =
          rightPaddle.position.x - (rightPaddleScaled.width - rightPaddle.width) / 2;
        const rightPaddleY =
          rightPaddle.position.y - (rightPaddleScaled.height - rightPaddle.height) / 2;

        // Draw left paddle
        context.drawImage(
          images.leftPaddle,
          leftPaddleX,
          leftPaddleY,
          leftPaddleScaled.width,
          leftPaddleScaled.height,
        );

        // Draw right paddle
        context.drawImage(
          images.rightPaddle,
          rightPaddleX,
          rightPaddleY,
          rightPaddleScaled.width,
          rightPaddleScaled.height,
        );

        // Draw ball
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
        context.fillStyle = '#FFF';

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
    },
    [images.ball, images.leftPaddle, images.rightPaddle, imagesLoaded],
  );

  // React hook to draw the game whenever gameState or image state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Draw the game elements
    drawGame(context, gameState);
  }, [gameState, drawGame]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={gameState.canvasWidth}
        height={gameState.canvasHeight}
        className="w-full h-full max-w-full max-h-full object-contain box"
      />
    </div>
  );
};

export default PongCanvas;
