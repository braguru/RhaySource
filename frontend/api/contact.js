import { sendEnquiry } from '../server/services/mailer.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, message, store } = req.body;

    const sanitise = v => String(v || '').trim().replace(/<[^>]*>/g, '');
    const clean = {
      name:    sanitise(name),
      email:   sanitise(email),
      message: sanitise(message),
      store:   store === 'workspace' ? 'workspace' : 'skincare',
    };

    if (!clean.name)    return res.status(400).json({ error: 'Name is required' });
    if (!clean.email)   return res.status(400).json({ error: 'Email is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return res.status(400).json({ error: 'Invalid email address' });
    if (!clean.message) return res.status(400).json({ error: 'Message is required' });

    await sendEnquiry(clean);
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
}
