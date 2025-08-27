import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUser } from '../hooks/useUser';
import { ApiClient } from '@transcenders/api-client';
import type { User } from '@transcenders/contracts';

import ProfileSection from '../components/ProfileSection';
import FriendsList from '../components/FriendsList';
import FriendActions from '../components/FriendActions';
import SearchSection from '../components/SearchSection';
import UserStatsSection from '../components/UserStatsSection';
import GoalChart from '../components/GoalChart';
import MatchHistory from '../components/MatchHistory';
import PieChartSection from '../components/PieChartSection';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useUser();

  const [viewedUser, setViewedUser] = useState<User | null>(user);
  const [searchedUser, setSearchedUser] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setError(null);

    if (!searchedUser?.trim())
      return;

    try {
      const user = await ApiClient.user.getUserExact({ username: searchedUser });
      setViewedUser(user);

    } catch (err: any) {
      setError(t(err.localeKey) || t('something_went_wrong'));
    }
  };

  return (
    <div className="box xl:gap-4">
      <div className="box-section bg-[#6e5d41]/10 justify-between">
        <ProfileSection user={viewedUser} />

        <div className="w-full flex flex-col items-center justify-center gap-6">
          {user?.id === viewedUser?.id ? (
            <FriendsList userId={viewedUser?.id} />
          ) : (
            <FriendActions viewedId={viewedUser?.id} />
          )}
        </div>

        <SearchSection
          searchedUser={searchedUser}
          setSearchedUser={setSearchedUser}
          handleSearch={handleSearch}
          error={error}
        />
      </div>

      <div className="box-section bg-[#6e5d41]/10 justify-between gap-24">
        <UserStatsSection userId={viewedUser?.id} />
        <PieChartSection userId={viewedUser?.id} />

        <div className="flex flex-col items-center w-full">
          <p className="text-center text-[#fff] font-fascinate text-xl uppercase">
            {t('latest_outcomes')}
          </p>
          <GoalChart userId={viewedUser?.id} />
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 items-center text-white">
              <div className="w-4 h-4 rounded-full bg-[#a7d4373c] border border-white"></div>
              {t('you')}
            </div>
            <div className="flex gap-2 items-center text-white">
              <div className="w-4 h-4 rounded-full bg-[#5d6b2f52] border border-white"></div>
              {t('opponent')}
            </div>
          </div>
        </div>
      </div>

      <div className="box-section bg-[#6e5d41]/10 justify-between">
        <p className="text-[#fff] text-center text-2xl font-fascinate uppercase">{t('history')}</p>
        <div className="relative w-80 h-[823px] bg-[#6e5d41]/5 rounded-lg px-4 py-10 overflow-y-auto custom-scrollbar">
          <MatchHistory userId={viewedUser?.id} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
