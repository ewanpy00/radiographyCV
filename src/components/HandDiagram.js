import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  G, Rect, Ellipse, Path, Line, Circle, Polygon,
  Text as SvgText, Defs, LinearGradient, Stop, RadialGradient,
} from 'react-native-svg';
import { colors, typography, spacing, radius } from '../constants/theme';

const W = 320;
const H = 420;

// ── Shared helpers ───────────────────────────────────────────────────

function CameraIcon({ x, y }) {
  return (
    <G>
      <Rect x={x - 18} y={y - 11} width="36" height="22" rx="4" fill="#1E293B" />
      <Circle cx={x} cy={y} r="7" fill="#334155" />
      <Circle cx={x} cy={y} r="4" fill="#64748B" />
      <Circle cx={x} cy={y} r="2" fill="#CBD5E1" />
      <Rect x={x + 14} y={y - 6} width="6" height="12" rx="2" fill="#1E293B" />
      <SvgText x={x} y={y + 22} textAnchor="middle" fontSize="9" fill="#64748B" fontWeight="600">CAMERA</SvgText>
    </G>
  );
}

function Arrow({ x1, y1, x2, y2, color: c = '#334155', label, labelAnchor = 'middle' }) {
  const dx = x2 - x1; const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len; const uy = dy / len;
  const ax = x2 - ux * 10; const ay = y2 - uy * 10;
  return (
    <G>
      <Line x1={x1} y1={y1} x2={ax} y2={ay} stroke={c} strokeWidth="1.5" />
      <Polygon
        points={`${x2},${y2} ${ax - uy * 4},${ay + ux * 4} ${ax + uy * 4},${ay - ux * 4}`}
        fill={c}
      />
      {label && (
        <SvgText x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6}
          textAnchor={labelAnchor} fontSize="9" fill={c} fontWeight="600">{label}</SvgText>
      )}
    </G>
  );
}

function SpreadMeasure({ x1, x2, y, gap }) {
  return (
    <G>
      <Line x1={x1} y1={y} x2={x2} y2={y} stroke="#0B7B8C" strokeWidth="1" />
      <Line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke="#0B7B8C" strokeWidth="1.5" />
      <Line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke="#0B7B8C" strokeWidth="1.5" />
      <SvgText x={(x1 + x2) / 2} y={y - 6} textAnchor="middle" fontSize="8.5" fill="#0B7B8C" fontWeight="700">{gap}</SvgText>
    </G>
  );
}

function Label({ x, y, text, bg = '#0B7B8C', width = 120 }) {
  return (
    <G>
      <Rect x={x - width / 2} y={y - 13} width={width} height="20" rx="5" fill={bg} />
      <SvgText x={x} y={y + 1} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">{text}</SvgText>
    </G>
  );
}

function SideLabel({ x, y, text, color: c = '#EF4444', side = 'right' }) {
  const offset = side === 'right' ? 6 : -6;
  return (
    <G>
      <Circle cx={x} cy={y} r="3.5" fill={c} />
      <SvgText x={x + offset} y={y + 4}
        textAnchor={side === 'right' ? 'start' : 'end'}
        fontSize="9" fill={c} fontWeight="700">{text}</SvgText>
    </G>
  );
}

