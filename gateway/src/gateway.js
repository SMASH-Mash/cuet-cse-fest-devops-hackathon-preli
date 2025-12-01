const express = require('express');
const axios = require('axios');
const { URL } = require('url');

const app = express();

const gatewayPort = Number(process.env.GATEWAY_PORT || 5921);
const backendUrl = process.env.BACKEND_URL || 'http://backend:3847';

app.use(express.json());

/**
 * Builds the full backend URL safely.
 */
function buildBackendUrl(req) {
  const base = backendUrl.endsWith('/')
    ? backendUrl.slice(0, -1)
    : backendUrl;

  return new URL(req.originalUrl.replace('/api', ''), base).toString();
}

async function proxyRequest(req, res) {
  const targetUrl = buildBackendUrl(req);
  const startTime = process.hrtime.bigint();

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      params: req.query,
      data: req.body,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'X-Forwarded-For': req.ip,
        'X-Forwarded-Proto': req.protocol,
      },
      timeout: 15000,
      validateStatus: () => true,
      maxContentLength: 50 * 1024 * 1024,
      maxBodyLength: 50 * 1024 * 1024,
    });

    const durationMs = Number((process.hrtime.bigint() - startTime) / BigInt(1_000_000));
    console.log(`[GATEWAY] ${req.method} ${req.originalUrl} -> ${response.status} (${durationMs}ms)`);

    res.status(response.status);
    for (const header of ['content-type', 'content-length']) {
      if (response.headers[header]) {
        res.setHeader(header, response.headers[header]);
      }
    }

    res.send(response.data);
  } catch (error) {
    console.error('[GATEWAY ERROR]', error.code, error.message);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return res.status(502).json({ error: 'Backend unavailable' });
      }
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Backend timeout' });
      }
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
    }

    return res.status(500).json({ error: 'Gateway internal error' });
  }
}

app.all('/api/*', proxyRequest);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'gateway' });
});

app.listen(gatewayPort, () => {
  console.log(`Gateway listening on ${gatewayPort}, forwarding to ${backendUrl}`);
});
