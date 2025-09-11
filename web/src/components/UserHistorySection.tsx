import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiClient } from '@transcenders/api-client';
import { Score } from '@transcenders/contracts';
import { useUser } from '../hooks/useUser';

import { useApiClient } from '../hooks/useApiClient';
import StatRow from './StatRow';

interface UserHistoryProps {
  viewedId: number | undefined;
}

export default function UserHistory({ viewedId }: UserHistoryProps) {
  const { t } = useTranslation();
  const { user } = useUser();

  const [userScores, setUserScores] = useState<Score[] | undefined>();
  const [usernames, setUsernames] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();

  useEffect(() => {
    async function fetchScoresAndUsers() {
      if (viewedId === undefined) return;

      setError(null);

      try {
        const scores = await api(() => ApiClient.score.getScoresForUser(viewedId));
        setUserScores(scores);

        const ids = [...new Set(scores.flatMap((s) => [s.winner_id, s.loser_id]))];

        const users = await Promise.all(
          ids.map((id) =>
            api(() =>
              ApiClient.user
                .getUserById(id)
                .then((u) => [id, u.username] as const)
                .catch(() => [id, `User#${id}`] as const),
            ),
          ),
        );

        setUsernames(Object.fromEntries(users));
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }

    fetchScoresAndUsers();
  }, [viewedId, t, api]);

  return (
    <>
      <p className="text-[#fff] text-center text-2xl font-fascinate uppercase">{t('history')}</p>
      <div className="relative w-80 h-[823px] bg-[#6e5d41]/5 rounded-lg px-4 py-14">
        {error ? (
          <div className="tsc-error-message text-center">{t(error)}</div>
        ) : !userScores ? (
          <div className="tsc-info-message text-center">{t('loading')}</div>
        ) : !userScores.length ? (
          <div className="tsc-info-message text-center">{t('not_available')}</div>
        ) : (
          <div className="relative h-full w-full px-2 overflow-y-auto custom-scrollbar flex flex-col gap-12">
            {userScores?.map(({ id, winner_id, loser_id, winner_score, loser_score, game_end }) => (
              <div key={id} className="flex flex-col justify-center items-center">
                <div key={id} className="w-full flex justify-between text-[#fff]">
                  <div className="font-fascinate uppercase text-xl">
                    {winner_id === user?.id ? 'win' : 'loss'}
                  </div>
                  <div className="text-[#fff]">
                    {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit' }).format(
                      new Date(game_end),
                    )}
                  </div>
                </div>
                <StatRow label={usernames[winner_id] ?? t('loading')} value={winner_score} />
                <StatRow label={usernames[loser_id] ?? t('loading')} value={loser_score} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
