/**
 * Health aggregator — checks all backend services and reports status.
 */

const { SERVICES } = require('./proxy');

async function checkService(name, url) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`${url}/health`, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
            return { name, status: 'up', url };
        }
        return { name, status: 'down', url, code: res.status };
    } catch (err) {
        return { name, status: 'down', url, error: err.message };
    }
}

async function healthCheck(_req, res) {
    const checks = await Promise.all([
        checkService('auth', SERVICES.auth),
        checkService('institution', SERVICES.institution),
        checkService('application', SERVICES.application),
        checkService('document', SERVICES.document),
        checkService('notification', SERVICES.notification),
        checkService('reporting', SERVICES.reporting),
    ]);

    // For Laravel services, health is at /api/health not /health
    // Let's also try /api/health for services that returned down
    for (let i = 0; i < checks.length; i++) {
        if (checks[i].status === 'down') {
            const altCheck = await checkService(
                checks[i].name,
                checks[i].url.replace(/\/health$/, '') // already just the base URL
            );
            // Try /api/health for Laravel services
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 3000);
                const r = await fetch(`${checks[i].url}/api/health`, { signal: controller.signal });
                clearTimeout(timeout);
                if (r.ok) {
                    checks[i] = { name: checks[i].name, status: 'up', url: checks[i].url };
                }
            } catch (_) { /* still down */ }
        }
    }

    const allUp = checks.every(c => c.status === 'up');

    res.status(allUp ? 200 : 207).json({
        status: allUp ? 'healthy' : 'degraded',
        gateway: 'up',
        timestamp: new Date().toISOString(),
        services: checks,
    });
}

module.exports = { healthCheck };
