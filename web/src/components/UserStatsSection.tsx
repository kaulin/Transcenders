import { ApiClient } from "@transcenders/api-client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Stats } from "@transcenders/contracts";
import StatRow from "./StatRow";

type UserStatsProps = {
  userId: number | undefined;
};

export default function UserStatsSection({userId}: UserStatsProps) {
  const { t } = useTranslation();
  
  const [userStats, setUserStats] = useState<Stats | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) return;

    setError(null);

    ApiClient.score
      .getStatsForUser(userId)
      .then(setUserStats)
      .catch((err: any) => setError(err?.localeKey ?? 'something_went_wrong'));
  }, [userId, t]);
  
  if (error) return <div className="tsc-error-message text-center">{t(error)}</div>;

  return (
    <>
      <StatRow label={t('total')} value={userStats?.total_games ?? 0} />
      <StatRow label={t('wins')} value={userStats?.total_wins ?? 0} />
      <StatRow
        label={t('losses')}
        value={(userStats?.total_games ?? 0) - (userStats?.total_wins ?? 0)}
      />
      <StatRow label={t('average_score')} value={(userStats?.average_score ?? 0).toFixed(1)} />
      <StatRow label={t('win_percentage')} value={(userStats?.total_win_percentage ?? 0).toFixed(1)} />
    </>
  );
};
