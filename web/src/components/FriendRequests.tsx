import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';

import { ApiClient } from '@transcenders/api-client';
import type { FriendRequestsData } from '@transcenders/contracts';

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

  useEffect(() => {
    async function fetchRequests() {
      if (!userId) return;

      setError(null);

      try {
        const [sent, received] = await Promise.all([
          ApiClient.user.getOutgoingFriendRequests(userId),
          ApiClient.user.getIncomingFriendRequests(userId),
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
            ApiClient.user
              .getUserById(id)
              .then((u) => [id, u.username] as const)
              .catch(() => [id, `User#${id}`] as const),
          ),
        );

        setUsernames(Object.fromEntries(users));
      } catch (err: any) {
        setError(t(err.localeKey ?? 'something_went_wrong'));
      }
    }

    fetchRequests();
  }, [userId, setIncomingCount, t]);

  const handleAccept = async (initiatorId: number) => {
    if (!userId) return;

    setError(null);

    try {
      await ApiClient.user.acceptFriendRequest(userId, initiatorId);

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
      await ApiClient.user.declineFriendRequest(userId, initiatorId);

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
      await ApiClient.user.declineFriendRequest(recipientId, userId);

      setSentRequests((prev) => prev.filter((req) => req.recipient_id !== recipientId));
    } catch (err: any) {
      setError(t(err.localeKey ?? 'something_went_wrong'));
    }
  };

  return (
    <div className="w-80 h-[400px] bg-[#6e5d41]/5 rounded-lg p-6">
      <p className="text-[#fff] text-center font-fascinate uppercase text-xl mb-6">
        {t('friend_requests')}
      </p>

      <div className="relative h-[80%] px-2 overflow-y-auto custom-scrollbar">
        {error ? (
          <p className="tsc-error-message text-center">{error}</p>
        ) : (
          <>
            <p className="text-white mb-2 text-sm uppercase">
              {t('received')} ({receivedRequests.length ?? 0})
            </p>
            {receivedRequests.map((req) => (
              <div className="w-full flex justify-between text-[#fff]">
                <div key={req.id} className="text-white">
                  {usernames[req.initiator_id]}
                </div>
                <div>
                  <button onClick={() => handleDecline(req.initiator_id)}>
                    <X className="h-4 text-amber-600 hover:text-amber-700" />
                  </button>
                  <button onClick={() => handleAccept(req.initiator_id)}>
                    <Check className="h-4 text-lime-200 hover:text-lime-500" />
                  </button>
                </div>
              </div>
            ))}

            <p className="text-white mt-4 mb-2 text-sm uppercase">
              {t('sent')} ({sentRequests.length ?? 0})
            </p>
            {sentRequests.map((req) => (
              <div className="w-full flex justify-between text-[#fff]">
                <div key={req.id} className="text-white">
                  {usernames[req.recipient_id]}
                </div>
                <button
                  onClick={() => handleCancel(req.recipient_id)}
                  className="text-xs lowercase"
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
