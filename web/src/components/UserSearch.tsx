import { ChevronRight, Cat } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserSearchProps {
  searchedUser: string;
  setSearchedUser: (value: string) => void;
  handleSearch: () => void;
  handleGoBack: () => void;
  error: string | null;
}

export default function UserSearch({
  searchedUser,
  setSearchedUser,
  handleSearch,
  handleGoBack,
  error,
}: UserSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col justify-start items-center">
      <div className="flex flex-col">
        <div className="flex gap-1.5">
          <input
            type="text"
            maxLength={20}
            value={searchedUser}
            placeholder={t('search_user')}
            onChange={(e) => setSearchedUser(e.target.value)}
            className="input-field"
          />
          <button onClick={handleSearch} className="p-1 rounded-full bg-white/10 relative group">
            <ChevronRight />
            <span className="absolute hidden button-label bottom-full left-2/3">{t('search')}</span>
          </button>

          <button onClick={handleGoBack} className="p-2 rounded-full bg-white/10 relative group">
            <Cat className="h-5 w-5" />
            <span className="absolute hidden button-label bottom-full left-2/3">
              {t('your_page')}
            </span>
          </button>
        </div>
        <div className="h-6 pt-2">
          {error && <p className="flex justify-start text-[#786647] text-xs sm:text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