// ── PA — Palm Down (Posteroanterior) ────────────────────────────────
function PA_Diagram() {
  // Top-down view. Dorsum visible (back of hand facing camera).
  // Fingers spread ~1.5cm apart.
  const palmColor = '#C8DCE0';
  const strokeColor = '#0B7B8C';
  const knuckleColor = '#9FC5CB';

  // finger positions [x, yTop, height, label]
  const fingers = [
    { x: 82,  y: 105, h: 118, w: 28, label: 'Index'  },
    { x: 116, y: 82,  h: 140, w: 28, label: 'Middle' },
    { x: 152, y: 92,  h: 130, w: 28, label: 'Ring'   },
    { x: 188, y: 114, h: 108, w: 28, label: 'Pinky'  },
  ];

  return (
    <Svg width={W} height={H} viewBox="0 0 320 420">
      <Defs>
        <LinearGradient id="dorsum" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#B8D4D9" />
          <Stop offset="1" stopColor="#7FB8C2" />
        </LinearGradient>
        <RadialGradient id="knuckle" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#8FBDC4" />
          <Stop offset="1" stopColor="#6BA8B0" />
        </RadialGradient>
      </Defs>

      {/* Camera at top */}
      <CameraIcon x={160} y={28} />

      {/* Arrow: camera → hand */}
      <Arrow x1={160} y1={50} x2={160} y2={78} color="#64748B" label="" />

      {/* Wrist */}
      <Rect x={98} y={300} width={124} height={60} rx={12}
        fill="url(#dorsum)" stroke={strokeColor} strokeWidth="2" />
      <SvgText x={160} y={335} textAnchor="middle" fontSize="9" fill={strokeColor} fontWeight="600">WRIST (neutral)</SvgText>

      {/* Palm */}
      <Rect x={72} y={210} width={176} height={98} rx={20}
        fill="url(#dorsum)" stroke={strokeColor} strokeWidth="2" />

      {/* DORSUM label on palm */}
      <Rect x={110} y={240} width={100} height={22} rx={6} fill="rgba(11,123,140,0.15)" />
      <SvgText x={160} y={255} textAnchor="middle" fontSize="10" fill={strokeColor} fontWeight="800">DORSUM (back)</SvgText>
      <SvgText x={160} y={268} textAnchor="middle" fontSize="8.5" fill={strokeColor} opacity="0.8">facing camera</SvgText>

      {/* Fingers */}
      {fingers.map((f, i) => (
        <G key={i}>
          <Rect x={f.x} y={f.y} width={f.w} height={f.h} rx={12}
            fill="url(#dorsum)" stroke={strokeColor} strokeWidth="2" />
          {/* Knuckle bumps */}
          <Ellipse cx={f.x + f.w / 2} cy={f.y + f.h - 8} rx={10} ry={6} fill="url(#knuckle)" />
          <Ellipse cx={f.x + f.w / 2} cy={f.y + f.h * 0.45} rx={8} ry={5} fill="url(#knuckle)" opacity="0.6" />
          <Ellipse cx={f.x + f.w / 2} cy={f.y + f.h * 0.75} rx={9} ry={5} fill="url(#knuckle)" opacity="0.6" />
          {/* Fingernail */}
          <Rect x={f.x + 6} y={f.y + 5} width={f.w - 12} height={18} rx={6}
            fill="rgba(255,255,255,0.55)" stroke="rgba(11,123,140,0.3)" strokeWidth="1" />
        </G>
      ))}

      {/* Thumb */}
      <Ellipse cx={56} cy={248} rx={20} ry={44}
        fill="url(#dorsum)" stroke={strokeColor} strokeWidth="2"
        transform="rotate(-22 56 248)" />
      <SvgText x={24} y={210} textAnchor="middle" fontSize="8" fill={strokeColor} fontWeight="600">Thumb</SvgText>

      {/* MCP joint CR marker */}
      <Circle cx={130} cy={210} r={8} fill="none" stroke="#EF4444" strokeWidth="2.5" />
      <Line x1={130} y1={196} x2={130} y2={224} stroke="#EF4444" strokeWidth="2" />
      <Line x1={116} y1={210} x2={144} y2={210} stroke="#EF4444" strokeWidth="2" />
      <SideLabel x={144} y={210} text="  CR point (3rd MCP)" color="#EF4444" side="right" />

      {/* Gap measurements between fingers */}
      <SpreadMeasure x1={110} x2={116} y={88} gap="~1cm" />
      <SpreadMeasure x1={144} x2={152} y={88} gap="~1cm" />
      <SpreadMeasure x1={180} x2={188} y={88} gap="~1cm" />

      {/* Palm down indicator */}
      <Arrow x1={270} y1={240} x2={270} y2={280} color="#EF4444" />
      <SvgText x={278} y={235} fontSize="9" fill="#EF4444" fontWeight="700">Palm</SvgText>
      <SvgText x={278} y={246} fontSize="9" fill="#EF4444" fontWeight="700">DOWN</SvgText>

      {/* Footer label */}
      <Label x={160} y={400} text="PA — PALM DOWN · Dorsum to camera" bg="#0B7B8C" width={260} />
    </Svg>
  );
}

