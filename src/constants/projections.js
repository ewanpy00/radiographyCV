export const PROJECTIONS = {
  AP: {
    id: 'AP',
    label: 'AP',
    fullName: 'Anteroposterior',
    icon: '🖐️',
    color: '#0B7B8C',
    description:
      'The dorsal (back) surface of the hand faces the X-ray source; the palm faces the detector.',
    referenceDescription: `
ANTEROPOSTERIOR (AP) HAND POSITIONING REFERENCE:
- Patient position: Seated at end of table, arm extended.
- Part position: Hand supinated (palm facing UP / towards detector).
  The DORSUM (back of hand) faces the X-ray tube.
- Digits: Slightly separated (1–2 cm between each finger), fully extended, lying flat.
- Wrist: In neutral position, no flexion or extension.
- Centering point: CR directed perpendicular to the 3rd MCP (metacarpophalangeal) joint.
- Coverage: Include all carpal bones, metacarpals, and phalanges.
- Key check: No rotation — medial and lateral soft-tissue margins of each digit should appear symmetric.
- Common errors: Hand rotated (oblique artifact), fingers not fully extended, wrist flexed.
    `.trim(),
    checkpoints: [
      'Palm faces detector (dorsum toward tube)',
      'Fingers slightly spread and fully extended',
      'CR at 3rd MCP joint, perpendicular',
      'No rotation of hand',
      'All digits and carpals included',
    ],
  },

  PA: {
    id: 'PA',
    label: 'PA',
    fullName: 'Posteroanterior',
    icon: '✋',
    color: '#17A3B8',
    description:
      'The palm faces down toward the detector; the dorsum faces the X-ray tube. Standard projection.',
    referenceDescription: `
POSTEROANTERIOR (PA) HAND POSITIONING REFERENCE:
- Patient position: Seated at end of table, arm extended.
- Part position: Hand PRONATED (palm facing DOWN toward detector).
  The DORSUM (back of hand) faces UP toward the X-ray tube.
- Digits: Slightly separated (1–2 cm), fully extended and flat on the detector.
- Wrist: Neutral — no radial or ulnar deviation, no flexion/extension.
- Centering point: CR perpendicular to the 3rd MCP joint.
- Coverage: Entire hand including distal radius/ulna and all phalanges.
- Key check: Equal soft-tissue on both sides of each digit; no rotation.
- Common errors: Oblique rotation, finger flexion, wrist deviation, fingers bunched together.
    `.trim(),
    checkpoints: [
      'Palm faces down (pronated)',
      'Dorsum faces X-ray tube',
      'Fingers flat and slightly spread',
      'No radial/ulnar deviation at wrist',
      'CR at 3rd MCP joint',
    ],
  },

  LATERAL: {
    id: 'LATERAL',
    label: 'Lateral',
    fullName: 'Lateral',
    icon: '🤚',
    color: '#22A06B',
    description:
      'Hand in true lateral position; thumb up, fingers stacked and extended.',
    referenceDescription: `
LATERAL HAND POSITIONING REFERENCE:
- Patient position: Seated with elbow flexed ~90°, forearm resting on table.
- Part position: Ulnar surface of hand placed on detector (little-finger side down).
  Hand in TRUE LATERAL — thumb pointing straight up.
- Digits: Extended and stacked (superimposed over each other). Thumb separated anteriorly.
- Wrist: Neutral, no flexion or extension.
- Centering point: CR perpendicular to the 2nd MCP joint.
- Coverage: All metacarpals and phalanges; carpals in lateral view.
- Key check: Metacarpals should superimpose; radius and ulna in perfect lateral.
- Common errors: Fingers fanned out (not stacked), oblique rotation, wrist flexed or extended.
    `.trim(),
    checkpoints: [
      'Ulnar surface down on detector',
      'Hand in true lateral (thumb up)',
      'Fingers stacked (superimposed)',
      'Thumb separated anteriorly',
      'Metacarpals superimposed on image',
    ],
  },

  OBLIQUE: {
    id: 'OBLIQUE',
    label: 'Oblique',
    fullName: 'Oblique',
    icon: '🤙',
    color: '#8B5CF6',
    description:
      '45° oblique — hand rotated halfway between PA and lateral. Fingers slightly flexed.',
    referenceDescription: `
OBLIQUE HAND POSITIONING REFERENCE:
- Patient position: Seated at table, arm extended.
- Part position: Begin from PA position then rotate the hand LATERALLY 45°.
  The ulnar side is elevated; the radial side remains on/near the detector.
- Digits: Slightly flexed at 45° — fingertips resting on detector or sponge support.
  Fingers spread slightly to avoid superimposition.
- Thumb: Extended, slightly anterior, not superimposing the index finger.
- Wrist: Neutral, no deviation.
- Centering point: CR perpendicular to the 3rd MCP joint.
- Coverage: All metacarpals, phalanges, and carpal region.
- Key check: 45° rotation produces separation of metacarpals. The 3rd–5th metacarpals should NOT overlap.
- Common errors: Over-rotation (>45°) or under-rotation (<45°), fingers superimposed, thumb overlapping index.
    `.trim(),
    checkpoints: [
      '45° rotation from PA position',
      'Ulnar side elevated',
      'Fingers slightly flexed at same angle',
      'No metacarpal superimposition',
      'Thumb clear of index finger',
    ],
  },
};

export const PROJECTION_LIST = Object.values(PROJECTIONS);
