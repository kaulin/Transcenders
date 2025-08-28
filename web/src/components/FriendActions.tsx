import { HeartMinus, HeartOff, HeartPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useUser } from '../hooks/useUser';
import { ApiClient } from '@transcenders/api-client';

type FriendActionsProps = {
  viewedId: number | undefined;
};

export default function FriendActions({viewedId}: FriendActionsProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  
  const [friendshipStatus, setFriendshipStatus] = useState<boolean>(false);
  const [requestStatus, setRequestStatus] = useState<"idle" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {    
      async function verifyFriendshipStatus() {
        if (!user?.id || !viewedId)
        return;
      
      const friendship = await ApiClient.user.checkFriendshipExists(user?.id, viewedId);
      setFriendshipStatus(friendship.success);
    };
    
    verifyFriendshipStatus();
  }, [viewedId]);
  
  const handleAdd = async () => {
    if (!user?.id || !viewedId)
    return;
  
    setError(null);
  
    try {
      await ApiClient.user.sendFriendRequest(user.id, viewedId);
      setRequestStatus("sent");
      
      // setTimeout(() => setRequestStatus("pending"), 1000);
      
    } catch (err: any) {
      setError(err?.localeKey || 'something_went_wrong');
    }
  }
  
  // const handleCancel = async () => {
  //   setError(null);
    
  //   try {
  //     await ApiClient.user.declineFriendRequest(12, 1);
  //     setStatus("idle");
      
  //   } catch (err: any) {
  //     setError(err.localeKey || 'something_went_wrong');
  //   }
  // }
  
  return (
    <div className="flex flex-col h-[500px] justify-start p-10">
      {requestStatus === 'idle' && (
        <button
          onClick={handleAdd}
          className="rounded-button bg-white/5 flex gap-3 min-w-48 justify-start mt-4"
        >
          <HeartPlus className="text-[#786647]" />
          {t('add_friend')}
        </button>
      )}

      {requestStatus === 'sent' && (
        <button
          disabled
          className="rounded-button bg-white/5 flex gap-3 min-w-48 justify-start mt-4 cursor-not-allowed"
        >
          Friend Request Sent
        </button>
      )}

      {/* {requestStatus === 'pending' && (
        <button
          onClick={handleCancel}
          className="rounded-button bg-white/5 flex gap-3 min-w-48 justify-start mt-4"
        >
          Cancel Request
        </button>
      )} */}

      {error && <div className="tsc-error-message text-center">{error}</div>}
    </div>
  );
};
