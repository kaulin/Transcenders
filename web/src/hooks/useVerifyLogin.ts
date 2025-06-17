import { useTranslation } from "react-i18next"
import { useState } from "react"
import { ApiClient } from "@transcenders/api-client"
import {
	type AuthData,
	type JWTPayload,
	type LoginUser,
	type User,
} from "@transcenders/contracts"

const useVerifyLogin = () => {
	const { t } = useTranslation()
	const [loginError, setLoginError] = useState<string | null>(null)

	const login = async (
		username: string,
		password: string
	): Promise<User | null> => {
		setLoginError(null)

		try {
			const loginInfo: LoginUser = { username, password }
			const userLogin = await ApiClient.auth.login(loginInfo)

			if (!userLogin.success) {
				throw new Error(userLogin.error || t('something_went_wrong'))
			}

			const authData = userLogin.data as AuthData
			const payload = JSON.parse(atob(authData.accessToken.split('.')[1])) as JWTPayload

			const userReq = await ApiClient.user.getUserById(payload.userId)

			if (!userReq.success) {
				throw new Error(userReq.error || t('something_went_wrong'))
			}

			return userReq.data as User

		} catch (err: any) {
			setLoginError(err.message || t('something_went_wrong'))
			throw err
		}
	}

	return { login, loginError }
}

export default useVerifyLogin
