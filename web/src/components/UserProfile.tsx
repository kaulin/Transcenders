import { ApiClient } from '@transcenders/api-client';
import { User } from '@transcenders/contracts';

import FriendActions from './FriendActions';

interface UserProfileProps {
  user: User | null;
  viewedUser: User | null;
}

export default function UserProfile({ user, viewedUser }: UserProfileProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bubble bg-white/50 w-56 h-56 flex items-end justify-center overflow-hidden">
        {viewedUser?.avatar ? (
          <img
            src={ApiClient.user.getFullAvatarURL(viewedUser.avatar)}
            alt={`${viewedUser.username} avatar`}
            className="object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
      </div>
      <div className="flex pt-6 gap-4">
        <h1 className="text-5xl text-[#fff] font-fascinate">{viewedUser?.username}</h1>
        {user !== viewedUser && (<FriendActions userId={user?.id} viewedId={viewedUser?.id}/>)}
      </div>
    </div>
  );
}
