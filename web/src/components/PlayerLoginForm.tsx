import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiClient } from '@transcenders/api-client';
import { useApiClient } from '../hooks/useApiClient';
import { usePlayers } from '../hooks/usePlayers';
import useVerifyLogin from '../hooks/useVerifyLogin';
import type { Player } from '../types/types';

interface Props {
  playerNumber: number;
  player?: Player;
  displayLabel?: string;
}

const PlayerLoginForm = ({ playerNumber, player, displayLabel }: Props) => {
  const { players, setPlayer, resetPlayer } = usePlayers();
  const { login } = useVerifyLogin();
  const { t } = useTranslation();
  const api = useApiClient();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGoBack = () => {
    resetPlayer(playerNumber);
    setUsername('');
    setPassword('');
    setError(null);
  };

  const handleUsernameCheck = () => {
    const taken = Object.values(players).some((p) => p.username === username);
    if (taken) {
      setError(t('username_taken'));
      return false;
    }
    return true;
  };

  const handleGuestContinue = async () => {
    if (!username?.trim()) {
      setError(t('input_username'));
      return;
    }

    if (!handleUsernameCheck()) return;

    try {
      await api(() => ApiClient.user.getUserExact({ username: username }));
      setError(t('username_taken'));
      return;
    } catch (err: any) {}

    setPlayer(playerNumber, {
      id: 0,
      username: username,
      ready: true,
      avatar: await ApiClient.user.getOneRandomCat(),
    });
  };

  const handleLoginContinue = async () => {
    if (!username?.trim() || !password) {
      setError(t('input_username_pw'));
      return;
    }

    if (!handleUsernameCheck()) return;

    try {
      await login(username?.trim(), password, playerNumber);
    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  };

  const backAndContinueButtons = (onContinue: () => void) => (
    <div className="flex justify-between text-fluid-xs mt-[clamp(5px,0.61vh,8px)] p-[clamp(5px,0.31vw,8px)]">
      <button onClick={handleGoBack}>← {t('go_back')}</button>

      <button onClick={onContinue}>{t('continue')} →</button>
    </div>
  );

  if (!player?.mode) {
    return (
      <>
        <h2 className="fascinate-label mb-[clamp(7px,0.47vw,12px)]">
          {displayLabel || `${t('player')} ${playerNumber}`}
        </h2>
        <div className="flex flex-col gap-[clamp(5px,0.31vw,8px)] items-center">
          <button
            className="flex items-center text-fluid-sm"
            onClick={() => setPlayer(playerNumber, { mode: 'guest' })}
          >
            {t('play_as_guest')}
          </button>

          <button
            className="flex items-center text-fluid-sm"
            onClick={() => setPlayer(playerNumber, { mode: 'login' })}
          >
            {t('log_in')}
          </button>
        </div>
      </>
    );
  }

  if (player?.ready) {
    return (
      <>
        <h2 className="fascinate-label">
          {displayLabel || `${t('player')} ${playerNumber}`}
        </h2>
        <p className="border-b-2 border-white text-start text-fluid-sm">{player.username}</p>
        <div className="flex justify-between mt-[clamp(5px,0.61vh,8px)] p-[clamp(5px,0.31vw,8px)]">
          <button className=" text-fluid-xs" onClick={handleGoBack}>
            ← {t('go_back')}
          </button>

          <p className="text-fluid-xs text-[#e3ff9d]">✓</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="fascinate-label">
        {displayLabel || `${t('player')} ${playerNumber}`}
      </h2>
      <input
        type="text"
        placeholder={t('username')}
        className="input-field"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {player?.mode === 'login' && (
        <input
          type="password"
          placeholder={t('password')}
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}

      {player.mode === 'login'
        ? backAndContinueButtons(handleLoginContinue)
        : backAndContinueButtons(handleGuestContinue)}

      {error && <div className="tsc-error-message">{error}</div>}
    </>
  );
};

export default PlayerLoginForm;
