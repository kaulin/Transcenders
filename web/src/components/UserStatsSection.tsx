import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiClient } from '@transcenders/api-client';
import type { Stats } from '@transcenders/contracts';

import { useApiClient } from '../hooks/useApiClient';
import GoalChart from './GoalChart';
import PieCharts from './PieCharts';
import StatRow from './StatRow';

interface UserStatsProps {
  viewedId: number | undefined;
  viewedUsername: string | undefined;
}

export default function UserStatsSection({ viewedId, viewedUsername }: UserStatsProps) {
  const { t } = useTranslation();

  const [userStats, setUserStats] = useState<Stats | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();

  useEffect(() => {
    async function fetchStats() {
      if (viewedId === undefined) return;

      setError(null);

      try {
        const stats = await api(() => ApiClient.score.getStatsForUser(viewedId));
        setUserStats(stats);
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }

    fetchStats();
  }, [viewedId, t, api]);

  return (
    <>
      <div className="flex flex-col text-center">
        <p className="w-[300px] text-xl sm:text-2xl font-fascinate uppercase text-[#fff] mb-2">
          {t('games_played')}
        </p>
        {error ? (
          <div className="tsc-error-message text-center">{t(error)}</div>
        ) : (
          <>
            <StatRow label={t('total')} value={userStats?.total_games ?? 0} />
            <StatRow label={t('wins')} value={userStats?.total_wins ?? 0} />
            <StatRow
              label={t('losses')}
              value={(userStats?.total_games ?? 0) - (userStats?.total_wins ?? 0)}
            />
            <StatRow
              label={t('average_score')}
              value={(userStats?.average_score ?? 0).toFixed(1)}
            />
            <StatRow
              label={t('win_percentage')}
              value={(userStats?.total_win_percentage ?? 0).toFixed(1)}
            />
          </>
        )}
      </div>
      <PieCharts viewedId={viewedId} />
      <GoalChart viewedId={viewedId} viewedUsername={viewedUsername} />
    </>
  );
}
