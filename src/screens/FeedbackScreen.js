import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Button from '../components/Button';
import { FeedbackItem, ScoreRing } from '../components/FeedbackCard';
import { analyzePositioning } from '../services/claudeApi';
import { colors, typography, spacing, radius, shadows } from '../constants/theme';


function LoadingState() {
  const steps = [
    'Uploading image…',
    'Analyzing hand alignment…',
    'Evaluating rotation & angulation…',
    'Checking centering…',
    'Assessing finger spread…',
    'Verifying projection accuracy…',
    'Generating feedback…',
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={loadStyles.root}>
      <View style={loadStyles.card}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={loadStyles.title}>AI Analysis in Progress</Text>
        <Text style={loadStyles.step}>{steps[step]}</Text>
        <View style={loadStyles.dotRow}>
          {steps.map((_, i) => (
            <View key={i} style={[loadStyles.dot, i <= step && loadStyles.dotActive]} />
          ))}
        </View>
      </View>
      <Text style={loadStyles.note}>Claude Vision is evaluating your positioning…</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <View style={errStyles.root}>
      <View style={errStyles.card}>
        <Text style={errStyles.icon}>⚠️</Text>
        <Text style={errStyles.title}>Analysis Failed</Text>
        <Text style={errStyles.message}>{message}</Text>
      </View>
      <Button title="Try Again" onPress={onRetry} style={{ marginTop: spacing.md }} />
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
      const data = await analyzePositioning(imageUri, projection);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Unknown error occurred. Check your API key and internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const isGood = result?.overall === 'good';
  const correctCount = result?.feedback?.filter((f) => f.status === 'correct').length ?? 0;
  const totalCount = result?.feedback?.length ?? 0;

  return (
    <View style={styles.root}>
      <Header
        title="AI Feedback"
        subtitle={`${projection.label} — ${projection.fullName}`}
        onBack={() => navigation.goBack()}
      />

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={runAnalysis} />}

      {!loading && result && (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Overall result banner */}
          <View style={[styles.banner, isGood ? styles.bannerGood : styles.bannerNeeds]}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerIcon}>{isGood ? '✅' : '⚠️'}</Text>
              <View>
                <Text style={styles.bannerTitle}>
                  {isGood ? 'Good Positioning!' : 'Correction Needed'}
                </Text>
                <Text style={styles.bannerSub}>
                  {correctCount}/{totalCount} criteria passed
                </Text>
              </View>
            </View>
            <ScoreRing score={result.score} />
          </View>

          {/* Summary */}
          {result.summary && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>AI Summary</Text>
              <Text style={styles.summaryText}>{result.summary}</Text>
            </View>
          )}

          {/* Captured image thumbnail */}
          <View style={styles.imageRow}>
            <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />
            <View style={styles.imageInfo}>
              <Text style={styles.imageInfoLabel}>Analyzed Image</Text>
              <Text style={styles.imageInfoProjection}>{projection.icon} {projection.fullName}</Text>
              <View style={[styles.scoreChip, { backgroundColor: isGood ? colors.successLight : colors.warningLight }]}>
                <Text style={[styles.scoreChipText, { color: isGood ? colors.success : colors.warning }]}>
                  Score: {result.score}/100
                </Text>
              </View>
            </View>
          </View>

          {/* Raw AI text — always shown */}
          <View style={styles.rawCard}>
            <Text style={styles.rawLabel}>📋 AI Feedback</Text>
            <Text style={styles.rawText}>{result.rawText}</Text>
          </View>

          {/* Parsed feedback items — shown if parsing worked */}
          {result.feedback.some(f => f.message) && (
            <>
              <Text style={styles.sectionLabel}>Breakdown</Text>
              {result.feedback.map((item) => (
                <FeedbackItem key={item.criterion} item={item} />
              ))}
            </>
          )}

          {/* Reference reminder */}
          <View style={styles.refReminder}>
            <Text style={styles.refReminderTitle}>📖 Reference Standard</Text>
            <Text style={styles.refReminderText}>{projection.description}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Practice Again"
              icon="🔄"
              onPress={() => navigation.navigate('Camera', { projection })}
              style={styles.actionBtn}
            />
            <Button
              title="Choose Different Projection"
              icon="📐"
              variant="secondary"
              onPress={() => navigation.navigate('ExamType')}
              style={styles.actionBtn}
            />
            <Button
              title="Return Home"
              icon="🏠"
              variant="ghost"
              onPress={() => navigation.navigate('Home')}
              style={styles.actionBtn}
            />
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚕️ This feedback is AI-generated (Gemini Vision) for educational purposes only. It is not a clinical assessment.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  banner: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.md,
  },
  bannerGood: { backgroundColor: colors.successLight, borderWidth: 1, borderColor: colors.success },
  bannerNeeds: { backgroundColor: colors.warningLight, borderWidth: 1, borderColor: colors.warning },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  bannerIcon: { fontSize: 28 },
  bannerTitle: { ...typography.h3, color: colors.textPrimary },
  bannerSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.sm,
  },
  summaryLabel: { ...typography.label, color: colors.primary, marginBottom: spacing.xs },
  summaryText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  imageRow: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  thumb: {
    width: 90,
    height: 100,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  imageInfo: { flex: 1, justifyContent: 'center', gap: spacing.xs },
  imageInfoLabel: { ...typography.label, color: colors.textMuted },
  imageInfoProjection: { ...typography.h4, color: colors.textPrimary },
  scoreChip: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  scoreChipText: { ...typography.label, fontSize: 11 },
  sectionLabel: { ...typography.label, color: colors.textMuted },
  rawCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    ...shadows.sm,
  },
  rawLabel: { ...typography.label, color: colors.primary, marginBottom: spacing.sm },
  rawText: { ...typography.body, color: colors.textPrimary, lineHeight: 24 },
  refReminder: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refReminderTitle: { ...typography.h4, color: colors.primary, marginBottom: spacing.xs },
  refReminderText: { ...typography.bodySmall, color: colors.textSecondary },
  actions: { gap: spacing.sm },
  actionBtn: { width: '100%' },
  disclaimer: {
    backgroundColor: colors.overlay,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerText: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
});

const loadStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.lg,
    width: '100%',
  },
  title: { ...typography.h3, color: colors.textPrimary },
  step: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.primary },
  note: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
});

const errStyles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.md,
    width: '100%',
  },
  icon: { fontSize: 40 },
  title: { ...typography.h3, color: colors.error },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