// ── AP — Palm Up (Anteroposterior) ──────────────────────────────────
function AP_Diagram() {
  const strokeColor = '#22A06B';

  const fingers = [
    { x: 82,  y: 105, h: 118, w: 28 },
    { x: 116, y: 82,  h: 140, w: 28 },
    { x: 152, y: 92,  h: 130, w: 28 },
    { x: 188, y: 114, h: 108, w: 28 },
  ];

  return (
    <Svg width={W} height={H} viewBox="0 0 320 420">
      <Defs>
        <LinearGradient id="palmUp" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#C8E6C9" />
          <Stop offset="1" stopColor="#81C784" />
        </LinearGradient>
      </Defs>

      <CameraIcon x={160} y={28} />
      <Arrow x1={160} y1={50} x2={160} y2={78} color="#64748B" />

      {/* Wrist */}
      <Rect x={98} y={300} width={124} height={60} rx={12}
        fill="url(#palmUp)" stroke={strokeColor} strokeWidth="2" />
      <SvgText x={160} y={335} textAnchor="middle" fontSize="9" fill={strokeColor} fontWeight="600">WRIST (neutral)</SvgText>

      {/* Palm */}
      <Rect x={72} y={210} width={176} height={98} rx={20}
        fill="url(#palmUp)" stroke={strokeColor} strokeWidth="2" />

      {/* Palm creases */}
      <Path d="M84 240 Q160 230 236 240" stroke={strokeColor} strokeWidth="1.2" fill="none" opacity="0.4" />
      <Path d="M84 265 Q160 256 236 265" stroke={strokeColor} strokeWidth="1.2" fill="none" opacity="0.4" />

      {/* PALM label */}
      <Rect x={110} y={240} width={100} height={22} rx={6} fill="rgba(34,160,107,0.15)" />
      <SvgText x={160} y={255} textAnchor="middle" fontSize="10" fill={strokeColor} fontWeight="800">PALM (front)</SvgText>
      <SvgText x={160} y={268} textAnchor="middle" fontSize="8.5" fill={strokeColor} opacity="0.8">facing camera</SvgText>

      {/* Fingers — palm side visible (no knuckles, show palm skin folds) */}
      {fingers.map((f, i) => (
        <G key={i}>
          <Rect x={f.x} y={f.y} width={f.w} height={f.h} rx={12}
            fill="url(#palmUp)" stroke={strokeColor} strokeWidth="2" />
          {/* Finger creases instead of knuckles */}
          <Path d={`M${f.x + 4} ${f.y + f.h * 0.38} Q${f.x + f.w / 2} ${f.y + f.h * 0.35} ${f.x + f.w - 4} ${f.y + f.h * 0.38}`}
            stroke={strokeColor} strokeWidth="1" fill="none" opacity="0.5" />
          <Path d={`M${f.x + 4} ${f.y + f.h * 0.65} Q${f.x + f.w / 2} ${f.y + f.h * 0.62} ${f.x + f.w - 4} ${f.y + f.h * 0.65}`}
            stroke={strokeColor} strokeWidth="1" fill="none" opacity="0.5" />
        </G>
      ))}

      {/* Thumb */}
      <Ellipse cx={56} cy={248} rx={20} ry={44}
        fill="url(#palmUp)" stroke={strokeColor} strokeWidth="2"
        transform="rotate(-22 56 248)" />

      {/* CR marker */}
      <Circle cx={130} cy={210} r={8} fill="none" stroke="#EF4444" strokeWidth="2.5" />
      <Line x1={130} y1={196} x2={130} y2={224} stroke="#EF4444" strokeWidth="2" />
      <Line x1={116} y1={210} x2={144} y2={210} stroke="#EF4444" strokeWidth="2" />
      <SideLabel x={144} y={210} text="  CR point (3rd MCP)" color="#EF4444" />

      {/* Spacing */}
      <SpreadMeasure x1={110} x2={116} y={88} gap="~1cm" />
      <SpreadMeasure x1={144} x2={152} y={88} gap="~1cm" />
      <SpreadMeasure x1={180} x2={188} y={88} gap="~1cm" />

      {/* Palm UP indicator */}
      <Arrow x1={270} y1={280} x2={270} y2={240} color={strokeColor} />
      <SvgText x={278} y={294} fontSize="9" fill={strokeColor} fontWeight="700">Palm</SvgText>
      <SvgText x={278} y={305} fontSize="9" fill={strokeColor} fontWeight="700">UP</SvgText>

      {/* Rotation arc showing supination */}
      <Path d="M 248 258 Q 260 240 248 222" stroke={strokeColor} strokeWidth="2" fill="none" strokeDasharray="4,3" />
      <Polygon points="248,220 254,228 242,227" fill={strokeColor} />
      <SvgText x={268} y={242} fontSize="8.5" fill={strokeColor} fontWeight="600">Supine</SvgText>

      <Label x={160} y={400} text="AP — PALM UP · Palm to camera" bg="#22A06B" width={240} />
    </Svg>
  );
}

