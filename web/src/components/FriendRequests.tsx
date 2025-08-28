import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiClient } from '@transcenders/api-client';
import type { User } from '@transcenders/contracts';
import { Heart, HeartHandshake, MessageSquareHeart, MessageCircleHeart } from 'lucide-react';


export default function FriendRequests() {
  const { t } = useTranslation();

  return (
    <div className="w-80 h-[400px] bg-[#6e5d41]/5 rounded-lg p-6">
      
    </div>
  );
}
