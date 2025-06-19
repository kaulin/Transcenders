import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useUser } from "../contexts/UserContext"
import { ApiClient } from "@transcenders/api-client"
import {
	decodeToken,
	type AuthData,
	type LoginUser,
	type User,
} from "@transcenders/contracts"

const useAuthLogin = () => {
	const { t } = useTranslation()
	const { setUser } = useUser()
	const [loginError, setLoginError] = useState<string | null>(null)

	async function login(username: string, password: string) {
		setLoginError(null)

		try {
			const loginInfo: LoginUser = { username, password }
			const userLogin = await ApiClient.auth.login(loginInfo)

			if (!userLogin.success) {
				throw new Error(userLogin.error || t('something_went_wrong'))
			}

			const authData = userLogin.data as AuthData
			const payload = decodeToken(authData.accessToken)

			const userReq = await ApiClient.user.getUserById(payload.userId)

			if (!userReq.success) {
				throw new Error(userReq.error || t('something_went_wrong'))
			}

			const user = userReq.data as User
			setUser(user)

		} catch (err: any) {
			setLoginError(err.message || t('something_went_wrong'))
			throw err
		}
	}

	return { login, loginError }
}

export default useAuthLogin
