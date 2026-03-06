import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

const ROLES = {
    CANDIDAT: 'CANDIDAT',
    ADMIN_ETABLISSEMENT: 'ADMIN_ETABLISSEMENT',
    COORDINATEUR: 'COORDINATEUR',
    SUPER_ADMIN: 'SUPER_ADMIN',
}

/** Backend role (lowercase) → frontend role (uppercase) */
const ROLE_MAP = {
    candidate: 'CANDIDAT',
    establishment_admin: 'ADMIN_ETABLISSEMENT',
    coordinator: 'COORDINATEUR',
    super_admin: 'SUPER_ADMIN',
}

function loadUser() {
    try {
        const stored = localStorage.getItem('auth_user')
        return stored ? JSON.parse(stored) : null
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadUser)

    // Validate token on startup — if token is stale/revoked, clear session
    useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (!token || !user) return
        authApi.validateToken()
            .then(() => {
                // Token valid — optionally refresh profile
                return authApi.getProfile().catch(() => null)
            })
            .then(data => {
                if (data?.user || data?.id) {
                    const fresh = data.user || data
                    const mapped = {
                        ...fresh,
                        nom: fresh.name || fresh.nom || '',
                        role: ROLE_MAP[fresh.role] || fresh.role,
                    }
                    setUser(mapped)
                    localStorage.setItem('auth_user', JSON.stringify(mapped))
                }
            })
            .catch(() => {
                // Token invalid — clear session
                setUser(null)
                localStorage.removeItem('auth_user')
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_jwt')
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Call after a successful login/register API response.
     * @param {object} userData  - user object from auth-service response
     * @param {string} token     - Sanctum token (for auth-service / institution-service)
     * @param {string} jwt       - JWT (for Go microservices)
     */
    const login = (userData, token, jwt) => {
        const mapped = {
            ...userData,
            nom: userData.name || userData.nom || '',
            role: ROLE_MAP[userData.role] || userData.role,
        }
        setUser(mapped)
        localStorage.setItem('auth_user', JSON.stringify(mapped))
        if (token) localStorage.setItem('auth_token', token)
        if (jwt)   localStorage.setItem('auth_jwt',   jwt)
    }

    const logout = async () => {
        // Call server-side logout to revoke Sanctum token
        try { await authApi.logout() } catch { /* ignore */ }
        setUser(null)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_jwt')
    }

    const isCandidat      = user?.role === ROLES.CANDIDAT
    const isAdmin         = user?.role === ROLES.ADMIN_ETABLISSEMENT || user?.role === ROLES.COORDINATEUR
    const isSuperAdmin    = user?.role === ROLES.SUPER_ADMIN
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
