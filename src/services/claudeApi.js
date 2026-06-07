import { Platform } from 'react-native';
import { GEMINI_API_KEY, GEMINI_API_URL } from '../constants/config';

async function toBase64(uri) {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    const FileSystem = await import('expo-file-system/legacy');
    return FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  }
}

const FIELD_KEYS = [
  'OVERALL',
  'SCORE',
  'HAND ALIGNMENT',
  'ROTATION',
  'CENTERING',
  'FINGER SPREAD',
  'DETECTOR POSITIONING',
  'PROJECTION ACCURACY',
  'SUMMARY',
];

const buildPrompt = (projection) => `
You are a certified radiography instructor evaluating a student's hand X-ray positioning.
Projection requested: ${projection.fullName} (${projection.id})

REFERENCE STANDARD:
${projection.referenceDescription}

CHECKLIST:
${projection.checkpoints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

STRICT RULES:
- If no human hand is visible: OVERALL must be "Unacceptable" and explain.
- Only mark a criterion "correct" if it is clearly and unambiguously satisfied in the image.
- Be direct and clinical. Name specific anatomical landmarks.
- For every error give the exact correction needed.

SCORING GUIDE:
90-100: All criteria met
70-89: Minor issues only
50-69: Multiple corrections needed
30-49: Wrong projection or major orientation error
0-29: Image unusable

OUTPUT FORMAT — copy this EXACTLY, replacing parentheses with your answer:
OVERALL: (Good positioning / Needs correction / Unacceptable)
SCORE: (0-100)
HAND ALIGNMENT: (is the hand flat against detector plane? Correct or describe the exact error.)
ROTATION: (any unintended rotation or tilt? Correct or state estimated degrees off.)
CENTERING: (CR at 3rd MCP joint? Correct or state if too proximal/distal/medial/lateral.)
FINGER SPREAD: (fingers appropriately separated 1-2cm? Correct or state exact problem.)
DETECTOR POSITIONING: (all anatomy from carpals to distal phalanges included? Correct or state what is cut off.)
PROJECTION ACCURACY: (does the image match ${projection.id} requirements? Correct or state the specific mismatch.)
SUMMARY: (2-3 sentences: most critical error first, then what to fix, then what is correct if anything.)
`.trim();

export async function analyzePositioning(imageUri, projection) {
  const base64 = await toBase64(imageUri);

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
      temperature: 0.1,
      maxOutputTokens: 2000,
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
  const rawText = parts.map(p => p.text || '').join('').trim();

  if (!rawText) throw new Error('Empty response from AI. Please try again.');

  return parseResponse(rawText);
}

function stripMarkdown(text) {
  return text
    .replace(/\*{1,3}/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/`+/g, '')
    .replace(/_+/g, '')
    .trim();
}

function extractField(clean, label) {
  // Match "LABEL:" possibly with surrounding whitespace on its own line or inline
  const labelPattern = new RegExp(label.replace(/ /g, '\\s+') + '\\s*:', 'i');
  const match = labelPattern.exec(clean);
  if (!match) return '';

  const contentStart = match.index + match[0].length;

  // Find the earliest start of any other known field after this position
  let contentEnd = clean.length;
  for (const other of FIELD_KEYS) {
    if (other === label) continue;
    const otherPattern = new RegExp(
      '(^|\\n)\\s*' + other.replace(/ /g, '\\s+') + '\\s*:',
      'i',
    );
    const otherMatch = otherPattern.exec(clean.slice(contentStart));
    if (otherMatch) {
      const pos = contentStart + otherMatch.index;
      if (pos < contentEnd) contentEnd = pos;
    }
  }

  return clean.slice(contentStart, contentEnd).trim();
}

const INCORRECT_WORDS = /incorrect|wrong|rotated|off.center|poor|not visible|missing|error|issue|needs|too |slightly|cut off|not flat|\bnot\b|unacceptable|adjust|reposition|unclear|blurry|cannot|unable|should|must|only|however/i;

function parseResponse(rawText) {
  const clean = stripMarkdown(rawText);

  const overall_raw = extractField(clean, 'OVERALL').toLowerCase();
  const score_raw = parseInt(extractField(clean, 'SCORE')) || 0;

  const criteriaKeys = [
    { key: 'hand_alignment',       label: 'Hand Alignment',       field: 'HAND ALIGNMENT' },
    { key: 'rotation',             label: 'Rotation',             field: 'ROTATION' },
    { key: 'centering',            label: 'Centering',            field: 'CENTERING' },
    { key: 'finger_spread',        label: 'Finger Spread',        field: 'FINGER SPREAD' },
    { key: 'detector_positioning', label: 'Detector Coverage',    field: 'DETECTOR POSITIONING' },
    { key: 'projection_accuracy',  label: 'Projection Accuracy',  field: 'PROJECTION ACCURACY' },
  ];

  const feedback = criteriaKeys.map(({ key, label, field }) => {
    const message = extractField(clean, field);
    const hasContent = message.length > 3;
    const isCorrect = hasContent && !INCORRECT_WORDS.test(message);
    return {
      criterion: key,
      label,
      message: hasContent ? message : 'Could not assess — try a clearer photo.',
      status: isCorrect ? 'correct' : 'incorrect',
    };
  });

  // Derive score from passed criteria if AI score is missing
  const passedCount = feedback.filter(f => f.status === 'correct').length;
  const derivedScore = score_raw > 0 ? score_raw : Math.round((passedCount / criteriaKeys.length) * 100);

  let overall = 'needs_correction';
  if (overall_raw.includes('good')) overall = 'good';
  if (overall_raw.includes('unacceptable')) overall = 'unacceptable';

  return {
    overall,
    score: derivedScore,
    summary: extractField(clean, 'SUMMARY'),
    feedback,
    rawText,
  };
}