// ── LATERAL ──────────────────────────────────────────────────────────
function LATERAL_Diagram() {
  const strokeColor = '#0288D1';

  return (
    <Svg width={W} height={H} viewBox="0 0 320 420">
      <Defs>
        <LinearGradient id="sideGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#B3E5FC" />
          <Stop offset="1" stopColor="#4FC3F7" />
        </LinearGradient>
        <LinearGradient id="sideGrad2" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#81D4FA" />
          <Stop offset="1" stopColor="#29B6F6" />
        </LinearGradient>
      </Defs>

      <CameraIcon x={160} y={28} />
      <Arrow x1={160} y1={50} x2={160} y2={78} color="#64748B" />

      {/* Forearm / wrist */}
      <Rect x={118} y={302} width={60} height={70} rx={10}
        fill="url(#sideGrad)" stroke={strokeColor} strokeWidth="2" />
      <SvgText x={148} y={345} textAnchor="middle" fontSize="8.5" fill={strokeColor} fontWeight="600">Forearm</SvgText>

      {/* Palm side-on — narrow profile */}
      <Rect x={108} y={185} width={78} height={122} rx={14}
        fill="url(#sideGrad)" stroke={strokeColor} strokeWidth="2" />

      {/* Ulnar border highlight */}
      <Rect x={108} y={185} width={10} height={122} rx={5}
        fill="rgba(2,136,209,0.35)" />
      <SvgText x={92} y={248} textAnchor="middle" fontSize="8.5" fill={strokeColor} fontWeight="700"
        transform="rotate(-90 92 248)">ULNAR BORDER → DOWN</SvgText>

      {/* Stacked fingers — side profile */}
      <Rect x={112} y={62} width={60} height={132} rx={14}
        fill="url(#sideGrad2)" stroke={strokeColor} strokeWidth="2" />

      {/* Superimposition dashes showing 4 fingers stacked */}
      {[85, 100, 115, 130].map((yy, i) => (
        <G key={i}>
          <Line x1={116} y1={yy} x2={168} y2={yy} stroke={strokeColor}
            strokeWidth="0.8" opacity="0.35" strokeDasharray="4,3" />
        </G>
      ))}
      <SvgText x={148} y={124} textAnchor="middle" fontSize="9" fill={strokeColor} fontWeight="700">4 fingers</SvgText>
      <SvgText x={148} y={136} textAnchor="middle" fontSize="9" fill={strokeColor} fontWeight="700">stacked</SvgText>
      <SvgText x={148} y={148} textAnchor="middle" fontSize="8" fill={strokeColor} opacity="0.8">(superimposed)</SvgText>

      {/* Thumb — projecting anteriorly (to the right in this view) */}
      <Ellipse cx={206} cy={220} rx={22} ry={44}
        fill="url(#sideGrad)" stroke={strokeColor} strokeWidth="2"
        transform="rotate(12 206 220)" />
      <SvgText x={240} y={215} fontSize="8.5" fill={strokeColor} fontWeight="700">Thumb</SvgText>
      <SvgText x={240} y={226} fontSize="8.5" fill={strokeColor} fontWeight="700">anterior</SvgText>
      <Line x1={230} y1={220} x2={220} y2={220} stroke={strokeColor} strokeWidth="1.2"
        strokeDasharray="3,2" />

      {/* CR marker */}
      <Circle cx={142} cy={185} r={8} fill="none" stroke="#EF4444" strokeWidth="2.5" />
      <Line x1={142} y1={171} x2={142} y2={199} stroke="#EF4444" strokeWidth="2" />
      <Line x1={128} y1={185} x2={156} y2={185} stroke="#EF4444" strokeWidth="2" />
      <SvgText x={164} y={182} fontSize="8.5" fill="#EF4444" fontWeight="700">CR (2nd MCP)</SvgText>

      {/* 90° elbow indicator */}
      <Rect x={44} y={290} width={50} height={3} rx={2} fill="#94A3B8" />
      <Rect x={44} y={255} width={3} height={38} rx={2} fill="#94A3B8" />
      <Path d="M 47 282 L 57 282 L 57 272" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
      <SvgText x={36} y={270} textAnchor="middle" fontSize="8" fill="#94A3B8">Elbow</SvgText>
      <SvgText x={36} y={280} textAnchor="middle" fontSize="8" fill="#94A3B8">90°</SvgText>

      <Label x={160} y={400} text="LATERAL — Ulnar border down · Thumb forward" bg="#0288D1" width={286} />
    </Svg>
  );
}

