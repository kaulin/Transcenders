import { ApiClient } from "@transcenders/api-client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Stats } from "@transcenders/contracts";

type UserStatsProps = {
  userId: number | undefined;
};

export default function UserStats({userId}: UserStatsProps) {
  const { t } = useTranslation();
  
  const [userStats, setUserStats] = useState<Stats | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) return;

    setError(null);

    ApiClient.score
      .getStatsForUser(userId)
      .then(setUserStats)
      .catch(() => setError(t('something_went_wrong')));
  }, [userId, t]);
  
  return (
    <div className="flex flex-col font-fascinate uppercase text-center">
      <p className="text-xl sm:text-2xl text-[#fff] mb-2">{t('games_played')}</p>
      <div className="flex justify-between text-sm sm:text-base">
        <p>{t('total')}</p>
        <p className="font-sans">{userStats?.total_games ?? 0}</p>
      </div>
      <div className="flex justify-between text-sm sm:text-base">
        <p>{t('wins')}</p>
        <p className="font-sans">{userStats?.total_wins ?? 0}</p>
      </div>
      <div className="flex justify-between text-sm sm:text-base">
        <p>{t('losses')}</p>
        <p className="font-sans">{(userStats?.total_games ?? 0) - (userStats?.total_wins ?? 0)}</p>
      </div>
    </div>
  );
};
