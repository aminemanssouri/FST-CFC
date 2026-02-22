import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const ROLES = {
    CANDIDAT: 'CANDIDAT',
    ADMIN_ETAB: 'ADMIN_ETAB',
    COORDINATEUR: 'COORDINATEUR',
    SUPER_ADMIN: 'SUPER_ADMIN',
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)

    const login = (userData) => setUser(userData)
    const logout = () => setUser(null)

    // Quick role helpers
    const isCandidat = user?.role === ROLES.CANDIDAT
    const isAdmin = user?.role === ROLES.ADMIN_ETAB || user?.role === ROLES.COORDINATEUR
    const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
    const isAuthenticated = !!user

    return (
        <AuthContext.Provider value={{ user, login, logout, isCandidat, isAdmin, isSuperAdmin, isAuthenticated, ROLES }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be inside AuthProvider')
    return ctx
}