// ── OBLIQUE — 45° ───────────────────────────────────────────────────
function OBLIQUE_Diagram() {
  const strokeColor = '#7C3AED';

  const fingers = [
    { x: 82,  y: 110, h: 112, w: 26 },
    { x: 114, y: 88,  h: 134, w: 26 },
    { x: 148, y: 98,  h: 124, w: 26 },
    { x: 182, y: 118, h: 104, w: 26 },
  ];

  return (
    <Svg width={W} height={H} viewBox="0 0 320 420">
      <Defs>
        <LinearGradient id="oblGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#DDD6FE" />
          <Stop offset="1" stopColor="#A78BFA" />
        </LinearGradient>
      </Defs>

      <CameraIcon x={160} y={28} />
      <Arrow x1={160} y1={50} x2={160} y2={78} color="#64748B" />

      {/* 45° angle indicator */}
      <Path d="M 46 310 L 46 270 A 40 40 0 0 1 74 282 Z"
        fill="#EDE9FE" stroke={strokeColor} strokeWidth="1.5" opacity="0.8" />
      <SvgText x={66} y={302} fontSize="11" fill={strokeColor} fontWeight="800">45°</SvgText>

      {/* Wrist rotated */}
      <G transform="rotate(-45 160 310)">
        <Rect x={100} y={300} width={120} height={52} rx={12}
          fill="url(#oblGrad)" stroke={strokeColor} strokeWidth="2" />
      </G>

      {/* Palm at 45° */}
      <G transform="rotate(-45 160 235)">
        <Rect x={74} y={205} width={172} height={88} rx={18}
          fill="url(#oblGrad)" stroke={strokeColor} strokeWidth="2" />
      </G>

      {/* Fingers with slight flex at 45° */}
      {fingers.map((f, i) => (
        <G key={i} transform={`rotate(-45 ${f.x + f.w / 2} ${f.y + f.h})`}>
          <Rect x={f.x} y={f.y} width={f.w} height={f.h} rx={11}
            fill="url(#oblGrad)" stroke={strokeColor} strokeWidth="2" />
        </G>
      ))}

      {/* Thumb */}
      <Ellipse cx={58} cy={240} rx={18} ry={38}
        fill="url(#oblGrad)" stroke={strokeColor} strokeWidth="2"
        transform="rotate(-60 58 240)" />

      {/* Radial side label (down/on detector) */}
      <Line x1={82} y1={295} x2={44} y2={318} stroke={strokeColor} strokeWidth="1.2" strokeDasharray="3,2" />
      <SvgText x={24} y={324} fontSize="8.5" fill={strokeColor} fontWeight="700">Radial side</SvgText>
      <SvgText x={24} y={335} fontSize="8.5" fill={strokeColor} fontWeight="700">on detector</SvgText>

      {/* Ulnar side label (elevated) */}
      <Line x1={220} y1={210} x2={258} y2={195} stroke={strokeColor} strokeWidth="1.2" strokeDasharray="3,2" />
      <SvgText x={262} y={193} fontSize="8.5" fill={strokeColor} fontWeight="700">Ulnar side</SvgText>
      <SvgText x={262} y={204} fontSize="8.5" fill={strokeColor} fontWeight="700">ELEVATED</SvgText>
      <Arrow x1={258} y1={220} x2={258} y2={200} color={strokeColor} />

      {/* CR marker */}
      <Circle cx={130} cy={215} r={8} fill="none" stroke="#EF4444" strokeWidth="2.5" />
      <Line x1={130} y1={201} x2={130} y2={229} stroke="#EF4444" strokeWidth="2" />
      <Line x1={116} y1={215} x2={144} y2={215} stroke="#EF4444" strokeWidth="2" />
      <SvgText x={148} y={213} fontSize="8.5" fill="#EF4444" fontWeight="700">CR (3rd MCP)</SvgText>

      {/* Gap measurement */}
      <SpreadMeasure x1={108} x2={114} y={82} gap="1–2cm" />
      <SpreadMeasure x1={142} x2={148} y={82} gap="1–2cm" />

      {/* Finger flex note */}
      <SvgText x={270} y={130} fontSize="8.5" fill={strokeColor} fontWeight="700" textAnchor="middle">Fingers</SvgText>
      <SvgText x={270} y={141} fontSize="8.5" fill={strokeColor} fontWeight="700" textAnchor="middle">slightly</SvgText>
      <SvgText x={270} y={152} fontSize="8.5" fill={strokeColor} fontWeight="700" textAnchor="middle">flexed</SvgText>
      <Line x1={252} y1={140} x2={210} y2={155} stroke={strokeColor} strokeWidth="1" strokeDasharray="3,2" />

      <Label x={160} y={400} text="OBLIQUE — 45° · Ulnar elevated" bg="#7C3AED" width={220} />
    </Svg>
  );
}

