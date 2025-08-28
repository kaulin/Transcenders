import { HeartMinus, HeartOff, HeartPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

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

  return (
    <div className="flex flex-col h-[500px] justify-start p-10">
      {friendshipStatus === 'friends' ? (
        <button
          onClick={handleRemove}
          className="rounded-button bg-white/5 text-center min-w-48 mt-4"
        >
          {t('remove_friend')}
        </button>
      ) : (
        <button
          onClick={handleAdd}
          disabled={friendshipStatus === 'request_sent' || friendshipStatus === 'request_received'}
          className="rounded-button bg-white/5 text-center min-w-48 mt-4"
        >
          {friendshipStatus === 'request_sent'
            ? t('friend_request_sent')
            : friendshipStatus === 'request_received'
              ? t('friend_request_received')
              : t('add_friend')}
        </button>
      )}

      {error && <div className="tsc-error-message text-center">{error}</div>}
    </div>
  );
}
