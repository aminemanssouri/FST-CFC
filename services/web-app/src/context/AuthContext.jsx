import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const ROLES = {
    CANDIDAT: 'CANDIDAT',
    ADMIN_ETABLISSEMENT: 'ADMIN_ETABLISSEMENT',
    COORDINATEUR: 'COORDINATEUR',
    SUPER_ADMIN: 'SUPER_ADMIN',
}

// Map backend role names to JWT role names (auth-service uses lowercase internally)
const ROLE_REDIRECTS = {
    CANDIDAT: '/dashboard',
    ADMIN_ETABLISSEMENT: '/admin',
    COORDINATEUR: '/admin',
    SUPER_ADMIN: '/super-admin',
}

// ── Helper: decode JWT payload without a library ───────────────────
function decodeJwtPayload(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(base64))
    } catch {
        return null
    }
}

// ── Helper: check if JWT is expired ────────────────────────────────
function isTokenExpired(token) {
    const payload = decodeJwtPayload(token)
    if (!payload?.exp) return true
    return Date.now() >= payload.exp * 1000
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true) // true while restoring session

    // ── Restore session from localStorage on mount ─────────────────
    useEffect(() => {
        const storedUser = localStorage.getItem('cfc_user')
        const storedToken = localStorage.getItem('cfc_token')
        const storedJwt = localStorage.getItem('cfc_jwt')

        if (storedUser && storedToken && storedJwt && !isTokenExpired(storedJwt)) {
            setUser(JSON.parse(storedUser))
        } else {
            // Clear stale data
            localStorage.removeItem('cfc_user')
            localStorage.removeItem('cfc_token')
            localStorage.removeItem('cfc_jwt')
        }
        setLoading(false)
    }, [])

    // ── Listen for forced logout (from api.js on 401) ──────────────
    useEffect(() => {
        const handleForceLogout = () => {
            setUser(null)
        }
        window.addEventListener('auth:logout', handleForceLogout)
        return () => window.removeEventListener('auth:logout', handleForceLogout)
    }, [])

    // ── Save to localStorage whenever user changes ─────────────────
    const saveSession = useCallback((userData, sanctumToken, jwtToken) => {
        localStorage.setItem('cfc_user', JSON.stringify(userData))
        localStorage.setItem('cfc_token', sanctumToken)
        localStorage.setItem('cfc_jwt', jwtToken)
        setUser(userData)
    }, [])

    // ── Login ──────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        const data = await api.post('/auth/login', { email, password })

        // auth-service returns: { user, token (sanctum), jwt }
        const userData = {
            id: data.user.id,
            nom: data.user.name,
            email: data.user.email,
            role: data.jwt_payload?.role || data.user.role?.toUpperCase() || 'CANDIDAT',
            establishment_id: data.user.establishment_id,
        }

        // Decode JWT to get the role the Go services will see
        const jwtPayload = decodeJwtPayload(data.jwt)
        if (jwtPayload?.role) {
            userData.role = jwtPayload.role
        }

        saveSession(userData, data.token, data.jwt)
        return userData
    }, [saveSession])

    // ── Register ───────────────────────────────────────────────────
    const register = useCallback(async (formData) => {
        const data = await api.post('/auth/register', {
            name: `${formData.prenom} ${formData.nom}`,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
        })

        const userData = {
            id: data.user.id,
            nom: data.user.name,
            email: data.user.email,
            role: 'CANDIDAT', // register always creates candidates
            establishment_id: null,
        }

        const jwtPayload = decodeJwtPayload(data.jwt)
        if (jwtPayload?.role) {
            userData.role = jwtPayload.role
        }

        saveSession(userData, data.token, data.jwt)
        return userData
    }, [saveSession])

    // ── Logout ─────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout')
        } catch {
            // Even if API call fails, clear local state
        }
        localStorage.removeItem('cfc_user')
        localStorage.removeItem('cfc_token')
        localStorage.removeItem('cfc_jwt')
        setUser(null)
    }, [])

    // ── Update profile ─────────────────────────────────────────────
    const updateProfile = useCallback(async (profileData) => {
        const data = await api.put('/auth/profile', profileData)
        const updatedUser = { ...user, ...data.user }
        localStorage.setItem('cfc_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        return updatedUser
    }, [user])

    // ── Role helpers ───────────────────────────────────────────────
    const isCandidat = user?.role === ROLES.CANDIDAT
    const isAdmin = user?.role === ROLES.ADMIN_ETABLISSEMENT || user?.role === ROLES.COORDINATEUR
    const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
    const isAuthenticated = !!user

    // ── Don't render children until session check is done ──────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Chargement...</p>
                </div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{
            user, login, logout, register, updateProfile,
            isCandidat, isAdmin, isSuperAdmin, isAuthenticated,
            ROLES, ROLE_REDIRECTS,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be inside AuthProvider')
    return ctx
}
