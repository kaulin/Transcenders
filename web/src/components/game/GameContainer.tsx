import React, { useState, useEffect, useCallback, useRef } from 'react';
import PongCanvas from './canvas/PongCanvas';
import { usePlayers } from '../../hooks/usePlayers';
import { type GameResult } from './models/GameState';

import {
  type GameState,
  GameStatus,
  Controls,
  createInitialGameState,
  resetBall,
  createGameResult,
} from './models/GameState';
import { checkWallCollision, handlePaddleCollisions, checkScore } from './utils/CollisionDetection';

interface GameContainerProps {
  width?: number;
  height?: number;
  onGameComplete?: (result: GameResult, winnername?: string) => void;
  onStatusChange?: (status: GameStatus) => void;
  onScoreChange?: (leftScore: number, rightScore: number) => void;
  // External control props
  shouldStart?: boolean;
  shouldPause?: boolean;
  onStartHandled?: () => void;
  onPauseHandled?: () => void;
  player1?: any;
  player2?: any;
}

const GameContainer: React.FC<GameContainerProps> = ({
  width = 800,
  height = 600,
  onGameComplete,
  onStatusChange,
  onScoreChange,
  shouldStart = false,
  shouldPause = false,
  onStartHandled,
  onPauseHandled,
  player1,
  player2,
}) => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState(width, height));
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [isProcessingGameEnd, setIsProcessingGameEnd] = useState(false);

  // Contexts
  const { players } = usePlayers();

  // Ref for game loop to prevent stale closures
  const lastFrameTimeRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);
  const animationFrameRef = useRef<number>(0);
  const keysPressedRef = useRef<Record<string, boolean>>({});

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Get current players
  const getCurrentPlayers = () => {
    // use players passed by tournament
    if (player1 && player2) {
      return {
        player1: {
          id: player1.id ?? 1,
          name: player1.username ?? 'Player 1',
          avatar: player1.avatar ?? '',
        },
        player2: {
          id: player2.id ?? 2,
          name: player2.username ?? 'Player 2',
          avatar: player2.avatar ?? '',
        },
      };
    }
    // or fall back to context (for match games)
    if (players[1] && players[2]) {
      return {
        player1: {
          id: players[1].id ?? 1,
          name: players[1].username ?? 'Player 1',
          avatar: players[1].avatar ?? '',
        },
        player2: {
          id: players[2].id ?? 2,
          name: players[2].username ?? 'Player 2',
          avatar: players[2].avatar ?? '',
        },
      };
    }
    return null;
  };

  // Handle external control signals
  useEffect(() => {
    if (shouldStart) {
      setGameState((prevState) => {
        if (prevState.status === GameStatus.WAITING) {
          const startTime = Date.now();
          setGameStartTime(startTime);
          const newState = resetBall({
            ...prevState,
            status: GameStatus.RUNNING,
          });
          gameStateRef.current = newState;
          onStatusChange?.(GameStatus.RUNNING);
          return newState;
        } else if (prevState.status === GameStatus.PAUSED) {
          const newState = { ...prevState, status: GameStatus.RUNNING };
          gameStateRef.current = newState;
          onStatusChange?.(GameStatus.RUNNING);
          return newState;
        }
        return prevState;
      });
      onStartHandled?.();
    }
  }, [shouldStart, onStartHandled, onStatusChange]);

  useEffect(() => {
    if (shouldPause) {
      setGameState((prevState) => {
        if (prevState.status === GameStatus.RUNNING) {
          const newState = { ...prevState, status: GameStatus.PAUSED };
          gameStateRef.current = newState;
          onStatusChange?.(GameStatus.PAUSED);
          return newState;
        }
        return prevState;
      });
      onPauseHandled?.();
    }
  }, [shouldPause, onPauseHandled, onStatusChange]);

  
  // Handle game end and stats submission
  const handleGameEnd = useCallback(
    async (finalGameState: GameState) => {
      if (isProcessingGameEnd || !gameStartTime) return;
      
      const currentPlayers = getCurrentPlayers();

      if (!currentPlayers) return;

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
        0, // tournament level handled by parent
      );
      
      try {
        onGameComplete?.(gameResult, actualWinner.name);
      } catch (error) {
        console.error('Failed to save game result:', error);
      } finally {
        setIsProcessingGameEnd(false);
      }
    },
    [gameStartTime, isProcessingGameEnd],
  );
  
  useEffect(() => {
    if (gameState.status === GameStatus.ENDED && !isProcessingGameEnd)
      handleGameEnd(gameState);
  }, [gameState.status, isProcessingGameEnd, handleGameEnd]);
  
  const updateGame = (currentTime: number) => {
    const currentState = gameStateRef.current;

    const deltaTime = lastFrameTimeRef.current === 0 ? 0 : (currentTime - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = currentTime;
    //skip if coming back from pause and deltatime is too large
    if (deltaTime > 0.1) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
      return;
    }
    
    // Only update game physics when running
    if (currentState.status !== GameStatus.RUNNING) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
      return;
    }
    
      let newState = { ...currentState };

      // Move paddles
      if (keysPressedRef.current[Controls.leftPaddle.up.toLowerCase()]) {
        newState.leftPaddle.position.y = Math.max(
          0,
          newState.leftPaddle.position.y - newState.leftPaddle.speed * deltaTime,
        );
      }
      if (keysPressedRef.current[Controls.leftPaddle.down.toLowerCase()]) {
        newState.leftPaddle.position.y = Math.min(
          newState.canvasHeight - newState.leftPaddle.height,
          newState.leftPaddle.position.y + newState.leftPaddle.speed * deltaTime,
        );
      }
      if (keysPressedRef.current[Controls.rightPaddle.up.toLowerCase()]) {
        newState.rightPaddle.position.y = Math.max(
          0,
          newState.rightPaddle.position.y - newState.rightPaddle.speed * deltaTime,
        );
      }
      if (keysPressedRef.current[Controls.rightPaddle.down.toLowerCase()]) {
        newState.rightPaddle.position.y = Math.min(
          newState.canvasHeight - newState.rightPaddle.height,
          newState.rightPaddle.position.y + newState.rightPaddle.speed * deltaTime,
        );
      }

      // Move ball
      newState.ball.position.x += newState.ball.velocity.dx * deltaTime;
      newState.ball.position.y += newState.ball.velocity.dy * deltaTime;

      // Check collisions
      newState = checkWallCollision(newState);
      newState = handlePaddleCollisions(newState);

      // Check scoring
      const { newState: stateAfterScoring, scored } = checkScore(newState);

      if (scored) {
        // Notify parent of score change
        onScoreChange?.(stateAfterScoring.leftScore, stateAfterScoring.rightScore);

        if (stateAfterScoring.rightScore >= 3 || stateAfterScoring.leftScore >= 3) {
          const finalState = {
            ...stateAfterScoring,
            status: GameStatus.ENDED,
            gameEndTime: Date.now(),
          };
          setGameState(finalState);
          onStatusChange?.(GameStatus.ENDED);
          return;
        }
        newState = resetBall(stateAfterScoring);
      } else {
        newState = stateAfterScoring;
      }
    setGameState(newState);

    // Continue animation loop regardless of game state (for smooth rendering)
    animationFrameRef.current = requestAnimationFrame(updateGame);
  };

  // Start the game loop when the component mounts
  useEffect(() => {
    lastFrameTimeRef.current = 0;
    
    const gameLoop = (currentTime:number) => {
      updateGame(currentTime);
    };
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Handle keyboard events for game controls, not UI controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
        e.preventDefault();
        keysPressedRef.current[e.key.toLowerCase()] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
        keysPressedRef.current[e.key.toLowerCase()] = false;
      }

    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full h-full max-w-4xl mx-auto">
      <PongCanvas gameState={gameState} />
    </div>
  );
};

export default GameContainer;
