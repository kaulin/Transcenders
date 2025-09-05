import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ApiClient } from '@transcenders/api-client';
import { Score } from '@transcenders/contracts';
import { useApiClient } from '../hooks/useApiClient';
import { useUser } from '../hooks/useUser';

interface GoalChartProps {
  viewedId: number | undefined;
  viewedUsername: string | undefined;
}

export default function GoalChart({ viewedId, viewedUsername }: GoalChartProps) {
  const { t } = useTranslation();
  const { user } = useUser();

  const [userScores, setUserScores] = useState<Score[] | undefined>();
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();

  useEffect(() => {
    async function fetchScores() {
      if (viewedId === undefined) return;

      setError(null);

      try {
        const scores = await api(() => ApiClient.score.getScoresForUser(viewedId));
        setUserScores(scores);
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }

    fetchScores();
  }, [viewedId, t, api]);

  const chartData = userScores
    ? [...userScores.slice(0, 10)].reverse().map((s) => ({
        scored: s.winner_id === viewedId ? s.winner_score : s.loser_score,
        conceded: s.winner_id === viewedId ? s.loser_score : s.winner_score,
        date: s.game_end,
      }))
    : [];

  if (error) return <div className="tsc-error-message text-center">{t(error)}</div>;
  if (!userScores) return <div className="tsc-info-message text-center">{t('loading')}</div>;

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-center text-[#fff] font-fascinate text-xl uppercase">
        {t('latest_outcomes')}
      </p>
      <div className="flex w-full justify-center items-center h-40 pr-10">
        <ResponsiveContainer width="80%" height="80%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="scored" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a7d4373c" stopOpacity={1} />
                <stop offset="95%" stopColor="#fffb82" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="conceded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5d6b2f52" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#5d6b2f52" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
            <XAxis
              dataKey="date"
              stroke="#fff"
              tick={{ fontSize: 12, fill: '#fff' }}
              interval="preserveStartEnd"
              tickFormatter={(value) =>
                new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit' }).format(
                  new Date(value),
                )
              }
            />
            <YAxis stroke="#fff" />
            <Tooltip
              contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="conceded"
              stroke="#fff"
              fillOpacity={1}
              fill="url(#conceded)"
              name={t('opponent')}
            />
            <Area
              type="monotone"
              dataKey="scored"
              stroke="#fff"
              fillOpacity={1}
              fill="url(#scored)"
              name={t('you')}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col sm:flex-row text-sm sm:text-base gap-4">
        <div className="flex gap-2 items-center text-white">
          <div className="w-4 h-4 rounded-full bg-[#a7d4373c] border border-white"></div>
          {viewedUsername === user?.username ? t('you') : viewedUsername}
        </div>
        <div className="flex gap-2 items-center text-white">
          <div className="w-4 h-4 rounded-full bg-[#5d6b2f52] border border-white"></div>
          {t('opponent')}
        </div>
      </div>
    </div>
  );
}
