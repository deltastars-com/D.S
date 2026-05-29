import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body: any = {};
  try {
    if (event.headers['content-type']?.includes('application/json')) {
      body = JSON.parse(event.body || '{}');
    } else {
      // parse form-urlencoded
      const params = new URLSearchParams(event.body || '');
      body = Object.fromEntries(params);
    }
  } catch (e) {
    return { statusCode: 400, body: 'Invalid body' };
  }

  const { name, email, subject, message } = body;
  if (!name || !email || !subject || !message) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  // هنا يمكنك إضافة إرسال بريد إلكتروني عبر خدمة مثل SendGrid أو SMTP
  console.log(`Contact form received: from ${email} (${name}), subject: ${subject}, message: ${message}`);

  // Optional: store in Firebase Admin SDK (إذا كان لديك service account)
  // try {
  //   const admin = require('firebase-admin');
  //   if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });
  //   await admin.firestore().collection('contact_submissions').add({ name, email, subject, message, createdAt: new Date().toISOString() });
  // } catch (err) { console.error('Firestore backup failed', err); }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'تم استلام رسالتك بنجاح' }),
    headers: { 'Content-Type': 'application/json' }
  };
};
