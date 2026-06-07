import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Button from '../components/Button';
import HandDiagram from '../components/HandDiagram';
import { analyzePositioning } from '../services/claudeApi';
import { colors, typography, spacing, radius, shadows } from '../constants/theme';

function LoadingState() {
  const steps = [
    'Uploading image…',
    'Analyzing hand alignment…',
    'Evaluating rotation…',
    'Checking centering…',
    'Assessing finger spread…',
    'Generating feedback…',
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={load.root}>
      <View style={load.card}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={load.title}>Analyzing</Text>
        <Text style={load.step}>{steps[step]}</Text>
        <View style={load.dots}>
          {steps.map((_, i) => (
            <View key={i} style={[load.dot, i <= step && load.dotOn]} />
          ))}
        </View>
      </View>
    </View>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <View style={err.root}>
      <View style={err.card}>
        <Text style={err.title}>Analysis Failed</Text>
        <Text style={err.message}>{message}</Text>
      </View>
      <Button title="Try Again" onPress={onRetry} style={err.btn} />
    </View>
  );
}

function CriterionRow({ item }) {
  const ok = item.status === 'correct';
  return (
    <View style={[row.wrap, ok ? row.ok : row.bad]}>
      <View style={[row.indicator, { backgroundColor: ok ? colors.success : colors.warning }]} />
      <View style={row.body}>
        <Text style={row.label}>{item.label}</Text>
        <Text style={row.message}>{item.message}</Text>
      </View>
    </View>
  );
}

export default function FeedbackScreen({ navigation, route }) {
  const { imageUri, projection } = route.params;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await analyzePositioning(imageUri, projection));
    } catch (e) {
      setError(e.message || 'Unknown error. Check internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runAnalysis(); }, []);

  const isGood = result?.overall === 'good';
  const correctCount = result?.feedback?.filter(f => f.status === 'correct').length ?? 0;
  const total = result?.feedback?.length ?? 6;

  return (
    <View style={styles.root}>
      <Header
        title="Feedback"
        subtitle={`${projection.label} — ${projection.fullName}`}
        onBack={() => navigation.goBack()}
      />

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={runAnalysis} />}

      {!loading && result && (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Score banner */}
          <View style={[styles.banner, isGood ? styles.bannerGood : styles.bannerBad]}>
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerTitle}>
                {isGood ? 'Good positioning' : 'Correction needed'}
              </Text>
              <Text style={styles.bannerSub}>{correctCount} of {total} criteria passed</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreNum, { color: isGood ? colors.success : colors.warning }]}>
                {result.score}
              </Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
          </View>

          {/* Summary */}
          {!!result.summary && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Summary</Text>
              <Text style={styles.summaryText}>{result.summary}</Text>
            </View>
          )}

          {/* Reference diagram */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Reference — Ideal Position</Text>
            <HandDiagram projectionId={projection.id} />
          </View>

          {/* Criteria */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Detailed assessment</Text>
            {result.feedback.map(item => (
              <CriterionRow key={item.criterion} item={item} />
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Practice Again"
              onPress={() => navigation.navigate('Camera', { projection })}
            />
            <Button
              title="Choose Different Projection"
              variant="secondary"
              onPress={() => navigation.navigate('ExamType')}
            />
            <Button
              title="Home"
              variant="ghost"
              onPress={() => navigation.navigate('Home')}
            />
          </View>

          <Text style={styles.disclaimer}>
            AI-generated feedback for educational purposes only.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.md },

  banner: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  bannerGood: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: colors.success },
  bannerBad:  { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: colors.warning },
  bannerInfo: { flex: 1 },
  bannerTitle: { ...typography.h3, color: colors.textPrimary },
  bannerSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 3 },
  scoreBox: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  scoreNum: { fontSize: 36, fontWeight: '800', lineHeight: 40 },
  scoreMax: { ...typography.bodySmall, color: colors.textMuted },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  cardLabel: { ...typography.label, color: colors.textMuted },
  summaryText: { ...typography.body, color: colors.textPrimary, lineHeight: 23 },

  actions: { gap: spacing.sm },
  disclaimer: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  ok:  { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' },
  bad: { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' },
  indicator: { width: 4 },
  body: { flex: 1, padding: spacing.sm, gap: 3 },
  label: { ...typography.h4, color: colors.textPrimary, fontSize: 14 },
  message: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 18 },
});

const load = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  card: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.md,
    ...shadows.lg, width: '100%',
  },
  title: { ...typography.h3, color: colors.textPrimary },
  step: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 6, marginTop: spacing.xs },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.primary },
});

const err = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  card: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm,
    ...shadows.md, width: '100%',
  },
  title: { ...typography.h3, color: colors.error },
  message: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  btn: { width: '100%' },
});
