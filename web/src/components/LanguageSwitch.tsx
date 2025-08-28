import { useTranslation } from 'react-i18next';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { useUser } from '../hooks/useUser';

function LanguageSwitch() {
  const { i18n } = useTranslation();
  const { user } = useUser();
  const updateUser = useUpdateUser();

  const handleLanguageChange = async (lang: string) => {
    i18n.changeLanguage(lang);
    if (user) {
      updateUser({ lang });
    }
  };

  return (
    <div className="flex h-[36px] gap-2 text-xl items-center">
      <button onClick={() => handleLanguageChange('en')}>EN</button>|
      <button onClick={() => handleLanguageChange('fi')}>FI</button>|
      <button onClick={() => handleLanguageChange('et')}>ET</button>
    </div>
  );
}

export default LanguageSwitch;
