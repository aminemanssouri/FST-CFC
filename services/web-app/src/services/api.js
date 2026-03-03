/**
 * CFC API Client
 *
 * Centralised fetch wrapper for all backend calls through the gateway.
 * Auto-injects JWT token, handles errors, and triggers logout on 401.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// ── Token helpers ──────────────────────────────────────────────────
function getToken() {
    return localStorage.getItem('cfc_token')
}

function getJwt() {
    return localStorage.getItem('cfc_jwt')
}

// ── Core request function ──────────────────────────────────────────
async function request(method, path, { body, headers = {}, useJwt = false } = {}) {
    const token = useJwt ? getJwt() : getToken()

    const opts = {
        method,
        headers: {
            'Accept': 'application/json',
            ...headers,
        },
    }

    // Add auth header if we have a token
    if (token) {
        opts.headers['Authorization'] = `Bearer ${token}`
    }

    // Add body (skip for FormData — let browser set content-type with boundary)
    if (body && body instanceof FormData) {
        opts.body = body
    } else if (body) {
        opts.headers['Content-Type'] = 'application/json'
        opts.body = JSON.stringify(body)
    }

    const url = `${BASE_URL}${path}`

    const res = await fetch(url, opts)

    // Handle 401 — token expired or invalid
    if (res.status === 401) {
        localStorage.removeItem('cfc_token')
        localStorage.removeItem('cfc_jwt')
        localStorage.removeItem('cfc_user')
        window.dispatchEvent(new CustomEvent('auth:logout'))
        throw new ApiError('Session expirée. Veuillez vous reconnecter.', 401)
    }

    // Handle 422 — validation errors (Laravel returns these)
    if (res.status === 422) {
        const data = await res.json()
        const messages = data.errors
            ? Object.values(data.errors).flat().join('. ')
            : data.message || 'Erreur de validation.'
        throw new ApiError(messages, 422, data.errors)
    }

    // Handle other errors
    if (!res.ok) {
        let message = 'Une erreur est survenue.'
        try {
            const data = await res.json()
            message = data.message || data.error || message
        } catch (_) { /* response is not JSON */ }
        throw new ApiError(message, res.status)
    }

    // Handle 204 No Content
    if (res.status === 204) return null

    return res.json()
}

// ── Custom error class ─────────────────────────────────────────────
class ApiError extends Error {
    constructor(message, status, errors = null) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.errors = errors // Laravel validation errors object
    }
}

// ── Public API ─────────────────────────────────────────────────────
const api = {
    get: (path, opts) => request('GET', path, opts),
    post: (path, body, opts) => request('POST', path, { body, ...opts }),
    put: (path, body, opts) => request('PUT', path, { body, ...opts }),
    patch: (path, body, opts) => request('PATCH', path, { body, ...opts }),
    delete: (path, opts) => request('DELETE', path, opts),
}

export { api, ApiError, getToken, getJwt }
export default api
