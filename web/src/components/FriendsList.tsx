import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiClient } from '@transcenders/api-client';
import type { User } from '@transcenders/contracts';

interface FriendsListProps {
  userId: number | undefined;
}

export default function FriendsList({ userId }: FriendsListProps) {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFriends() {
      if (!userId) return;

      setError(null);

      try {
        const friendsList = await ApiClient.user.getUserFriends(userId);
        setFriends(friendsList);
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }

    fetchFriends();
  }, [userId, t]);

  return (
    <div className="w-80 h-[400px] bg-[#6e5d41]/5 rounded-lg p-6">
      <p className="text-[#fff] text-center font-fascinate uppercase text-xl mb-6">
        {t('friends')}
      </p>
      <div className="relative h-[80%] px-2 text-sm sm:text-base overflow-y-auto custom-scrollbar">
        {error ? (
          <p className="tsc-error-message text-center">{error}</p>
        ) : (
          friends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between text-[#fff] py-1">
              <span>{friend.display_name ?? friend.username}</span>
              <span
                className={`w-3 h-3 rounded-full border border-white ${
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
