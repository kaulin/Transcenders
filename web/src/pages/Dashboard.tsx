import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { User } from '@transcenders/contracts';
import { useUser } from '../hooks/useUser';

import UserSection from '../components/UserSection';
import UserStatsSection from '../components/UserStatsSection';
import UserHistorySection from '../components/UserHistorySection';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useUser();

  const [viewedUser, setViewedUser] = useState<User | null>(user);

  return (
    <div className="box lg:gap-[clamp(9px,0.63vw,16px)]">
      <div className="box-section bg-[#6e5d41]/10 justify-between">
        <UserSection viewedUser={viewedUser} setViewedUser={setViewedUser} />
      </div>
      <div className="box-section bg-[#6e5d41]/10 justify-between">
        <UserStatsSection viewedId={viewedUser?.id} viewedUsername={viewedUser?.username} />
      </div>
      <div className="box-section bg-[#6e5d41]/10 justify-between">
        <UserHistorySection viewedId={viewedUser?.id} />
      </div>
    </div>
  );
};

export default Dashboard;
