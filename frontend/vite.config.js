import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import 'dotenv/config';

function emailApiPlugin() {
  const handler = (req, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      return res.end();
    }

    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      try {
        const { name, email, message, store } = JSON.parse(body);

        const sanitise = v => String(v || '').trim().replace(/<[^>]*>/g, '');
        const clean = {
          name:    sanitise(name),
          email:   sanitise(email),
          message: sanitise(message),
          store:   store === 'workspace' ? 'workspace' : 'skincare',
        };

        if (!clean.name)    return respond(res, 400, 'Name is required');
        if (!clean.email)   return respond(res, 400, 'Email is required');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return respond(res, 400, 'Invalid email address');
        if (!clean.message) return respond(res, 400, 'Message is required');

        const { sendEnquiry } = await import('./server/services/mailer.js');
        await sendEnquiry(clean);
        respond(res, 200, null, { success: true });
      } catch (err) {
        console.error('Email error:', err.message);
        respond(res, 500, 'Failed to send message. Please try again.');
      }
    });
  };

  return {
    name: 'email-api',
    configureServer(server) {
      server.middlewares.use('/api/contact', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/contact', handler);
    },
  };
}

function respond(res, status, error, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(error ? { error } : data));
}

export default defineConfig({
  plugins: [react(), emailApiPlugin()],
  server: {
    allowedHosts: ['gutsily-geognostical-chaim.ngrok-free.dev'],
  },
});
