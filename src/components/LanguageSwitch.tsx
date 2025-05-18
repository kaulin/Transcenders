import { useTranslation } from 'react-i18next'

function LanguageSwitch () {
    const { i18n } = useTranslation()

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang)
    }

    return (
        <div className="flex gap-2 text-text">
            <button className="hover:text-[#fad2c9]" onClick={() => handleLanguageChange('en')}>EN</button>
            <>|</>
            <button className="hover:text-[#fad2c9]" onClick={() => handleLanguageChange('fi')}>FI</button>
        </div>
    )
}

export default LanguageSwitch
