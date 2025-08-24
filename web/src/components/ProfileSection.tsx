import { ApiClient } from "@transcenders/api-client";
import { User } from "@transcenders/contracts";

type ProfileSectionProps = {
  user: User | null;
};

const ProfileSection = ({ user }: ProfileSectionProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="bubble bg-white/50 w-56 h-56 flex items-end justify-center overflow-hidden">
        {user?.avatar ? (
          <img
            src={ApiClient.user.getFullAvatarURL(user.avatar)}
            alt={`${user.username} avatar`}
            className="object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
      </div>
      <h1 className="pt-6 text-5xl text-[#fff] font-fascinate">{user?.username}</h1>
    </div>
  );
};

export default ProfileSection;