/* OPTIONAL Vercel serverless function for the contact form (not used until data-endpoint="/api/contact" is set in index.html).
   Required environment variables (Vercel > Project Settings > Environment Variables):
     RESEND_API_KEY  API key from resend.com
     CONTACT_TO      the email address that receives the messages
     CONTACT_FROM    a sender address allowed by your Resend account (for example one on a domain verified in Resend) */
const clean = (v, max) => String(v || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  if (b.company) return res.status(200).json({ ok: true });
  const name = clean(b.name, 100), email = clean(b.email, 150), subject = clean(b.subject, 120), message = String(b.message || '').trim().slice(0, 1500);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || subject.length < 3 || message.length < 10) return res.status(400).json({ ok: false, error: 'invalid' });
  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) return res.status(500).json({ ok: false, error: 'not_configured' });
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: CONTACT_FROM, to: [CONTACT_TO], reply_to: email, subject: '[Emerald website] ' + subject, text: 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message })
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: 'send_failed' });
    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(502).json({ ok: false, error: 'send_failed' }); }
};
