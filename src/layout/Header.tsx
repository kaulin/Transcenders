import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useUser } from '../contexts/UserContext'

import LanguageSwitch from '../components/LanguageSwitch'

function Header () {
    const { t } = useTranslation()
    const { user, setUser } = useUser()

    const handleLogout = () => {
        setUser(null)
    }

    return (
        <header className="fixed top-0 left-0 w-full z-50">

        { user? (
            <>
                <nav className="flex justify-between items-center p-6 m-4">
                    <LanguageSwitch />
                    <div className="flex gap-4 items-center">
                        <Link to="/" className="menu-button">{t('home')}</Link>
                        <Link to="/profile" className="menu-button">{t('profile')}</Link>
                        <Link to="/settings" className="menu-button">{t('settings')}</Link>
                    </div>
                    <button onClick={handleLogout}>{t('log_out')}</button>
                </nav>
            </>
        ) : (
            <nav className="p-6 m-4">
                <LanguageSwitch />
            </nav>
        )}
        </header>
    ) 
}

export default Header
