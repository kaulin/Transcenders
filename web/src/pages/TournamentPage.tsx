import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import GameContainer from '../components/game/GameContainer';
import { ApiClient } from '@transcenders/api-client';
import { type CreateScoreRequest } from '@transcenders/contracts';
import { type GameResult } from '../components/game/models/GameState';
import { GameStatus } from '../components/game/models/GameState';
import { useTranslation } from 'react-i18next';

interface TournamentState {
  allPlayers: any[]; // All 4 players
  currentMatch: 1 | 2 | 3;
  winners: any[];
  gameResults: GameResult[];
  isComplete: boolean;
  roundComplete: boolean;
  lastGameResult: GameResult | null;
  gameKey: number;
}

function TournamentPage() {
  const { players, setPlayer } = usePlayers();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [tournamentState, setTournamentState] = useState<TournamentState>({
    allPlayers: [],
    currentMatch: 1,
    winners: [],
    gameResults: [],
    isComplete: false,
    roundComplete: false,
    lastGameResult: null,
    gameKey: 0,
  });

  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.WAITING);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [isProcessingGameEnd, setIsProcessingGameEnd] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  //control signals for GameContainer
  const [shouldStart, setShouldStart] = useState(false);
  const [shouldPause, setShouldPause] = useState(false);

  // Fisher-Yates shuffle used
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fixedPlayersRef = useRef<any[]>([]);

  // Get current players for rendering the page
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

  //handle keyboard action for game controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (gameStatus === GameStatus.WAITING || gameStatus == GameStatus.PAUSED) {
          handleStartPause();
        } else if (gameStatus === GameStatus.RUNNING) {
          handleStartPause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, handleStartPause]);

  // Initialize tournament ONCE and store fixed player order
  useEffect(() => {
    // if we already have fixed players, don't re-initialize
    if (fixedPlayersRef.current.length > 0) {
      return;
    }

    const allPlayersArray = [players[1], players[2], players[3], players[4]];
    const shuffledPlayers = shuffleArray(allPlayersArray);

    // IMPORTANT: Store in ref so it never changes
    fixedPlayersRef.current = shuffledPlayers;

    // Update state with fixed players
    setTournamentState((prev) => ({
      ...prev,
      allPlayers: fixedPlayersRef.current,
    }));

    // set up first match
    setPlayer(1, fixedPlayersRef.current[0]);
    setPlayer(2, fixedPlayersRef.current[1]);
  }, []); // Empty dependencies means it only runs on mount

  const handleTGameComplete = (result: GameResult, winnerName?: string) => {
    const { currentMatch, winners, gameResults } = tournamentState;

    // backend tournament_level logged as: Final=1, Semi=2,3
    let tournamentLevel: number;
    if (currentMatch === 1) {
      tournamentLevel = 3;
    } else if (currentMatch === 2) {
      tournamentLevel = 2;
    } else {
      tournamentLevel = 1;
    }

    const updatedResult = {
      ...result,
      tournament_level: tournamentLevel,
    };

    const currentPlayer1 = players[1];
    const currentPlayer2 = players[2];

    let winner;
    if (winnerName === currentPlayer1?.username) {
      winner = currentPlayer1;
    } else {
      winner = currentPlayer2;
    }

    setWinner(winnerName ?? 'Unknown Player'); //sets winner for rendering after match

    const newWinners = [...winners, winner];
    const newResults = [...gameResults, updatedResult];

    // mark round as complete and store the result, but don't advance yet
    setTournamentState((prev) => ({
      ...prev,
      roundComplete: true,
      lastGameResult: updatedResult,
      winners: newWinners,
      gameResults: newResults,
    }));
    setIsProcessingGameEnd(false);
  };

  const handleContinueToNextRound = () => {
    const { currentMatch, allPlayers, winners } = tournamentState;

    if (currentMatch === 1) {
      setPlayer(1, allPlayers[2]);
      setPlayer(2, allPlayers[3]);
      setTournamentState((prev) => ({
        ...prev,
        currentMatch: 2,
        roundComplete: false,
        lastGameResult: null,
        gameKey: prev.gameKey + 1,
      }));
    } else if (currentMatch === 2) {
      setPlayer(1, winners[0]);
      setPlayer(2, winners[1]);

      setTournamentState((prev) => ({
        ...prev,
        currentMatch: 3,
        roundComplete: false,
        lastGameResult: null,
        gameKey: prev.gameKey + 1,
      }));
    } else if (currentMatch === 3) {
      const finalResults = tournamentState.gameResults;

      setTournamentState((prev) => ({
        ...prev,
        isComplete: true,
        roundComplete: false,
      }));

      // Send all tournament results to backend
      sendTournamentResults(finalResults);
    }
    //reseet game for new round
    setGameStatus(GameStatus.WAITING);
    setLeftScore(0);
    setRightScore(0);
    setWinner(null);
  };

  const sendTournamentResults = async (allResults: GameResult[]) => {
    try {
      for (const result of allResults) {
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

        console.log('Tournament result saved successfully', response);
      }
    } catch (error) {
      console.error('Failed to send tournament results:', error);
    }
  };

  const getMatchTitle = () => {
    switch (tournamentState.currentMatch) {
      case 1:
        return t('firstRound', 'FIRST ROUND');
      case 2:
        return t('secondRound', 'SECOND ROUND');
      case 3:
        return t('final', 'FINAL');
      default:
        return t('tournamentComplete', 'Tournament Complete');
    }
  };

  return (
    <div className="h-full pt-8 relative">
      <div className="container mx-auto px-4">
        {/*Tournament Title*/}
        <div className="text-center mb-4">
          <h1 className="text-6xl text-white font-fascinate mb-4">
            {t('pawPawPongTournament', 'Paw-Paw Pong Tournament')}
          </h1>
          <h2 className="'text=4xl' font-bold text-white mb-2">{getMatchTitle()}</h2>
        </div>

        {/*Player names anad scores */}
        <div className="flex justify-between items-center mb-4 px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-2">
              {player1?.username ?? 'Player 1'}
            </h2>
            <div className="text-5xl font-bold text-white">{leftScore}</div>
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-2">
              {player2?.username ?? 'Player 2'}
            </h2>
            <div className="text-5xl font-bold text-white">{rightScore}</div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center relative">
          <GameContainer
            key={tournamentState.gameKey}
            width={1000}
            height={800}
            onGameComplete={handleTGameComplete}
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
              <div className="text-3xl font-bold mb-4">
                {t('pressSpaceToStart', 'Press Space to Start')}
              </div>
              <div className="text-lg mb-2">
                {t('player1Controls', 'Player 1: W (up) and S (down)')}
              </div>
              <div className="text-lg">{t('player2Controls', 'Player 2: ↑ (up) and ↓ (down)')}</div>
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
              <div className="text-4xl font-bold mb-4">{t('paused', 'PAW-SED')}</div>
              <div className="text-lg">{t('pressSpaceToResume', 'Press Space to Resume')}</div>
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
              <div className="text-xl mb-8">
                {t('clawsomeVictory', 'What a Claw-some victory!')}
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex w-full justify-center gap-10 mt-6">
          {gameStatus === GameStatus.ENDED && tournamentState.roundComplete ? (
            <button
              className="rounded-button bg-[#c2410c]/10 font-fascinate uppercase text-lg"
              disabled={isProcessingGameEnd}
              onClick={() => {
                if (tournamentState.currentMatch === 3) {
                  navigate('/');
                } else {
                  handleContinueToNextRound();
                }
              }}
            >
              {tournamentState.currentMatch === 3 ? t('backToHome') : t('continueToNextRound')}
            </button>
          ) : gameStatus !== GameStatus.ENDED ? (
            <button
              className="rounded-button bg-[#c2410c]/10 font-fascinate uppercase text-lg"
              onClick={handleStartPause}
            >
              {gameStatus === GameStatus.RUNNING ? t('pause') : t('start')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default TournamentPage;
