import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GameContainer from '../components/game/GameContainer';
import { ApiClient } from '@transcenders/api-client';
import { type CreateScoreRequest } from '@transcenders/contracts';
import { type GameResult } from '../components/game/models/GameState';
import { GameStatus } from '../components/game/models/GameState';
import { usePlayers } from '../hooks/usePlayers';
import { useTranslation } from 'react-i18next';

function MatchPage() {
  const [gameKey, setGameKey] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.WAITING);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isProcessingGameEnd, setIsProcessingGameEnd] = useState(false);

  // Control signals for GameContainer
  const [shouldStart, setShouldStart] = useState(false);
  const [shouldPause, setShouldPause] = useState(false);

  const { players } = usePlayers();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Get current players
  const player1 = players[1];
  const player2 = players[2];

  const handleStartPause = useCallback(() => {
    if (gameStatus === GameStatus.WAITING || gameStatus === GameStatus.PAUSED) {
      setShouldStart(true);
    } else if (gameStatus === GameStatus.RUNNING) {
      setShouldPause(true);
    }
  }, [gameStatus]);

  const handleStatusChange = useCallback((status: GameStatus) => {
    setGameStatus(status);
  }, []);

  const handleScoreChange = useCallback((left: number, right: number) => {
    setLeftScore(left);
    setRightScore(right);
  }, []);

  const handleNewGame = useCallback(() => {
    setGameKey((prev) => prev + 1);
    setGameStatus(GameStatus.WAITING);
    setLeftScore(0);
    setRightScore(0);
    setWinner(null);
    setIsProcessingGameEnd(false);
  }, []);

  // Handle keyboard events for game controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (
          gameStatus === GameStatus.WAITING ||
          gameStatus === GameStatus.PAUSED ||
          gameStatus === GameStatus.RUNNING
        ) {
          handleStartPause();
        } else if (gameStatus === GameStatus.ENDED) {
          handleNewGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, handleStartPause, handleNewGame]); // Added missing dependencies

  const handleGameComplete = async (result: GameResult, winnerName?: string) => {
    setWinner(winnerName ?? 'Unknown Player');
    try {
      const scoreData: CreateScoreRequest = {
        winner_id: result.winner_id,
        loser_id: result.loser_id,
        winner_score: result.winner_score,
        loser_score: result.loser_score,
        tournament_level: result.tournament_level,
        game_duration: result.game_duration,
        game_start: result.game_start.toString(),
        game_end: result.game_end.toString(),
      };

      const response = await ApiClient.score.createScore(scoreData);
      console.log('SUCCESS: sent score data to backend', response);
    } catch (error) {
      console.error('Failed to send score data:', error);
    } finally {
      setIsProcessingGameEnd(false);
    }
  };

  return (
    <div className="h-full pt-8 relative">
      <div className="container mx-auto px-4">
        {/* Game Title */}
        <div className="text-center mb-4">
          <h1 className="text-6xl text-[#fff] font-fascinate mb-4">{t('pawPawPong')}</h1>
        </div>

        {/* Player Names and Scores */}
        <div className="flex justify-between items-center mb-4 px-8">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-2">
              {player1?.username ?? 'Player 1'}
            </h2>
            <div className="text-7xl font-bold text-white">{leftScore}</div>
          </div>

          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-2">
              {player2?.username ?? 'Player 2'}
            </h2>
            <div className="text-7xl font-bold text-white">{rightScore}</div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center relative">
          <GameContainer
            key={gameKey}
            width={1000}
            height={800}
            onGameComplete={handleGameComplete}
            onStatusChange={handleStatusChange}
            onScoreChange={handleScoreChange}
            shouldStart={shouldStart}
            shouldPause={shouldPause}
            onStartHandled={() => setShouldStart(false)}
            onPauseHandled={() => setShouldPause(false)}
          />

          {/* Overlay Messages */}
          {gameStatus === GameStatus.WAITING && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#c2410c] bg-opacity-50 text-white"
              style={{
                width: '1000px',
                height: '800px',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="text-3xl font-bold mb-4">{t('pressSpaceToStart')}</div>
              <div className="text-lg mb-2">{t('player1Controls')}</div>
              <div className="text-lg">{t('player2Controls')}</div>
            </div>
          )}

          {gameStatus === GameStatus.PAUSED && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#c2410c] bg-opacity-50 text-white"
              style={{
                width: '1000px',
                height: '800px',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="text-4xl font-bold mb-4">{t('paused')}</div>
              <div className="text-lg">{t('pressSpaceToResume')}</div>
            </div>
          )}

          {gameStatus === GameStatus.ENDED && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#c2410c] bg-opacity-50 text-white"
              style={{
                width: '1000px',
                height: '800px',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="text-4xl font-bold mb-4">
                {t('playerWins', '{{player}} Wins!', { player: winner })}
              </div>
              <div className="text-xl mb-8">{t('clawsomeVictory')}</div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex w-full justify-center gap-10 mt-6">
          {gameStatus === GameStatus.ENDED ? (
            <div className="flex gap-4">
              <button
                className="rounded-button bg-[#c2410c]/10 font-fascinate uppercase text-lg"
                disabled={isProcessingGameEnd}
                onClick={handleNewGame}
              >
                {t('startNewGame')}
              </button>
              <button
                className="rounded-button bg-[#c2410c]/10 font-fascinate uppercase text-lg"
                onClick={() => navigate('/')}
              >
                {t('backToHome')}
              </button>
            </div>
          ) : (
            <button
              className="rounded-button bg-[#c2410c]/10 font-fascinate uppercase text-lg"
              onClick={handleStartPause}
            >
              {gameStatus === GameStatus.RUNNING ? t('pause') : t('start')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MatchPage;
