import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { ApiClient } from '@transcenders/api-client';
import { Score } from '@transcenders/contracts';

type GoalChartProps = {
  userId: number | undefined;  
}

export default function GoalChart({userId}: GoalChartProps) {
  const { t } = useTranslation();
  
  const [userScores, setUserScores] = useState<Score[] | undefined>();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) return;

    setError(null);

    ApiClient.score
      .getScoresForUser(userId)
      .then(setUserScores)
      .catch((err: any) => setError(err?.localeKey ?? 'something_went_wrong'));
  }, [userId, t]);

  const chartData = userScores
    ? [...userScores.slice(0, 10)].reverse().map((s) => ({
        scored: s.winner_id === userId ? s.winner_score : s.loser_score,
        conceded: s.winner_id === userId ? s.loser_score : s.winner_score,
        date: s.game_end
      }))
    : [];

  if (error) return <div className="tsc-error-message text-center">{t(error)}</div>;
  if (!userScores) return <div className="tsc-info-message text-center">{t('loading')}</div>;
  
  return (
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
  );
};

