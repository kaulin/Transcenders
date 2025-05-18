import { useTranslation } from "react-i18next"
import { useUser } from "../contexts/UserContext"
import { Link } from 'react-router-dom'
import { useState } from "react"

function SignUp() {
    const { t } = useTranslation()
    const { setUser } = useUser()

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const handleSignUp = () => {
        setUser({
            id: 1,
            name: username
        })
    }

    return (
        <main className="h-full w-full flex-1 flex items-center justify-center">
            <div className="bubble w-[90vw] flex flex-col justify-center p-14 mb-52">
                <h1>{t('create_account')}</h1>
                <div className="mt-4">
                    <input
                        type="text" value={username}
                        placeholder={t('username')}
                        className="login-input-field"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mt-2">
                    <input
                        type="password"
                        placeholder={t('password')}
                        className="login-input-field"
                    />
                <div className="mt-2">
                    <input
                        type="password" value={password}
                        placeholder={t('confirm_password')}
                        className="login-input-field"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>
                        <button className="mt-2 button-text" onClick={handleSignUp}>{t('sign_up')}</button>
                    <div>
                </div>
                <div className="text-white m-4 ">
                    <p>{t('existing_user')}?
                        <Link to="/" className="button-text underline underline-offset-2"> {t('log_in')}</Link>
                    </p>
                </div>
                </div>
            </div>
        </main>
    )
}

export default SignUp
