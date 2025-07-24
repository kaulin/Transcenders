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
	const { setUser } = useUser()

	async function login(username: string, password: string) {

		try {
			const loginInfo: LoginUser = { username, password }
			const userLogin = await ApiClient.auth.login(loginInfo)

			if (!userLogin.success) {
				throw new Error(userLogin.error.localeKey)
			}

			const authData = userLogin.data as AuthData
			const payload = decodeToken(authData.accessToken)

			const userReq = await ApiClient.user.getUserById(payload.userId)

			if (!userReq.success) {
				throw new Error(userReq.error.localeKey)
			}

			const user = userReq.data as User
			setUser(user)

		} catch (err: any) {
			throw err
		}
	}

	return { login }
}

export default useAuthLogin
