import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiClient } from '@transcenders/api-client';
import type { User } from '@transcenders/contracts';
import { useApiClient } from '../hooks/useApiClient';

interface FriendsListProps {
  userId: number | undefined;
}

export default function FriendsList({ userId }: FriendsListProps) {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();

  useEffect(() => {
    async function fetchFriends() {
      if (!userId) return;

      setError(null);

      try {
        const friendsList = await api(() => ApiClient.user.getUserFriends(userId));
        setFriends(friendsList);
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }

    fetchFriends();
  }, [userId, t, api]);

  return (
    <div className="w-[55%] min-w-[180px] h-[clamp(229px,29.95vh,390px)] bg-[#6e5d41]/5 rounded-lg px-[clamp(13.5px,0.94vw,24px)] py-[clamp(13px,1.8vh,24px)]">
      <p className="text-[#fff] text-center font-fascinate uppercase text-fluid-sm mb-[clamp(13px,1.8vh,24px)]">
        {t('friends')}
      </p>
      <div className="relative h-[80%] px-[clamp(4px,0.3vw,8px)] text-fluid-xs overflow-y-auto custom-scrollbar">
        {error ? (
          <p className="tsc-error-message text-center">{error}</p>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between text-[#fff] py-[clamp(2.3px,0.3vh,4px)]"
            >
              <span>{friend.display_name ?? friend.username}</span>
              <span
                className={`w-[clamp(9px,0.5vw,12px)] aspect-square rounded-full border border-white ${
                  friend.status === 'online' ? 'bg-[#ceff5d]' : 'bg-transparent'
                }`}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
