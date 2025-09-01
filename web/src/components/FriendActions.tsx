import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HeartPlus, HeartMinus, Heart } from 'lucide-react';

import { ApiClient } from '@transcenders/api-client';

interface FriendActionsProps {
  userId: number | undefined;
  viewedId: number | undefined;
}

export default function FriendActions({ userId, viewedId }: FriendActionsProps) {
  const { t } = useTranslation();

  const [friendshipStatus, setFriendshipStatus] = useState<
    'friends' | 'request_sent' | 'request_received' | 'none'
  >('none');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function verifyFriendshipStatus() {
      if (!userId || viewedId === undefined) return;

      setError(null);

      try {
        const friendship = await ApiClient.user.getRelationshipStatus(userId, viewedId);
        setFriendshipStatus(friendship.status);
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }

    verifyFriendshipStatus();
  }, [userId, viewedId, t]);

  const handleAdd = async () => {
    if (!userId || viewedId === undefined) return;

    setError(null);

    try {
      await ApiClient.user.sendFriendRequest(userId, viewedId);
      setFriendshipStatus('request_sent');
    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  };

  const handleRemove = async () => {
    if (!userId || viewedId === undefined) return;

    setError(null);

    try {
      await ApiClient.user.removeFriend(userId, viewedId);
      setFriendshipStatus('none');
    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  };

  if (userId === viewedId) return;
  
  return (
    <>
      {friendshipStatus === 'friends' ? (
        <button onClick={handleRemove} className="text-center pt-2 relative group">
          <HeartMinus className="w-6 h-6" />
          <span className="absolute bottom-2/3 left-2/3 hidden group-hover:block bg-[#6e5d41]/10 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {t('remove_friend')}
          </span>
        </button>
      ) : (
        <button
          onClick={handleAdd}
          disabled={friendshipStatus === 'request_sent' || friendshipStatus === 'request_received'}
          className="text-center pt-2 relative group"
        >
          {friendshipStatus === 'none' ? (
            <HeartPlus className="w-6 h-6" />
          ) : (
            <Heart className="w-6 h-6 text-white/50" />
          )}

          <span className="absolute bottom-2/3 left-2/3 hidden group-hover:block bg-[#6e5d41]/10 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {friendshipStatus === 'request_sent'
              ? t('friend_request_sent')
              : friendshipStatus === 'request_received'
                ? t('friend_request_received')
                : t('add_friend')}
          </span>
        </button>
      )}

      {error && <div className="tsc-error-message text-center">{error}</div>}
    </>
  );
}
