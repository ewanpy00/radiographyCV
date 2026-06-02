// API key is loaded from .env file (not committed to git).
// Copy .env.example to .env and fill in your key.
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export const GEMINI_MODEL = 'gemini-2.5-flash';

export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
