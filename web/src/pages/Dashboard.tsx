import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquareHeart } from 'lucide-react';

import { useUser } from '../hooks/useUser';
import { ApiClient } from '@transcenders/api-client';
import type { User } from '@transcenders/contracts';

import ProfileSection from '../components/ProfileSection';
import FriendsList from '../components/FriendsList';
import FriendRequests from '../components/FriendRequests';
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
  const [friendView, setFriendView] = useState<'friends' | 'requests'>('friends');
  const [incomingCount, setIncomingCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIncoming() {
      if (!user?.id)
        return;
      
      setError(null);
      
      try {
        const incoming = await ApiClient.user.getIncomingFriendRequests(user.id);
        setIncomingCount(incoming.length);
        
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }
    
    fetchIncoming();
  }, [user?.id]);
  
  const handleSearch = async () => {
    setError(null);

    if (!searchedUser?.trim())
      return;

    try {
      const user = await ApiClient.user.getUserExact({ username: searchedUser });
      setViewedUser(user);

    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  };

  const toggleFriends = () => {
    setFriendView((prev) => prev === 'friends' ? 'requests' : 'friends')
  }
  
  return (
    <div className="box xl:gap-4">
      <div className="box-section bg-[#6e5d41]/10 justify-between">
        <ProfileSection user={viewedUser} />

        <div className="w-full flex flex-col items-center justify-center gap-6">
          {user?.id === viewedUser?.id ? (
            <>
              {friendView === 'friends' && <FriendsList userId={viewedUser?.id} />}
              {friendView === 'requests' && <FriendRequests
                userId={user?.id}
                onIncomingCountChange={setIncomingCount}
                />
              }
              <button
                onClick={toggleFriends}
                className="w-80 bg-[#6e5d41]/5 rounded-lg p-2 flex items-center justify-center gap-2 text-sm uppercase"
              >
                {friendView === 'friends' ? (
                  <>
                    <span>{t('friend_requests')}</span>
                    {incomingCount > 0 && (
                      <MessageSquareHeart className="h-5 text-[#daf98cd5]" />
                    )}
                  </>
                ) : (
                  <>
                    <span>{t('friends')}</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <FriendActions userId={user?.id} viewedId={viewedUser?.id} />
          )}
        </div>

        <SearchSection
          searchedUser={searchedUser}
          setSearchedUser={setSearchedUser}
          handleSearch={handleSearch}
          error={error}
        />
      </div>

      <div className="box-section bg-[#6e5d41]/10 justify-between gap-12">
        <div className="flex flex-col text-center">
          <p className="w-[300px] text-xl sm:text-2xl font-fascinate uppercase text-[#fff] mb-2">
            {t('games_played')}
          </p>
          <UserStatsSection userId={viewedUser?.id} />
        </div>
        <PieChartSection userId={viewedUser?.id} />

        <div className="w-full">
          <p className="text-center text-[#fff] font-fascinate text-xl uppercase">
            {t('latest_outcomes')}
          </p>
          <GoalChart userId={viewedUser?.id} />
        </div>
      </div>

      <div className="box-section bg-[#6e5d41]/10 justify-between">
        <p className="text-[#fff] text-center text-2xl font-fascinate uppercase">{t('history')}</p>
        <div className="relative w-80 h-[823px] bg-[#6e5d41]/5 rounded-lg px-4 py-14 overflow-y-auto custom-scrollbar">
          <MatchHistory userId={viewedUser?.id} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
