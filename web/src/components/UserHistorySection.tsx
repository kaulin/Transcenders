import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiClient } from '@transcenders/api-client';
import { Score } from '@transcenders/contracts';
import { useUser } from '../hooks/useUser';

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

  useEffect(() => {
    async function fetchScoresAndUsers() {
      if (viewedId === undefined) return;

      setError(null);

      try {
        const scores = await ApiClient.score.getScoresForUser(viewedId);
        setUserScores(scores);

        const ids = [...new Set(scores.flatMap((s) => [s.winner_id, s.loser_id]))];

        const users = await Promise.all(
          ids.map((id) =>
            ApiClient.user
              .getUserById(id)
              .then((u) => [id, u.username] as const)
              .catch(() => [id, t('guest')] as const),
          ),
        );

        setUsernames(Object.fromEntries(users));
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }

    fetchScoresAndUsers();
  }, [viewedId, t]);

  return (
    <>
      <p className="text-[#fff] text-center text-fluid-base font-fascinate uppercase">
        {t('history')}
      </p>
      <div className="w-full h-[90%] flex items-center justify-center">
        <div className="relative w-[55%] min-w-[180px] h-[clamp(400px,68vh,880px)] bg-[#6e5d41]/5 rounded-lg px-[clamp(9px,0.63vw,16px)] py-[clamp(33px,4.3vh,56px)]">
          {error ? (
            <div className="tsc-error-message text-center">{t(error)}</div>
          ) : !userScores ? (
            <div className="tsc-info-message text-center">{t('loading')}</div>
          ) : !userScores.length ? (
            <div className="tsc-info-message text-center">{t('not_available')}</div>
          ) : (
            <div className="relative h-full w-full px-[clamp(5px,0.31vw,8px)] overflow-y-auto custom-scrollbar flex flex-col gap-[clamp(28px,3.7vh,48px)]">
              {userScores?.map(
                ({ id, winner_id, loser_id, winner_score, loser_score, game_end }) => (
                  <div key={id} className="flex flex-col justify-center items-center">
                    <div className="w-full flex justify-between text-[#fff]">
                      <div className="font-fascinate uppercase text-fluid-sm">
                        {winner_id === user?.id ? 'win' : 'loss'}
                      </div>
                      <div className="text-[#fff] text-fluid-sm">
                        {new Intl.DateTimeFormat('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                        }).format(new Date(game_end))}
                      </div>
                    </div>
                    <StatRow
                      id={winner_id}
                      label={usernames[winner_id] ?? t('loading')}
                      value={winner_score}
                    />
                    <StatRow
                      id={loser_id}
                      label={usernames[loser_id] ?? t('loading')}
                      value={loser_score}
                    />
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
