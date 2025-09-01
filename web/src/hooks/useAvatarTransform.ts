import { useCallback } from 'react';

export function useAvatarTransform() {
  const getNameFromUrl = useCallback((url: string) => {
    try {
      const parts = url.split('?')[0].split('/');
      return parts[parts.length - 1] || url;
    } catch {
      return url;
    }
  }, []);

  const getTransformFromUrl = useCallback(
    (fullUrl?: string) => {
      const defaultTransform = 'object-cover';
      const defaultAvatarTransforms: Record<string, string> = {
        'avatarCat1.avif': 'object-contain max-w-[65%] object-bottom',
        'avatarCat2.avif': 'object-contain max-w-[85%] object-bottom',
        'avatarCat3.avif': 'object-contain max-w-[98%] object-bottom',
        'avatarCat4.avif': 'object-contain max-w-[80%] object-bottom',
        'avatarCat5.avif': 'object-contain max-w-[80%] object-bottom',
        'avatarCat6.avif': 'object-contain max-w-[70%] object-bottom',
        'avatarCat7.webp': 'object-contain max-w-[100%] object-bottom',
        'avatarCat8.gif': 'object-cover h-[180%]',
      };

      if (!fullUrl) return defaultTransform;
      const key = getNameFromUrl(fullUrl);
      return defaultAvatarTransforms[key] ?? defaultTransform;
    },
    [getNameFromUrl],
  );

  return {
    getTransformFromUrl,
    getNameFromUrl,
  };
}
