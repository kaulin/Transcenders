import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ApiClient } from "@transcenders/api-client";
import { Score } from "@transcenders/contracts";
import { useUser } from "../hooks/useUser";

type MatchHistoryProps = {
  userId: number | undefined;
};

export default function MatchHistory({userId}: MatchHistoryProps) {
  const { t } = useTranslation();
  const { user } = useUser();

  const [userScores, setUserScores] = useState<Score[] | undefined>();
  const [usernames, setUsernames] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) return;

    setError(null);

    ApiClient.score
      .getScoresForUser(userId)
      .then(async (scores) => {
        setUserScores(scores);

        const ids = [...new Set(scores.flatMap((s) => [s.winner_id, s.loser_id]))];

        const users = await Promise.all(
          ids.map((id) =>
            ApiClient.user
              .getUserById(id)
              .then((u) => [id, u.username] as const)
              .catch(() => [id, `User#${id}`] as const),
          ),
        );

        setUsernames(Object.fromEntries(users));
      })
      .catch((err: any) => setError(err?.localeKey ?? 'something_went_wrong'));
  }, [userId, t]);
  
  if (error) return <div className="tsc-error-message text-center">{t(error)}</div>;
  if (!userScores) return <div className="tsc-info-message text-center">{t('loading')}</div>;
  if (userScores.length === 0) return <div className="tsc-info-message text-center">{t('not_available')}</div>;
  
  return (
    <div className="relative h-full w-full px-2 overflow-y-auto custom-scrollbar flex flex-col gap-12">
      {userScores?.map(({ winner_id, loser_id, winner_score, loser_score }) => (
        <div className="flex flex-col justify-center items-center">
          <div className="w-full flex justify-between text-[#fff] ">
            <div className="font-fascinate uppercase text-xl">
              {winner_id === user?.id ? 'win' : 'loss'}
            </div>
            <div className="text-[#fff]">26/08</div>
          </div>
          <div className="w-full flex justify-between items-center text-[#fff]">
            <div>{usernames[winner_id] ?? t('loading')}</div>
            <div>{winner_score}</div>
          </div>
          <div className="w-full flex justify-between items-center text-[#fff]">
            <div>{usernames[loser_id] ?? t('loading')}</div>
            <div>{loser_score}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
