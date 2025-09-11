import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ApiClient } from '@transcenders/api-client';
import type { Stats } from '@transcenders/contracts';
import { useApiClient } from '../hooks/useApiClient';

const COLORS = ['#a7d4373c', '#8198453c'];

interface PieChartsProps {
  viewedId: number | undefined;
}

interface PieData {
  name: string;
  value?: number;
}

interface ChartConfig {
  title: string;
  data: PieData[];
}

function PieChartBlock({ title, data }: ChartConfig) {
  const { t } = useTranslation();
  const hasData = data.some((d) => (d.value ?? 0) > 0);

  return (
    <div className="flex flex-col sm:flex-row w-full items-center justify-between">
      <div className="flex flex-col items-center sm:items-start">
        <div className="text-white text-center text-fluid-sm font-fascinate uppercase">
          {title}
        </div>
        {data.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-[clamp(5px,0.3vw,8px)]"
          >
            <span
              className="inline-block w-[clamp(9px,0.5vw,12px)] aspect-square rounded-full border border-white"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-white text-fluid-sm">{entry.name}</span>
          </div>
        ))}
      </div>

      <div className="w-[clamp(56px,7.3vh,96px)] h-[clamp(56px,7.3vh,96px)] flex flex-shrink-0">
        {!hasData ? (
          <div className="flex h-full justify-center items-center text-center">
            <p className="tsc-info-message text-fluid-xs">{t('not_available')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="90%"
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
        )}
      </div>
    </div>
  );
}

export default function PieCharts({ viewedId }: PieChartsProps) {
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

  const chartsData: ChartConfig[] = useMemo(() => {
    if (!userStats) return [];

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
          {
            name: t('losses'),
            value: (userStats?.regular_games ?? 0) - (userStats?.regular_game_wins ?? 0),
          },
        ],
      },
      {
        title: t('tournament'),
        data: [
          { name: t('wins'), value: userStats?.tournament_wins },
          {
            name: t('losses'),
            value: (userStats?.tournaments_joined ?? 0) - (userStats?.tournament_wins ?? 0),
          },
        ],
      },
    ];
  }, [userStats, t]);

  if (error)
    return (
      <div className="tsc-error-message text-center text-fluid-xs">{t(error)}</div>
    );
  if (!userStats)
    return (
      <div className="tsc-info-message text-center text-fluid-xs">
        {t('loading')}
      </div>
    );

  return (
    <div className="flex flex-col justify-between w-[55%] min-w-[180px] gap-[clamp(16px,2.1vh,27px)]">
      {chartsData.map((chart, i) => (
        <PieChartBlock key={i} title={chart.title} data={chart.data} />
      ))}
    </div>
  );
}
