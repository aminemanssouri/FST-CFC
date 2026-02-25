/**
 * CFC API Gateway / BFF
 *
 * Single entry point for the React frontend.
 * Proxies requests to the correct backend microservice.
 *
 * Port: 3001 (configurable via PORT env)
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { setupProxies } = require('./proxy');
const { healthCheck } = require('./health');

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ───────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Correlation-Id'],
}));

// ── Logging ────────────────────────────────────────────────────────
app.use(morgan(':method :url :status :response-time ms'));

// ── Gateway health ─────────────────────────────────────────────────
app.get('/api/health', healthCheck);

// ── Proxy routes (order matters — more specific first) ─────────────
setupProxies(app);

// ── 404 catch-all ──────────────────────────────────────────────────
app.use('/api/*', (_req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'No microservice handles this route',
    });
});

// ── Start ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n  🚀 CFC API Gateway running on port ${PORT}`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  Frontend:      ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    console.log(`  Gateway:       http://localhost:${PORT}`);
    console.log(`  Health:        http://localhost:${PORT}/api/health`);
    console.log();
});
