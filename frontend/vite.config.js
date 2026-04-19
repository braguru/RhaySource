import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import 'dotenv/config';
import crypto from 'crypto';

function apiPlugin() {
  const handlers = {
    '/api/contact': async (req, res) => {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', async () => {
        try {
          const { name, email, message, store } = JSON.parse(body);
          const sanitise = v => String(v || '').trim().replace(/<[^>]*>/g, '');
          const clean = {
            name: sanitise(name),
            email: sanitise(email),
            message: sanitise(message),
            store: store === 'workspace' ? 'workspace' : 'skincare',
          };
          if (!clean.name || !clean.email || !clean.message) return respond(res, 400, 'Missing fields');
          const { sendEnquiry } = await import('./server/services/mailer.js');
          await sendEnquiry(clean);
          respond(res, 200, null, { success: true });
        } catch (err) {
          respond(res, 500, err.message);
        }
      });
    },
    '/api/images/sign': (req, res) => {
      try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const folder = url.searchParams.get('folder') || 'rhaysource/products';
        const upload_preset = url.searchParams.get('upload_preset') || 'rhaysource_products';
        
        const timestamp = Math.round(new Date().getTime() / 1000);
        const api_secret = process.env.CLOUDINARY_API_SECRET;
        const api_key = process.env.CLOUDINARY_API_KEY;
        const cloud_name = process.env.CLOUDINARY_URL?.split('@')[1] || 'duhvgnorw';

        // Sign parameters alphabetically: folder, timestamp, upload_preset
        const stringToSign = `folder=${folder}&timestamp=${timestamp}&upload_preset=${upload_preset}${api_secret}`;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        respond(res, 200, null, {
          signature,
          timestamp,
          cloud_name,
          api_key,
          folder,
          upload_preset
        });
      } catch (err) {
        respond(res, 500, err.message);
      }
    }
  };

  return {
    name: 'custom-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const handler = handlers[req.url.split('?')[0]];
        if (handler) return handler(req, res);
        next();
      });
    }
  };
}

function respond(res, status, error, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(error ? { error } : data));
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: {
    allowedHosts: ['gutsily-geognostical-chaim.ngrok-free.dev'],
  },
});
