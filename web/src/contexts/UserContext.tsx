import type { ReactNode } from "react"
import { createContext, useContext, useState } from "react"

export interface User {
	id: number;
	username: string;
	email?: string;
	display_name?: string;
	avatar?: string | null;
	lang?: string;
	created_at?: string;
	updated_at?: string;
}

type UserContextType = {
    user: User | null
    setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
