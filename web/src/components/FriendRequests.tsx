import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiClient } from '@transcenders/api-client';
import type { FriendRequestsData } from '@transcenders/contracts';
import { useApiClient } from '../hooks/useApiClient';

interface FriendRequestsProps {
  userId: number | undefined;
  setIncomingCount: React.Dispatch<React.SetStateAction<number>>;
}

export default function FriendRequests({ userId, setIncomingCount }: FriendRequestsProps) {
  const { t } = useTranslation();

  const [receivedRequests, setReceivedRequests] = useState<FriendRequestsData[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestsData[]>([]);
  const [usernames, setUsernames] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();

  useEffect(() => {
    async function fetchRequests() {
      if (!userId) return;

      setError(null);

      try {
        const [sent, received] = await Promise.all([
          api(() => ApiClient.user.getOutgoingFriendRequests(userId)),
          api(() => ApiClient.user.getIncomingFriendRequests(userId)),
        ]);

        setSentRequests(sent);
        setReceivedRequests(received);
        setIncomingCount(received.length);

        const ids = [
          ...new Set([
            ...sent.map((req) => req.recipient_id),
            ...received.map((req) => req.initiator_id),
          ]),
        ];

        const users = await Promise.all(
          ids.map((id) =>
            api(() =>
              ApiClient.user
                .getUserById(id)
                .then((u) => [id, u.username] as const)
                .catch(() => [id, `User#${id}`] as const),
            ),
          ),
        );

        setUsernames(Object.fromEntries(users));
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }

    fetchRequests();
  }, [userId, setIncomingCount, t, api]);

  const handleAccept = async (initiatorId: number) => {
    if (!userId) return;

    setError(null);

    try {
      await api(() => ApiClient.user.acceptFriendRequest(userId, initiatorId));

      setReceivedRequests((prev) => prev.filter((req) => req.initiator_id !== initiatorId));
      setIncomingCount((prev) => prev - 1);
    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  };

  const handleDecline = async (initiatorId: number) => {
    if (!userId) return;

    setError(null);

    try {
      await api(() => ApiClient.user.declineFriendRequest(userId, initiatorId));

      setReceivedRequests((prev) => prev.filter((req) => req.initiator_id !== initiatorId));
      setIncomingCount((prev) => prev - 1);
    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  };

  const handleCancel = async (recipientId: number) => {
    if (!userId) return;

    setError(null);

    try {
      await api(() => ApiClient.user.declineFriendRequest(recipientId, userId));

      setSentRequests((prev) => prev.filter((req) => req.recipient_id !== recipientId));
    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  };

  return (
    <div className="w-[55%] min-w-[180px] h-[clamp(229px,29.95vh,390px)] bg-[#6e5d41]/5 rounded-lg px-[clamp(13.5px,0.94vw,24px)] py-[clamp(13px,1.8vh,24px)]">
      <p className="text-[#fff] text-center font-fascinate uppercase text-fluid-sm mb-[clamp(13px,1.8vh,24px)]">
        {t('friend_requests')}
      </p>

      <div className="relative h-[80%] px-[clamp(4px,0.3vw,8px)] text-fluid-xs overflow-y-auto custom-scrollbar">
        {error ? (
          <p className="tsc-error-message text-center">{error}</p>
        ) : (
          <>
            <p className="text-white mb-[clamp(5px,0.6vh,8px)] text-fluid-xs uppercase">
              {t('received')} ({receivedRequests.length ?? 0})
            </p>
            {receivedRequests.map((req) => (
              <div key={req.id} className="w-full flex justify-between text-[#fff]">
                <div className="text-white">{usernames[req.initiator_id]}</div>
                <div className="flex gap-[clamp(9px,0.63vw,16px)]">
                  <button onClick={() => handleDecline(req.initiator_id)}>
                    <X className="h-[clamp(9px,1.2vh,16px)] w-[clamp(9px,1.2vh,16px)] text-amber-600 hover:text-amber-700" />
                  </button>
                  <button onClick={() => handleAccept(req.initiator_id)}>
                    <Check className="h-[clamp(9px,1.2vh,16px)] w-[clamp(9px,1.2vh,16px)] text-lime-200 hover:text-lime-500" />
                  </button>
                </div>
              </div>
            ))}

            <p className="text-white mt-[clamp(9px,1.2vh,16px)] mb-[clamp(5px,0.6vh,8px)] text-fluid-xs uppercase">
              {t('sent')} ({sentRequests.length ?? 0})
            </p>
            {sentRequests.map((req) => (
              <div key={req.id} className="w-full flex justify-between text-[#fff]">
                <div className="text-white">{usernames[req.recipient_id]}</div>
                <button
                  onClick={() => handleCancel(req.recipient_id)}
                  className="text-fluid-xs lowercase"
                >
                  {t('cancel')}
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
