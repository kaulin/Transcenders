import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { ApiClient } from '@transcenders/api-client';
import type { Stats } from '@transcenders/contracts';
import { useEffect, useState, useMemo } from 'react';

const COLORS = ['#a7d4373c', '#8198453c', '#8c986d25', '#f3f4f000'];

type PieChartsProps = {
  userId: number | undefined;
};

type PieData = {
  name: string;
  value?: number;
};

type ChartConfig = {
  title: string;
  data: PieData[];
};

function PieChartBlock({ title, data}: ChartConfig) {
  const { t } = useTranslation();
  const hasData = data.some((d) => (d.value ?? 0) > 0);
  
  if (!hasData) {
    return (
      <div className="flex flex-col h-36 mt-6 sm:mt-0 sm:flex-row w-full items-center justify-between text-md">
        <div className="flex flex-col items-center sm:items-start">
          <div className="text-white text-center text-lg sm:text-xl font-fascinate uppercase">
            {title}
          </div>
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-4 h-4 rounded-full border border-white"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm sm:text-base">{entry.name}</span>
            </div>
          ))}
        </div>

        <div className="w-40 text-center">
          <p className="tsc-info-message">{t('not_available')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col mt-6 sm:mt-0 sm:flex-row w-full items-center justify-between text-md">
      <div className="flex flex-col items-center sm:items-start">
        <div className="text-white text-center text-lg sm:text-xl font-fascinate uppercase">{title}</div>
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-4 h-4 rounded-full border border-white"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm sm:text-base">{entry.name}</span>
          </div>
        ))}
      </div>

      <div className="w-40 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="70%"
              cy="50%"
              innerRadius={20}
              outerRadius={45}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function PieChartSection({userId}: PieChartsProps) {
  const { t } = useTranslation();
  
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<Stats | undefined>(undefined);

  useEffect(() => {
    if (!userId)
      return;

    setError(null);

    ApiClient.score
      .getStatsForUser(userId)
      .then(setUserStats)
      .catch((err: any) => setError(err?.localeKey ?? 'something_went_wrong'));
  }, [userId, t]);

  const chartsData: ChartConfig[] = useMemo(() => {
    if (!userStats)
      return [];
    
      return [
        {
          title: t('mode'),
          data: [
            { name: t('tournament'), value: userStats?.tournaments_joined },
            { name: t('one_v_one'), value: userStats?.regular_games },
          ],
        },
        {
          title: t('one_v_one'),
          data: [
            { name: t('wins'), value: userStats?.regular_game_wins },
            { name: t('losses'), value: (userStats?.regular_games ?? 0) - (userStats?.regular_game_wins ?? 0) },
          ],
        },
        {
          title: t('tournament'),
          data: [
            { name: t('wins'), value: userStats?.tournament_wins },
            { name: t('losses'), value: (userStats?.tournaments_joined ?? 0) - (userStats?.tournament_wins ?? 0) },
          ],
        },
      ];
  }, [userStats, t]);
  
  if (error) return <div className="tsc-error-message text-center">{t(error)}</div>;
  if (!userStats) return <div className="tsc-info-message text-center">{t('loading')}</div>;
  
  return (
    <div className="flex flex-col w-full max-w-[400px]">
      {chartsData.map((chart, i) => (
        <PieChartBlock key={i} title={chart.title} data={chart.data} />
      ))}
    </div>
  );
};
