import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import PlayerLoginForm from '../components/PlayerLoginForm';
import { usePlayers } from '../hooks/usePlayers';
import { useUser } from '../hooks/useUser';

const Home = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { players, setPlayer } = usePlayers();

  const [gameMode, setGameMode] = useState<'match' | 'tournament' | 'none'>('none');

  useEffect(() => {
    if (user?.id) {
      setPlayer(1, {
        id: user?.id,
        username: user?.username,
        avatar: user?.avatar,
        mode: 'login',
        ready: true,
      });
    }
  }, [user?.id, user?.username, user?.avatar, setPlayer]);

  return (
    <div className="box">
      {gameMode === 'none' && (
        <div className="box-section bg-[#6e5d41]/10 justify-center lg:min-h-0">
          <h1 className="text-fluid-5xl text-center font-fascinate">
            {t('hello')} {user?.username}
          </h1>
          <p className="mb-[clamp(23px,1.6vw,40px)] text-fluid-base">{t('welcome')}!</p>

          <div className="flex flex-col">
            <button
              onClick={() => setGameMode('match')}
              className="rounded-button bg-[#6e5d41]/10 text-fluid-xs font-fascinate uppercase mt-[clamp(14px,0.94vw,24px)]"
            >
              {t('start_match')}
            </button>

            <button
              onClick={() => setGameMode('tournament')}
              className="rounded-button bg-[#6e5d41]/10 text-fluid-xs font-fascinate uppercase mt-[clamp(14px,0.94vw,24px)]"
            >
              {t('start_tournament')}
            </button>
          </div>
        </div>
      )}

      {gameMode === 'match' && (
        <div className="box-section bg-[#6e5d41]/10 justify-center">
          <h1 className="text-fluid-4xl font-fascinate uppercase">{t('one_v_one')}</h1>
          <button onClick={() => setGameMode('none')} className="mb-[clamp(40px,3.7vw,90px)]">
            {t('switch_game_mode')}
          </button>
          <div className="flex flex-col sm:flex-row justify-center sm:gap-10">
            <div className="w-[clamp(250px,15.6vw,280px)] h-[clamp(100px,13.35vh,174px)] p-[clamp(9px,0.63vw,16px)] text-center">
              <h2 className="fascinate-label">{t('player')} 1</h2>
              <p className="border-b-2 border-white text-fluid-sm flex justify-start">
                {user?.username}
              </p>
              <p className="flex justify-end text-fluid-xs mt-[clamp(5px,0.61vh,8px)] p-[clamp(5px,0.31vw,8px)]">
                ✓
              </p>
            </div>
            <div className="w-[clamp(250px,15.6vw,280px)] h-[clamp(130px,13.35vh,174px)] p-[clamp(9px,0.63vw,16px)] text-center">
              <PlayerLoginForm playerNumber={2} player={players[2]} />
            </div>
          </div>
          <div className="flex justify-center h-[36px]">
            {players[2]?.ready && (
              <Link
                to="/MatchPage"
                className="font-fascinate uppercase text-fluid-xl text-white hover:text-[#786647] mt-[clamp(37px,2.8vw,72px)]"
              >
                start
              </Link>
            )}
          </div>
        </div>
      )}

      {gameMode === 'tournament' && (
        <div className="box-section bg-[#6e5d41]/10 justify-center">
          <h1 className="text-fluid-3xl font-fascinate uppercase">{t('tournament')}</h1>
          <button onClick={() => setGameMode('none')} className="mb-[clamp(40px,3.7vw,90px)]">
            {t('switch_game_mode')}
          </button>
          <div className="flex flex-col justify-center sm:gap-10">
            <div className="flex flex-col sm:flex-row justify-center sm:gap-10">
              <div className="w-[clamp(250px,15.6vw,280px)] h-[clamp(100px,13.35vh,174px)] p-[clamp(9px,0.63vw,16px)] text-center">
                <h2 className="fascinate-label mb-[clamp(5px,0.61vh,8px)]">{t('player')} 1</h2>
                <p className="border-b-2 border-white text-fluid-sm flex justify-between">
                  {user?.username}
                </p>
                <p className="flex justify-end text-fluid-xs mt-[clamp(5px,0.61vh,8px)] p-[clamp(5px,0.31vw,8px)]">
                  ✓
                </p>
              </div>
              <div className="w-[clamp(250px,15.6vw,280px)] h-[clamp(130px,13.35vh,174px)] p-[clamp(9px,0.63vw,16px)] text-center">
                <PlayerLoginForm playerNumber={2} player={players[2]} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center sm:gap-10">
              <div className="w-[clamp(250px,15.6vw,280px)] h-[clamp(130px,13.35vh,174px)] p-[clamp(9px,0.63vw,16px)] text-center">
                <PlayerLoginForm playerNumber={3} player={players[3]} />
              </div>
              <div className="w-[clamp(250px,15.6vw,280px)] h-[clamp(130px,13.35vh,174px)] p-[clamp(9px,0.63vw,16px)] text-center">
                <PlayerLoginForm playerNumber={4} player={players[4]} />
              </div>
            </div>
          </div>
          <div className="flex justify-center h-[36px]">
            {players[2]?.ready && players[3]?.ready && players[4]?.ready && (
              <Link
                to="/TournamentPage"
                className="font-fascinate uppercase text-fluid-xl text-white hover:text-[#786647] mt-[clamp(37px,2.8vw,72px)]"
              >
                start
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
