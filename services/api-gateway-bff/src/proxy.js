/**
 * Proxy configuration — maps gateway routes to backend microservices.
 *
 * Laravel services (auth, institution) prefix their routes with /api.
 * Go/NestJS services (application, document, notification) do NOT.
 * The gateway normalises everything under /api/* for the frontend.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

// ── Service URLs (env or Docker defaults) ──────────────────────────
const SERVICES = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
    institution: process.env.INSTITUTION_SERVICE_URL || 'http://localhost:8002',
    application: process.env.APPLICATION_SERVICE_URL || 'http://localhost:3005',
    document: process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3006',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
    reporting: process.env.REPORTING_SERVICE_URL || 'http://localhost:3011',
};

// ── Helper: create a proxy with common options ─────────────────────
function proxy(target, pathRewrite) {
    const opts = {
        target,
        changeOrigin: true,
        timeout: 30000,
        proxyTimeout: 30000,
        on: {
            error(err, _req, res) {
                console.error(`[proxy] ${target} →`, err.message);
                if (!res.headersSent) {
                    res.status(502).json({
                        error: 'Service unavailable',
                        service: target,
                        message: err.message,
                    });
                }
            },
        },
    };
    if (pathRewrite) opts.pathRewrite = pathRewrite;
    return createProxyMiddleware(opts);
}

// ── Route definitions ──────────────────────────────────────────────
function setupProxies(app) {

    // ─── Auth Service (Laravel → /api prefix) ──────────────────────
    // /api/auth/*  →  auth-service/api/*
    app.use('/api/auth', proxy(SERVICES.auth, {
        '^/api/auth': '/api',
    }));

    // /api/users/*  →  auth-service/api/users/*
    app.use('/api/users', proxy(SERVICES.auth, {
        '^/api/users': '/api/users',
    }));

    // /api/configurations/*  →  auth-service/api/configurations/*
    app.use('/api/configurations', proxy(SERVICES.auth, {
        '^/api/configurations': '/api/configurations',
    }));

    // ─── Institution Service (Laravel → /api prefix) ──────────────
    // /api/establishments/*  →  institution-service/api/establishments/*
    app.use('/api/establishments', proxy(SERVICES.institution, {
        '^/api/establishments': '/api/establishments',
    }));

    // /api/catalog  →  institution-service/api/catalog
    app.use('/api/catalog', proxy(SERVICES.institution, {
        '^/api/catalog': '/api/catalog',
    }));

    // /api/formations/*  →  institution-service/api/formations/*
    app.use('/api/formations', proxy(SERVICES.institution, {
        '^/api/formations': '/api/formations',
    }));

    // /api/stats/*  →  institution-service/api/stats/*
    app.use('/api/stats', proxy(SERVICES.institution, {
        '^/api/stats': '/api/stats',
    }));

    // ─── Application Service (Go → no prefix) ─────────────────────
    // /api/inscriptions/*  →  application-service/inscriptions/*
    app.use('/api/inscriptions', proxy(SERVICES.application, {
        '^/api/inscriptions': '/inscriptions',
    }));

    // ─── Document Service (Go → no prefix) ────────────────────────
    // /api/documents/*  →  document-service/documents/*
    app.use('/api/documents', proxy(SERVICES.document, {
        '^/api/documents': '/documents',
    }));

    // ─── Notification Service (NestJS → no prefix) ────────────────
    // /api/notifications/*  →  notification-service/notifications/*
    app.use('/api/notifications', proxy(SERVICES.notification, {
        '^/api/notifications': '/notifications',
    }));

    // /api/templates/*  →  notification-service/templates/*
    app.use('/api/templates', proxy(SERVICES.notification, {
        '^/api/templates': '/templates',
    }));

    // ─── Reporting Service (Express → mixed prefix) ───────────────
    // /api/reports/global, /api/reports/institution/:id, /api/reports/program/:id
    //   →  reporting-analytics/api/reports/*
    // /api/auth-reports/*  →  auth-service/api/reports/*  (user stats)
    app.use('/api/auth-reports', proxy(SERVICES.auth, {
        '^/api/auth-reports': '/api/reports',
    }));

    app.use('/api/reports', proxy(SERVICES.reporting, {
        '^/api/reports': '/api/reports',
    }));
}

module.exports = { setupProxies, SERVICES };
