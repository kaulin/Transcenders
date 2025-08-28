import { HeartMinus, HeartOff, HeartPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { ApiClient } from '@transcenders/api-client';

type FriendActionsProps = {
  userId: number | undefined
  viewedId: number | undefined;
};

export default function FriendActions({userId, viewedId}: FriendActionsProps) {
  const { t } = useTranslation();
  
  const [friendshipStatus, setFriendshipStatus] = useState<
    'friends' | 'request_sent' | 'request_received' | 'none'
  >('none');
  const [requestStatus, setRequestStatus] = useState<"sent" | "removed" | "none">("none");
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {    
    async function verifyFriendshipStatus() {
      if (!userId || !viewedId)
      return;
    
      try {
        const friendship = await ApiClient.user.getRelationshipStatus(userId, viewedId);
        setFriendshipStatus(friendship.status);

      } catch (err: any) {
        setError(err.localeKey || 'something_went_wrong');
      }
    };
    
    verifyFriendshipStatus();
  }, [viewedId, requestStatus]);
  
  const handleAdd = async () => {
    if (!userId || !viewedId)
    return;
  
    setError(null);
  
    try {
      await ApiClient.user.sendFriendRequest(userId, viewedId);
      setRequestStatus("sent");
      
    } catch (err: any) {
      setError(err?.localeKey || 'something_went_wrong');
    }
  }
  
  const handleRemove = async () => {
    if (!userId || !viewedId) return;

    setError(null);

    try {
      await ApiClient.user.removeFriend(userId, viewedId);
      setRequestStatus('removed');

    } catch (err: any) {
      setError(err?.localeKey || 'something_went_wrong');
    }
  }
  
  return (
    <div className="flex flex-col h-[500px] justify-start p-10">
      {friendshipStatus === 'friends' ? (
        <button
          onClick={handleRemove}
          className="rounded-button bg-white/5 flex gap-3 min-w-48 justify-start mt-4"
        >
          {t('remove_friend')}
        </button>
      ) : (
        <button
          onClick={handleAdd}
          disabled={friendshipStatus === 'request_sent' || friendshipStatus === 'request_received'}
          className="rounded-button bg-white/5 flex gap-3 min-w-48 justify-start mt-4"
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
};
