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
import { useUser } from '../hooks/useUser';
import { useApiClient } from '../hooks/useApiClient';

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
  if (!userScores)
    return <div className="tsc-info-message text-center">{t('loading')}</div>;

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-center text-[#fff] font-fascinate text-fluid-sm uppercase">
        {t('latest_outcomes')}
      </p>
      <div className="flex w-full justify-center items-center h-[clamp(94px,12.3vh,160px)] pr-[clamp(35px,1.6vw,40px)] text-fluid-sm">
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
              tick={{ fontSize: '60%', fill: '#fff' }}
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
      <div className="flex text-fluid-sm gap-[clamp(9px,0.63vw,16px)]">
        <div className="flex gap-[clamp(5px,0.3vw,8px)] items-center text-white">
          <div className="w-[clamp(9px,0.5vw,12px)] aspect-square rounded-full bg-[#a7d4373c] border border-white"></div>
          {viewedUsername === user?.username ? t('you') : viewedUsername}
        </div>
        <div className="flex gap-[clamp(5px,0.3vw,8px)] items-center text-white">
          <div className="w-[clamp(9px,0.5vw,12px)] aspect-square rounded-full bg-[#5d6b2f52] border border-white"></div>
          {t('opponent')}
        </div>
      </div>
    </div>
  );
}
