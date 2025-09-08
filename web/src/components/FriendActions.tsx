import { Heart, HeartMinus, HeartPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiClient } from '@transcenders/api-client';
import { useApiClient } from '../hooks/useApiClient';

interface FriendActionsProps {
  userId: number | undefined;
  viewedId: number | undefined;
}

export default function FriendActions({ userId, viewedId }: FriendActionsProps) {
  const { t } = useTranslation();
  const api = useApiClient();

  const [friendshipStatus, setFriendshipStatus] = useState<
    'friends' | 'request_sent' | 'request_received' | 'none'
  >('none');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyFriendshipStatus() {
      if (!userId || viewedId === undefined) return;

      setError(null);

      try {
        const friendship = await api(() => ApiClient.user.getRelationshipStatus(userId, viewedId));
        setFriendshipStatus(friendship.status);
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }

    verifyFriendshipStatus();
  }, [userId, viewedId, t, api]);

  const handleAdd = async () => {
    if (!userId || viewedId === undefined) return;

    setError(null);

    try {
      await api(() => ApiClient.user.sendFriendRequest(userId, viewedId));
      setFriendshipStatus('request_sent');
    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  };

  const handleRemove = async () => {
    if (!userId || viewedId === undefined) return;

    setError(null);

    try {
      await api(() => ApiClient.user.removeFriend(userId, viewedId));
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
          <HeartMinus className="h-[clamp(16px,1.84vh,24px)] aspect-square" />
          <span className="absolute bottom-2/3 left-2/3 hidden group-hover:block bg-[#6e5d41]/10 text-white text-xs rounded py-[0.25em] px-[0.5em] whitespace-nowrap">
            {t('remove_friend')}
          </span>
        </button>
      ) : (
        <button
          onClick={handleAdd}
          disabled={friendshipStatus === 'request_sent' || friendshipStatus === 'request_received'}
          className="text-center pt-[clamp(5px,0.6vh,8px)] relative group"
        >
          {friendshipStatus === 'none' ? (
            <HeartPlus className="h-[clamp(16px,1.84vh,24px)] aspect-square" />
          ) : (
            <Heart className="h-[clamp(16px,1.84vh,24px)] aspect-square text-white/50" />
          )}

          <span className="absolute hidden button-label bottom-2/3 left-2/3">
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
