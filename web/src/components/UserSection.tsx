import { MessageSquareHeart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiClient } from '@transcenders/api-client';
import type { User } from '@transcenders/contracts';
import { useUser } from '../hooks/useUser';

import UserProfile from './UserProfile';
import FriendsList from './FriendsList';
import FriendRequests from './FriendRequests';
import FriendActions from './FriendActions';
import UserSearch from './UserSearch';

type UserSectionProps = {
  viewedUser: User | null;
  setViewedUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export default function UserSection({ viewedUser, setViewedUser }: UserSectionProps) {
  const { t } = useTranslation();
  const { user } = useUser();

  const [searchedUser, setSearchedUser] = useState<string>('');
  const [friendView, setFriendView] = useState<'friends' | 'requests'>('friends');
  const [incomingCount, setIncomingCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIncoming() {
      if (!user?.id) return;

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
    if (!searchedUser?.trim()) return;
    
    setError(null);

    try {
      const user = await ApiClient.user.getUserExact({ username: searchedUser });
      setViewedUser(user);
    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  };

  const toggleFriendView = () => {
    setFriendView((prev) => (prev === 'friends' ? 'requests' : 'friends'));
  };

  return (
    <>
      <UserProfile user={viewedUser} />

      <div className="w-full flex flex-col items-center justify-center gap-6">
        {user?.id === viewedUser?.id ? (
          <>
            {friendView === 'friends' && <FriendsList userId={viewedUser?.id} />}
            {friendView === 'requests' &&  <FriendRequests userId={user?.id} setIncomingCount={setIncomingCount} />}
            
            <button
              onClick={toggleFriendView}
              className="w-80 bg-[#6e5d41]/5 rounded-lg p-2 flex items-center justify-center gap-2 text-sm uppercase"
            >
              {friendView === 'friends' ? (
                <>
                  <span>{t('friend_requests')}</span>
                  {incomingCount > 0 && <MessageSquareHeart className="h-5 text-[#daf98cd5]" />}
                </>
              ) : (
                <span>{t('friends')}</span>
              )}
            </button>
          </>
        ) : (
          <FriendActions userId={user?.id} viewedId={viewedUser?.id} />
        )}
      </div>

      <UserSearch
        searchedUser={searchedUser}
        setSearchedUser={setSearchedUser}
        handleSearch={handleSearch}
        error={error}
      />
    </>
  );
}