const DIAGRAMS = {
  PA: PA_Diagram,
  AP: AP_Diagram,
  LATERAL: LATERAL_Diagram,
  OBLIQUE: OBLIQUE_Diagram,
};

const COLORS = {
  PA: '#0B7B8C',
  AP: '#22A06B',
  LATERAL: '#0288D1',
  OBLIQUE: '#7C3AED',
};

export default function HandDiagram({ projectionId }) {
  const D = DIAGRAMS[projectionId];
  const c = COLORS[projectionId] || colors.primary;
  if (!D) return null;
  return (
    <View style={styles.wrap}>
      <D />
      <View style={[styles.legend, { borderTopColor: c + '33' }]}>
        <View style={styles.lItem}>
          <View style={[styles.lDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.lText}>Central ray (CR)</Text>
        </View>
        <View style={styles.lItem}>
          <View style={[styles.lDot, { backgroundColor: c }]} />
          <Text style={styles.lText}>Key landmark</Text>
        </View>
        <View style={styles.lItem}>
          <View style={[styles.lDash]} />
          <Text style={styles.lText}>Measurement</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#F8FCFD',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    width: '100%',
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    justifyContent: 'center',
  },
  lItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  lDot: { width: 8, height: 8, borderRadius: 4 },
  lDash: { width: 14, height: 2, backgroundColor: '#0B7B8C', borderRadius: 1 },
  lText: { ...typography.bodySmall, color: colors.textSecondary, fontSize: 10.5 },
});
