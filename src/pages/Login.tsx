import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"

function SignIn() {
    const { t } = useTranslation()
    const { setUser } = useUser()

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const handleLogin = () => {
        setUser({
            id: 1,
            name: username
        })
    }

    return (
        <main className="h-full w-full flex-1 flex items-center justify-center">
            <div className="login-bubble">
                <h1>{t('pls_log_in')}</h1>
                <div className="mt-4">
                    <input
                    type="text" value={username}
                    placeholder={t("username")}
                    className="login-input-field"
                    onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mt-2">
                    <input
                        type="password" value={password}
                        placeholder={t("password")}
                        className="login-input-field"
                        onChange={(e) => setPassword(e.target.value)}
                        />
                    <div>
                        <button className="mt-2 menu-button" onClick={handleLogin}>{t('log_in')}</button>
                </div>
                </div>
                <div className="my-6">
                    <p>
                        {t('new_user')}?
                        <Link to="/SignUp" className="menu-button underline underline-offset-2"> {t('sign_up')}</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}

export default SignIn
