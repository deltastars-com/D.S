import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { prompt } = JSON.parse(event.body || '{}');
  if (!prompt) return { statusCode: 400, body: 'Missing prompt' };

  // استخدام Google Gemini API أو أي خدمة أخرى (ضع مفتاحك في env)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return { statusCode: 500, body: 'AI service not configured' };
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أستطع معالجة طلبك.';
    return { statusCode: 200, body: JSON.stringify({ reply: text }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'AI assistant temporarily unavailable' };
  }
};
