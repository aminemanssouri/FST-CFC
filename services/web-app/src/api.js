/**
 * FST-CFC API Service
 *
 * All paths use /api/ prefix which is proxied by the web-app nginx
 * through to the API gateway, then to the appropriate microservice.
 *
 * Token usage:
 *   auth_token  (Sanctum) – auth-service & institution-service calls
 *   auth_jwt    (JWT)     – Go services: application, document, program
 */

const BASE = '/api'

function getTokens() {
    return {
        token: localStorage.getItem('auth_token'),
        jwt: localStorage.getItem('auth_jwt'),
    }
}

function buildHeaders(useJwt = false, extra = {}) {
    const { token, jwt } = getTokens()
    const bearer = useJwt ? jwt : token
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...extra,
    }
}

async function req(method, path, body, useJwt = false, extraHeaders = {}) {
    const opts = {
        method,
        headers: buildHeaders(useJwt, extraHeaders),
    }
    if (body !== undefined) opts.body = JSON.stringify(body)

    const MAX_RETRIES = 2
    let lastErr = null
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 600 * attempt))
        const res = await fetch(`${BASE}${path}`, opts)

        let data = {}
        try { data = await res.json() } catch (_) { /* empty body */ }

        if (res.ok) return data

        // Retry on 503 (service unavailable) or 422 from gateway race conditions
        if ((res.status === 503 || res.status === 422) && attempt < MAX_RETRIES) {
            lastErr = { status: res.status, data }
            continue
        }

        const msg =
            data.message ||
            data.error ||
            (typeof data === 'string' ? data : null) ||
            `Erreur HTTP ${res.status}`
        const err = new Error(msg)
        err.status = res.status
        err.data = data
        throw err
    }
    // Should not reach here, but just in case
    const err = new Error(`Erreur HTTP ${lastErr?.status || 'inconnue'}`)
    err.status = lastErr?.status
    err.data = lastErr?.data
    throw err
}

// ─── Auth Service (Sanctum token) ────────────────────────────────────────────
export const authApi = {
    login: (email, password) =>
        req('POST', '/login', { email, password }),

    register: ({ name, email, password, password_confirmation, phone }) =>
        req('POST', '/register', {
            name,
            email,
            password,
            password_confirmation: password_confirmation || password,
            phone: phone || undefined,
        }),

    logout: () =>
        req('POST', '/logout'),

    getProfile: () =>
        req('GET', '/profile'),

    updateProfile: (data) =>
        req('PUT', '/profile', data),

    validateToken: () =>
        req('GET', '/validate-token'),
}

// ─── Institution Service (Sanctum token via VerifyServiceToken) ──────────────
export const institutionApi = {
    // Public – no token needed
    getCatalog: () =>
        req('GET', '/catalog'),

    getFormation: (id) =>
        req('GET', `/formations/${id}`),

    getRegistrationStatus: (id) =>
        req('GET', `/formations/${id}/registration-status`),

    // Protected
    getFormations: (params = '') =>
        req('GET', `/formations${params ? '?' + params : ''}`),

    createFormation: (data) =>
        req('POST', '/formations', data),

    updateFormation: (id, data) =>
        req('PUT', `/formations/${id}`, data),

    publishFormation: (id) =>
        req('POST', `/formations/${id}/publish`),

    archiveFormation: (id) =>
        req('POST', `/formations/${id}/archive`),

    unarchiveFormation: (id) =>
        req('POST', `/formations/${id}/unarchive`),

    deleteFormation: (id) =>
        req('DELETE', `/formations/${id}`),

    getEstablishments: () =>
        req('GET', '/establishments'),

    getEstablishment: (id) =>
        req('GET', `/establishments/${id}`),

    createEstablishment: (data) =>
        req('POST', '/establishments', data),

    updateEstablishment: (id, data) =>
        req('PUT', `/establishments/${id}`, data),

    deleteEstablishment: (id) =>
        req('DELETE', `/establishments/${id}`),

    getStats: () =>
        req('GET', '/stats'),
}

