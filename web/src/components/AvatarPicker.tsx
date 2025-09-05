// src/components/AvatarPicker.tsx
import { ApiClient } from '@transcenders/api-client';
import { AvatarConfig, DefaultAvatar, RandomAvatar, ServiceError } from '@transcenders/contracts';
import { ChevronLeft, ChevronRight, Dice5, Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApiClient } from '../hooks/useApiClient';
import { useAvatarTransform } from '../hooks/useAvatarTransform';
import { useTokenElevation } from '../hooks/useTokenElevation';
import { useUser } from '../hooks/useUser';
import LoadingSpinner from './LoadingSpinner';

interface AvatarPickerProps {
  className?: string;
}

export default function AvatarPicker({ className }: AvatarPickerProps) {
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  const { isElevated } = useTokenElevation();
  const { getTransformFromUrl } = useAvatarTransform();
  const [error, setError] = useState<string | null>(null);
  const api = useApiClient();

  // Default avatar setup
  const [avatars, setAvatars] = useState<DefaultAvatar[]>([]);
  const [loading, setLoading] = useState(true);

  // load defaults once
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { avatars } = await api(() => ApiClient.user.getDefaultAvatars());
        setAvatars(avatars);
      } catch (err) {
        if (err instanceof ServiceError) setError(t(err.localeKey ?? 'something_went_wrong'));
        else setError(t('something_went_wrong'));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentIdx = useMemo(() => {
    if (!user || avatars.length === 0) return -1;
    return avatars.findIndex((a) => a.url === user.avatar);
  }, [user, avatars]);

  const previewUrl = useMemo(() => {
    if (!user) return '';
    const defaultMatch = avatars[currentIdx];
    const url = defaultMatch ? defaultMatch.url : user.avatar;
    return ApiClient.user.getFullAvatarURL(url);
  }, [user, avatars, currentIdx]);

  const setDefaultByIndex = async (idx: number) => {
    setError(null);
    if (!user) return;
    try {
      const res = await api(() => ApiClient.user.setDefaultAvatar(user.id, avatars[idx].name));
      setUser((prev) => (prev ? { ...prev, avatar: res.url } : prev));
    } catch (err) {
      if (err instanceof ServiceError) setError(t(err.localeKey ?? 'something_went_wrong'));
      else setError(t('something_went_wrong'));
    }
  };

  const next = async () => {
    if (!user || avatars.length === 0) return;
    const idx = ((currentIdx ?? -1) + 1 + avatars.length) % avatars.length;
    await setDefaultByIndex(idx);
  };

  const prev = async () => {
    if (!user || avatars.length === 0) return;
    const idx = ((currentIdx ?? -1) - 1 + avatars.length) % avatars.length;
    await setDefaultByIndex(idx);
  };

  // Random cat picking and preloading

  const LOW_ON_CATS = 12;
  const BATCH_SIZE = 10;

  const [queue, setQueue] = useState<RandomAvatar[]>([]);
  const [randomBusy, setRandomBusy] = useState(false);
  const prefetchingRef = useRef(false);

  // Preload images to warm browser cache
  const preloadImages = useCallback(async (cats: RandomAvatar[]) => {
    await Promise.allSettled(
      cats.map(
        (c) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('preload failed'));
            img.src = c.url;
          }),
      ),
    );
  }, []);

  const fetchBatchAppend = useCallback(async () => {
    if (prefetchingRef.current) return;
    prefetchingRef.current = true;
    try {
      const cats = await api(() => ApiClient.user.getRandomCats({ limit: BATCH_SIZE }));
      await preloadImages(cats);
      setQueue((prev) => [...prev, ...cats]);
    } finally {
      prefetchingRef.current = false;
    }
  }, [preloadImages, api]);

  // Prime once
  useEffect(() => {
    if (queue.length === 0) {
      void fetchBatchAppend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maybePrefetch = useCallback(
    (futureLength: number) => {
      if (futureLength < LOW_ON_CATS && !prefetchingRef.current) {
        void fetchBatchAppend();
      }
    },
    [fetchBatchAppend],
  );

  const handleRandomCat = async () => {
    setError(null);
    if (!user) return;
    setRandomBusy(true);

    try {
      let picked: RandomAvatar | undefined;

      if (queue.length === 0) {
        const cats = await api(() => ApiClient.user.getRandomCats({ limit: BATCH_SIZE }));
        picked = cats[0];
        if (picked) {
          setQueue((prev) => [...prev, ...cats.slice(1)]);
          void preloadImages(cats.slice(1));
        }
      } else {
        // Normal case, should mostly go here
        picked = queue[0];
        setQueue((prev) => prev.slice(1));
        // Predict future length to decide topping up
        const futureLen = queue.length - 1;
        maybePrefetch(futureLen);
      }

      if (!picked) return;

      const updated = await api(() => ApiClient.user.setWebAvatar(user.id, picked.url));
      setUser(updated);
    } catch (err) {
      if (err instanceof ServiceError) setError(t(err.localeKey ?? 'something_went_wrong'));
      else setError(t('something_went_wrong'));
    } finally {
      setRandomBusy(false);
    }
  };

  // custom upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onUploadClick = () => {
    if (!isElevated) return;
    fileInputRef.current?.click();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    setError(null);
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('invalid_file_type'));
      return;
    }
    if (file.size > AvatarConfig.MAX_FILE_SIZE) {
      setError(t('file_too_large'));
      return;
    }

    try {
      setUploading(true);
      const res = await api(() => ApiClient.user.uploadAvatar(user.id, file));
      const cacheBusted = `${res.url}?t=${Date.now()}`;
      setUser((prev) => (prev ? { ...prev, avatar: cacheBusted } : prev));
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      if (err instanceof ServiceError) setError(t(err.localeKey ?? 'something_went_wrong'));
      else setError(t('something_went_wrong'));
    } finally {
      setUploading(false);
    }
  };

  // loading spinner handling for browser encoding etc
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [displayUrl, setDisplayUrl] = useState(previewUrl);
  const [displayClass, setDisplayClass] = useState(getTransformFromUrl(previewUrl));
  const [loadingNext, setLoadingNext] = useState(false);
  const imgLoading = uploading || loadingNext;

  useEffect(() => {
    if (!previewUrl || previewUrl === displayUrl) return;

    setLoadingNext(true);

    const img = new Image();
    img.src = previewUrl;

    const apply = () => {
      setDisplayUrl(previewUrl);
      setDisplayClass(getTransformFromUrl(previewUrl));
      setLoadingNext(false);
    };

    if (img.decode) img.decode().then(apply, apply);
    else {
      img.onload = apply;
      img.onerror = apply;
    }
  }, [previewUrl, displayUrl, getTransformFromUrl]);

  return (
    <div className={className}>
      <div className="bubble relative bg-white/50 w-56 h-56 sm:w-80 sm:h-80 xl:!w-[500px] xl:!h-[500px] flex justify-center overflow-hidden">
        {!loading && (
          <img
            ref={imgRef}
            src={previewUrl}
            alt={t('avatar_preview')}
            className={`${displayClass}`}
          />
        )}
        {imgLoading && <LoadingSpinner />}
      </div>

      <div className="flex flex-col items-center mt-4">
        <div className="w-full flex justify-center">
          <div className="relative inline-flex items-center">
            <div className="flex min-w-[200px] justify-center gap-2 items-center p-2 rounded-full border-white hover:border-[#786647] bg-white/10 text-white">
              <button
                onClick={prev}
                disabled={!isElevated || avatars.length === 0}
                aria-label={t('previous')}
              >
                <ChevronLeft />
              </button>
              <p>{t('select_avatar')}</p>
              <button
                onClick={next}
                disabled={!isElevated || avatars.length === 0}
                aria-label={t('next')}
              >
                <ChevronRight />
              </button>
              {/* random cat */}
            </div>
            <button
              onClick={handleRandomCat}
              disabled={!isElevated || randomBusy}
              aria-label={t('random_cat')}
              title={t('random_cat')}
              className="absolute left-full top-1/2 -translate-y-1/2 p-2 ml-2 rounded-full bg-white/10"
            >
              <Dice5 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex min-w-[200px] justify-center gap-2 mt-2 items-center p-2 rounded-full border-white hover:border-[#786647] bg-white/10 text-white">
          <p className="pt-1">{t('upload_avatar')}</p>
          <button onClick={onUploadClick} disabled={!isElevated} aria-label={t('upload_avatar')}>
            <Upload className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {error && <p className="tsc-error-message mt-2">{error}</p>}
      </div>
    </div>
  );
}
