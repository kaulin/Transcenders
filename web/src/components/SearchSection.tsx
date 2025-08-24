import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchSectionProps {
  searchedUser: string;
  setSearchedUser: (value: string) => void;
  handleSearch: () => void;
  error: string | null;
}

export default function SearchSection({
  searchedUser,
  setSearchedUser,
  handleSearch,
  error
}: SearchSectionProps) {
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
            className="ml-4 p-2 rounded-full  border-white hover:border-[#786647] bg-white/15 text-white"
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
};
