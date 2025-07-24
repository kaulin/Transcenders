import { useState } from "react"
import { useTranslation } from "react-i18next"

import { usePlayers } from "../contexts/PlayersContext.tsx"
import { ApiClient } from "@transcenders/api-client"
import {
	decodeToken,
	type AuthData,
	type LoginUser,
	type User,
} from "@transcenders/contracts"

const useVerifyLogin = () => {
	const { setPlayer } = usePlayers()

	async function login (username: string, password: string, playerNumber: number) {

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
			setPlayer(playerNumber, {
				id: user.id,
				username: user.username,
				avatar: user.avatar,
				ready: true
			})

		} catch (err: any) {
			throw err
		}
	}

	return { login }
}

export default useVerifyLogin
