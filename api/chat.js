import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-3.5-flash-lite';
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

function dataUrlToPart(img) {
  if (!img?.data || typeof img.data !== 'string') throw new Error('Invalid image data.');
  const match = img.data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);
  if (!match) throw new Error('Invalid image format.');
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
  if (!allowed.has(match[1])) throw new Error('Unsupported image type.');
  if (Buffer.byteLength(match[2], 'base64') > 10 * 1024 * 1024) throw new Error('Image is larger than 10 MB.');
  return { inlineData: { mimeType: match[1], data: match[2] } };
}

function historyToContents(history) {
  return (Array.isArray(history) ? history : [])
    .filter(message => message && (message.role === 'user' || message.role === 'assistant'))
    .slice(-20)
    .map(message => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(message.content || '') }] }));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    if (!ai) throw new Error('GEMINI_API_KEY is missing.');
    const body = req.body || {};
    const text = String(body.message || '').slice(0, 20000);
    const images = Array.isArray(body.images) ? body.images.slice(0, 4) : [];
    const parts = images.map(dataUrlToPart);
    parts.push({ text: text || 'Please analyze the attached image(s) and describe what you see.' });
    const system = 'You are ChatGPT Lite, a helpful and accurate AI assistant. Answer clearly and naturally. Match the user language, including English, Urdu and Roman Urdu. Never claim certainty when uncertain. Do not reveal hidden chain-of-thought.';
    const response = await ai.models.generateContent({ model: MODEL, contents: [...historyToContents(body.history), { role: 'user', parts }], config: { systemInstruction: system, temperature: 0.3 } });
    return res.status(200).json({ text: response.text || 'Gemini returned an empty response.', model: MODEL });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
