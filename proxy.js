/**
 * Okta API Proxy Server
 * 
 * This lightweight Express server proxies requests to your Okta tenant,
 * keeping the API token on the server side (not exposed to the browser).
 * 
 * Usage:
 *   node server/proxy.js
 * 
 * Then configure Vite's proxy to point to this server (see vite.config.js).
 */

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PROXY_PORT || 3001;
const OKTA_ORG_URL = process.env.VITE_OKTA_ORG_URL;
const OKTA_API_TOKEN = process.env.VITE_OKTA_API_TOKEN;

if (!OKTA_ORG_URL || !OKTA_API_TOKEN) {
  console.error('❌ Missing VITE_OKTA_ORG_URL or VITE_OKTA_API_TOKEN in .env');
  process.exit(1);
}

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Proxy all /api/okta/* requests to Okta
app.all('/api/okta/*', async (req, res) => {
  const oktaPath = req.path.replace('/api/okta', '/api/v1');
  const url = `${OKTA_ORG_URL}${oktaPath}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `SSWS ${OKTA_API_TOKEN}`,
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method)
        ? JSON.stringify(req.body)
        : undefined,
    });

    // Forward headers
    const linkHeader = response.headers.get('Link');
    if (linkHeader) res.set('Link', linkHeader);

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Okta proxy server running on http://localhost:${PORT}`);
  console.log(`   Proxying to: ${OKTA_ORG_URL}`);
});
