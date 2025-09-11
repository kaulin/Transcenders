import { MessageSquareHeart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiClient } from '@transcenders/api-client';
import type { User } from '@transcenders/contracts';
import { useUser } from '../hooks/useUser';

import { useApiClient } from '../hooks/useApiClient';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import UserProfile from './UserProfile';
import UserSearch from './UserSearch';

interface UserSectionProps {
  viewedUser: User | null;
  setViewedUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default function UserSection({ viewedUser, setViewedUser }: UserSectionProps) {
  const { t } = useTranslation();
  const { user } = useUser();

  const [searchedUser, setSearchedUser] = useState<string>('');
  const [friendView, setFriendView] = useState<'friends' | 'requests'>('friends');
  const [incomingCount, setIncomingCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();

  useEffect(() => {
    async function fetchIncoming() {
      if (!user?.id) return;

      setError(null);

      try {
        const incoming = await api(() => ApiClient.user.getIncomingFriendRequests(user.id));
        setIncomingCount(incoming.length);
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }

    fetchIncoming();
  }, [user?.id, t, api]);

  const handleSearch = async () => {
    if (!searchedUser?.trim()) return;

    setError(null);

    try {
      const user = await api(() => ApiClient.user.getUserExact({ username: searchedUser }));
      setViewedUser(user);
    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  };

  const toggleFriendView = () => {
    setFriendView((prev) => (prev === 'friends' ? 'requests' : 'friends'));
  };

  const handleGoBack = async () => {
    setViewedUser(user);
  };

  return (
    <>
      <UserProfile user={user} viewedUser={viewedUser} />

      <div className="w-full flex flex-col items-center justify-center gap-[clamp(8px,1.8vh,24px)]">
        {user?.id === viewedUser?.id ? (
          <>
            {friendView === 'friends' && <FriendsList userId={viewedUser?.id} />}
            {friendView === 'requests' && (
              <FriendRequests userId={user?.id} setIncomingCount={setIncomingCount} />
            )}

            <button
              onClick={toggleFriendView}
              className="w-[55%] min-w-[180px] bg-[#6e5d41]/5 rounded-lg p-[0.5em] flex items-center justify-center gap-[clamp(4px,0.3vw,8px)] text-fluid-xs"
            >
              {friendView === 'friends' ? (
                <>
                  <span>{t('friend_requests')}</span>
                  {incomingCount > 0 && (
                    <MessageSquareHeart className="h-[clamp(11.5px,1.5vh,20px)] aspect-square text-[#daf98cd5]" />
                  )}
                </>
              ) : (
                <span>{t('friends')}</span>
              )}
            </button>
          </>
        ) : (
          <>
            <FriendsList userId={viewedUser?.id} />
          </>
        )}
      </div>

      <UserSearch
        searchedUser={searchedUser}
        setSearchedUser={setSearchedUser}
        handleSearch={handleSearch}
        handleGoBack={handleGoBack}
        error={error}
        />
    </>
  );
}
