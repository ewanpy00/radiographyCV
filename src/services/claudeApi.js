import * as FileSystem from 'expo-file-system/legacy';
import { GEMINI_API_KEY, GEMINI_API_URL } from '../constants/config';

const buildPrompt = (projection) => `
You are an expert radiography educator evaluating a student's hand X-ray positioning practice.
The student is attempting a ${projection.fullName} (${projection.id}) hand projection.

REFERENCE STANDARD:
${projection.referenceDescription}

CHECKLIST:
${projection.checkpoints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Analyze the image and write a short, clear evaluation in plain text.
Structure your response exactly like this:

OVERALL: Good positioning / Needs correction
SCORE: (a number from 0 to 100)

HAND ALIGNMENT: (one sentence)
ROTATION: (one sentence)
CENTERING: (one sentence)
FINGER SPREAD: (one sentence)
DETECTOR POSITIONING: (one sentence)
PROJECTION ACCURACY: (one sentence)

SUMMARY: (2-3 sentences with the most important observations and advice)

Be specific, educational, and encouraging. Reference anatomical landmarks where relevant.
`.trim();

export async function analyzePositioning(imageUri, projection) {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });

  const ext = imageUri.split('.').pop().toLowerCase();
  const mediaTypeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const mimeType = mediaTypeMap[ext] || 'image/jpeg';

  const requestBody = {
    contents: [
      {
        parts: [
          { text: buildPrompt(projection) },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p.text || '').join('').trim();

  if (!text) throw new Error('Empty response from AI. Please try again.');

  return parseTextResponse(text);
}

function parseTextResponse(text) {
  const get = (label) => {
    const regex = new RegExp(`${label}:\\s*(.+)`, 'i');
    return text.match(regex)?.[1]?.trim() || '';
  };

  const overallRaw = get('OVERALL').toLowerCase();
  const scoreRaw = parseInt(get('SCORE')) || 0;

  return {
    overall: overallRaw.includes('good') ? 'good' : 'needs_correction',
    score: scoreRaw,
    summary: get('SUMMARY'),
    feedback: [
      { criterion: 'hand_alignment',       label: 'Hand Alignment',       message: get('HAND ALIGNMENT') },
      { criterion: 'rotation',             label: 'Rotation / Angulation', message: get('ROTATION') },
      { criterion: 'centering',            label: 'Centering',            message: get('CENTERING') },
      { criterion: 'finger_spread',        label: 'Finger Spread',        message: get('FINGER SPREAD') },
      { criterion: 'detector_positioning', label: 'Detector Positioning', message: get('DETECTOR POSITIONING') },
      { criterion: 'projection_accuracy',  label: 'Projection Accuracy',  message: get('PROJECTION ACCURACY') },
    ].map(item => ({
      ...item,
      status: item.message.toLowerCase().match(/incorrect|wrong|rotated|off|poor|missing|not|avoid|error|issue|correct your|needs|too|slightly/) ? 'incorrect' : 'correct',
    })),
    rawText: text,
  };
}
