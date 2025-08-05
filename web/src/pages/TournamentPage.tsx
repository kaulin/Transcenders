import { useState, useEffect, useRef } from 'react';
import { usePlayers } from '../hooks/usePlayers';
import GameContainer from '../components/game/GameContainer';
import { ApiClient } from '@transcenders/api-client';
import { type CreateScoreRequest } from '@transcenders/contracts';
import { type GameResult } from '../components/game/models/GameState';

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
    } else if (winnerName === currentPlayer2?.username) {
      winner = currentPlayer2;
    } else {
      winner = currentPlayer1; // Fallback
    }

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

        if (!response.success) {
          throw new Error(response.error || 'Failed to save tournament result');
        }
      }
    } catch (error) {
      console.error('Failed to send tournament results:', error);
    }
  };

  const getMatchTitle = () => {
    switch (tournamentState.currentMatch) {
      case 1:
        return 'FIRST ROUND';
      case 2:
        return 'SECOND ROUND';
      case 3:
        return 'FINAL';
      default:
        return 'Tournament Complete';
    }
  };

  return (
    <div className="h-full pt-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">{getMatchTitle()}</h2>
          <p className="text-lg">
            {players[1]?.username} vs {players[2]?.username}
          </p>
        </div>

        <div className="flex justify-center">
          <GameContainer
            key={tournamentState.gameKey} //forces complete re-mount
            width={1000}
            height={800}
            gameMode="tournament"
            onGameComplete={handleTGameComplete}
            isRoundComplete={tournamentState.roundComplete}
            onContinueToNextRound={handleContinueToNextRound}
            isFinalRound={tournamentState.currentMatch === 3}
          />
        </div>
      </div>
    </div>
  );
}

export default TournamentPage;
