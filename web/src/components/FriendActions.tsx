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
  
  const [isFriend, setIsFriend] = useState<boolean>(false);
  
  useEffect(() => {    
      async function verifyFriendshipStatus() {
        if (!user?.id || !viewedId)
        return;
      
      const friendshipStatus = await ApiClient.user.checkFriendshipExists(user?.id, viewedId);
      setIsFriend(friendshipStatus.success);
    };
    
    verifyFriendshipStatus();
  }, [viewedId]);
  
  return (    
      <div className="flex flex-col h-[500px] justify-start p-10">
        {isFriend ? (
          <button className="rounded-button bg-white/5 flex gap-3 min-w-48 justify-start mt-4">
            <HeartMinus className="text-[#786647]" />
            {t('remove_friend')}
          </button>
        ) : (
          <button className="rounded-button bg-white/5 flex gap-3 min-w-48 justify-start mt-4">
            <HeartPlus className="text-[#786647]" />
            {t('add_friend')}
          </button>
        )}
      {/* <button className="rounded-button bg-white/5 flex gap-3 min-w-48 justify-start mt-4">
        <HeartOff className="text-[#786647]" />
        {t('block_user')}
      </button> */}
    </div>
    );
};
