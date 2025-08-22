import { ApiClient } from '@transcenders/api-client';
import { type CreateScoreRequest } from '@transcenders/contracts';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import GameContainer from '../components/game/GameContainer';
import { GameStatus, type GameResult } from '../components/game/models/GameState';
import { usePlayers } from '../hooks/usePlayers';

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
    <div className="box">
      <div className="box-section bg-[#6e5d41]/10 ">
        <div className="w-full h-full mx-auto px-4 flex flex-col items-center justify-center">
          {/* Game Title */}
          <div className="text-center mb-4">
            <h1 className="text-3xl sm:text-3xl lg:text-5xl text-[#fff] font-fascinate">
              {t('pawPawPong')}
            </h1>
          </div>

          {/* Player Avatars and Names and Scores */}
          <div className="w-full flex justify-between items-center mb-4 px-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="bubble bg-white/50 w-14 h-14 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex justify-center overflow-hidden shrink-0">
                  {players[1]?.avatar ? (
                    <img
                      src={ApiClient.user.getFullAvatarURL(players[1].avatar)}
                      alt={`${players[1]?.username} avatar`}
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>

                <div className="absolute -bottom-4 sm:-bottom-5 lg:-bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="text-white text-center">
                    <span className="text-2xl sm:text-3xl lg:text-5xl font-bold">
                      {players[1]?.username ?? 'Player 1'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mt-6">
                {leftScore}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="bubble bg-white/50 w-14 h-14 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex justify-center overflow-hidden shrink-0">
                  {players[2]?.avatar ? (
                    <img
                      src={ApiClient.user.getFullAvatarURL(players[2].avatar)}
                      alt={`${players[2]?.username} avatar`}
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>

                <div className="absolute -bottom-4 sm:-bottom-5 lg:-bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="text-white text-center">
                    <span className="text-2xl sm:text-3xl lg:text-5xl font-bold">
                      {players[2]?.username ?? 'Player 2'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mt-6">
                {rightScore}
              </div>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[1000px] aspect-[5/4] overflow-hidden">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#c2410c]/50 text-white">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-center px-4">
                    {t('pressSpaceToStart')}
                  </div>
                  <div className="text-sm sm:text-base lg:text-lg mb-2 text-center px-4">
                    {t('player1Controls')}
                  </div>
                  <div className="text-sm sm:text-base lg:text-lg text-center px-4">
                    {t('player2Controls')}
                  </div>
                </div>
              )}

              {gameStatus === GameStatus.PAUSED && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#c2410c]/50 text-white">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                    {t('paused')}
                  </div>
                  <div className="text-sm sm:text-base lg:text-lg">{t('pressSpaceToResume')}</div>
                </div>
              )}

              {gameStatus === GameStatus.ENDED && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#c2410c]/50 text-white">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-center px-4">
                    {t('playerWins', '{{player}} Wins!', { player: winner })}
                  </div>
                  <div className="text-lg sm:text-xl mb-8 text-center px-4">
                    {t('clawsomeVictory')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex w-full justify-center gap-4 sm:gap-10 mt-6 px-4">
            {gameStatus === GameStatus.ENDED ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="rounded-button bg-[#c2410c]/10 font-fascinate uppercase text-sm sm:text-lg"
                  disabled={isProcessingGameEnd}
                  onClick={handleNewGame}
                >
                  {t('startNewGame')}
                </button>
                <button
                  className="rounded-button bg-[#c2410c]/10 font-fascinate uppercase text-sm sm:text-lg"
                  onClick={() => navigate('/')}
                >
                  {t('backToHome')}
                </button>
              </div>
            ) : (
              <button
                className="rounded-button bg-[#c2410c]/10 font-fascinate uppercase text-sm sm:text-lg"
                onClick={handleStartPause}
              >
                {gameStatus === GameStatus.RUNNING ? t('pause') : t('start')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchPage;
