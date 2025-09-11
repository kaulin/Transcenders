import { Cat, ChevronRight } from 'lucide-react';
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
    <div className="w-[55%] min-w-[180px] flex flex-col justify-start items-center">
      <div className="flex flex-col w-full">
        <div className="flex gap-[clamp(4px,0.23vw,6px)] w-full">
          <input
            type="text"
            maxLength={20}
            value={searchedUser}
            placeholder={t('search_user')}
            onChange={(e) => setSearchedUser(e.target.value)}
            className="input-field flex-1 w-full text-fluid-sm"
          />
          <button
            onClick={handleSearch}
            className="p-[clamp(3px,0.16vw,4px)] h-[clamp(26px,2.76vh,36px)] aspect-square rounded-full bg-white/10 flex items-center justify-center relative group"
          >
            <ChevronRight className="h-[clamp(11.5px,1.5vh,20px)] aspect-square" />
          </button>
          <button
            onClick={handleGoBack}
            className="p-[clamp(5px,0.31vw,8px)] h-[clamp(26px,2.76vh,36px)] aspect-square rounded-full bg-white/10 flex items-center justify-center relative group"
          >
            <Cat className="h-[clamp(11.5px,1.5vh,20px)] aspect-square" />
          </button>
        </div>

        <div className="h-[clamp(14px,1.8vh,24px)] pt-[clamp(5px,0.61vh,8px)] w-full">
          {error && <p className="flex justify-start text-[#786647] text-fluid-xs">{error}</p>}
        </div>
      </div>
    </div>
  );
}
