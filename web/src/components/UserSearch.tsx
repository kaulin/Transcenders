import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserSearchProps {
  searchedUser: string;
  setSearchedUser: (value: string) => void;
  handleSearch: () => void;
  error: string | null;
}

export default function UserSearch({
  searchedUser,
  setSearchedUser,
  handleSearch,
  error,
}: UserSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col justify-start items-center">
      <div className="flex flex-col">
        <div className="flex">
          <input
            type="text"
            maxLength={20}
            value={searchedUser}
            placeholder={t('search_user')}
            onChange={(e) => setSearchedUser(e.target.value)}
            className="input-field"
          />
          <button
            onClick={handleSearch}
            className="ml-4 p-1 rounded-full bg-white/10"
          >
            <ChevronRight />
          </button>
        </div>
        <div className="h-6 pt-2">
          {error && <p className="flex justify-start text-[#786647] text-xs sm:text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
