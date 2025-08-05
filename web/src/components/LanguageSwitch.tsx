import { useTranslation } from 'react-i18next';

function LanguageSwitch() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex h-[36px] gap-2 text-xl items-end">
      <button onClick={() => handleLanguageChange('en')}>EN</button>|
      <button onClick={() => handleLanguageChange('fi')}>FI</button>
    </div>
  );
}

export default LanguageSwitch;
