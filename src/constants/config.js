// Google Gemini API — free tier, no credit card required.
// Get your key at: https://aistudio.google.com
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export const GEMINI_MODEL = 'gemini-2.5-flash';

export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
