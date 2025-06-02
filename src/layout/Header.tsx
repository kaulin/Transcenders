import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useUser } from '../contexts/UserContext'

import LanguageSwitch from '../components/LanguageSwitch'

const Header = () => {
    const { t } = useTranslation()
    const { user, setUser } = useUser()

    const handleLogout = () => {
        setUser(null)
    }

    return (
        <header className="fixed top-0 left-0 w-full z-50 h-24">

        { user? (
            <>
                <nav className="flex items-center py-9 px-10">
					<div className="flex basis-1/3 justify-start">
                    	<LanguageSwitch />
					</div>
                    <div className="flex basis-1/3 justify-center gap-4 uppercase">
                        <Link to="/" className="button-text text-lg">{t('home')}</Link>
                        <Link to="/profile" className="button-text text-lg">{t('profile')}</Link>
                        <Link to="/settings" className="button-text text-lg">{t('settings')}</Link>
                    </div>
					<div className="flex basis-1/3 justify-end">
                    	<button onClick={handleLogout}>{t('log_out')}</button>
					</div>
                </nav>
            </>
        ) : (
            <nav className="py-9 px-10">
                <LanguageSwitch />
            </nav>
        )}
        </header>
    )
}

export default Header