// ─── Application Service (JWT) ───────────────────────────────────────────────
export const applicationApi = {
    /**
     * List inscriptions.
     * Admin/Coordinator: no filter needed.
     * Candidate: pass { candidat_id: user.id }
     */
    getInscriptions: (params = {}) => {
        const qs = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
        ).toString()
        return req('GET', `/applications${qs ? '?' + qs : ''}`, undefined, true)
    },

    getInscription: (id) =>
        req('GET', `/applications/${id}`, undefined, true),

    createInscription: ({ candidat_id, formation_id, nom_complet, email, telephone, notes }) =>
        req('POST', '/applications', { candidat_id, formation_id, nom_complet, email, telephone, notes }, true),

    /**
     * Transition state machine.
     * Valid states: PREINSCRIPTION → DOSSIER_SOUMIS → EN_COURS_VALIDATION → ACCEPTE / REFUSE → INSCRIT
     */
    transition: (id, etat, modifie_par, commentaire = '') =>
        req('PATCH', `/applications/${id}/transition`, { etat, modifie_par, commentaire }, true),
}

// ─── Document Service (JWT) ──────────────────────────────────────────────────
export const documentApi = {
    getDocuments: () =>
        req('GET', '/documents', undefined, true),

    getDocument: (id) =>
        req('GET', `/documents/${id}`, undefined, true),

    downloadDocument: async (id) => {
        // The endpoint now streams the file directly (no presigned URL).
        const { jwt } = getTokens()
        const res = await fetch(`${BASE}/documents/${id}/download`, {
            method: 'GET',
            headers: {
                Accept: '*/*',
                ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
            },
        })
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}))
            throw new Error(errData.error || `HTTP ${res.status}`)
        }
        const blob = await res.blob()
        const filename = (res.headers.get('Content-Disposition') || '')
            .match(/filename="?([^"]+)"?/)?.[1] || `document-${id}`
        return { blob, filename, content_type: blob.type }
    },

    uploadDocument: async ({ inscription_id, file, type_document }) => {
        const { jwt } = getTokens()
        const fd = new FormData()
        fd.append('inscription_id', String(inscription_id))
        fd.append('file', file)
        if (type_document) fd.append('type_document', type_document)
        const res = await fetch(`${BASE}/documents`, {
            method: 'POST',
            headers: { Accept: 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
            // No Content-Type — browser sets multipart boundary automatically
            body: fd,
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
        return data
    },

    deleteDocument: (id) =>
        req('DELETE', `/documents/${id}`, undefined, true),
}

// ─── Notification Service (NestJS) ───────────────────────────────────────────
export const notificationApi = {
    getNotification: (id) =>
        req('GET', `/notifications/${id}`),

    send: (templateKey, recipient, payload, language = 'fr') => {
        const idempotencyKey = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`
        return req(
            'POST',
            '/notifications',
            { templateKey, language, recipient, payload },
            false,
            { 'Idempotency-Key': idempotencyKey }
        )
    },
}

// ─── User Management (auth-service, super_admin) ────────────────────────────
export const userApi = {
    getUsers: (params = {}) => {
        const qs = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
        ).toString()
        return req('GET', `/users${qs ? '?' + qs : ''}`)
    },

    getUser: (id) =>
        req('GET', `/users/${id}`),

    createUser: (data) =>
        req('POST', '/users', data),

    updateUser: (id, data) =>
        req('PUT', `/users/${id}`, data),

    deleteUser: (id) =>
        req('DELETE', `/users/${id}`),

    getUsersByEstablishment: (estId) =>
        req('GET', `/users/establishment/${estId}`),
}

// ─── Reporting / Analytics ───────────────────────────────────────────────────
export const reportingApi = {
    getGlobalReport: () =>
        req('GET', '/reports'),

    getEstablishmentReport: (id) =>
        req('GET', `/reports/establishment/${id}`),
}

// ─── Configuration (auth-service, super_admin) ──────────────────────────────
export const configApi = {
    getConfigurations: () =>
        req('GET', '/configurations'),

    getConfiguration: (key) =>
        req('GET', `/configurations/${key}`),

    createConfiguration: (data) =>
        req('POST', '/configurations', data),

    updateConfiguration: (key, data) =>
        req('PUT', `/configurations/${key}`, data),

    deleteConfiguration: (key) =>
        req('DELETE', `/configurations/${key}`),
}
