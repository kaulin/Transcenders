import { ApiClient } from '@transcenders/api-client';
import { User } from '@transcenders/contracts';

import { useAvatarTransform } from '../hooks/useAvatarTransform';
import FriendActions from './FriendActions';

interface UserProfileProps {
  user: User | null;
  viewedUser: User | null;
}

export default function UserProfile({ user, viewedUser }: UserProfileProps) {
  const { getTransformFromUrl } = useAvatarTransform();
  return (
    <div className="flex flex-col items-center">
      <div className="bubble bg-white/50 w-[clamp(126px,16.5vh,224px)] h-[clamp(126px,16.5vh,224px)] flex justify-center overflow-hidden">
        {viewedUser?.avatar ? (
          <img
            src={ApiClient.user.getFullAvatarURL(viewedUser.avatar)}
            alt={`${viewedUser.username} avatar`}
            className={getTransformFromUrl(viewedUser.avatar)}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
      </div>
      <div className="flex pt-[clamp(13px,1.8vh,24px)] gap-[clamp(9px,0.63vw,16px)]">
        <h1 className="text-fluid-3xl text-[#fff] font-fascinate">{viewedUser?.username}</h1>
        {user !== viewedUser && <FriendActions userId={user?.id} viewedId={viewedUser?.id} />}
      </div>
    </div>
  );
}
