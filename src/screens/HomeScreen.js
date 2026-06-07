import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadows } from '../constants/theme';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.heroTitle}>Radiography{'\n'}Positioning Trainer</Text>
        <Text style={styles.heroSub}>Educational tool for radiography students</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.actions}>
          <Button
            title="Start Practice"
            onPress={() => navigation.navigate('ExamType')}
          />
          <Button
            title="Choose Projection"
            variant="secondary"
            onPress={() => navigation.navigate('ExamType')}
          />
        </View>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>How it works</Text>
          {[
            { n: '1', t: 'Choose a projection type' },
            { n: '2', t: 'Position your hand using the reference guide' },
            { n: '3', t: 'Take a photo with your camera' },
            { n: '4', t: 'Get instant AI feedback on your positioning' },
          ].map(s => (
            <View key={s.n} style={styles.step}>
              <View style={styles.stepDot}><Text style={styles.stepDotText}>{s.n}</Text></View>
              <Text style={styles.stepText}>{s.t}</Text>
            </View>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            For educational and training purposes only. Not a medical diagnostic tool.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 40,
    marginBottom: spacing.sm,
  },
  heroSub: {
    ...typography.body,
    color: 'rgba(255,255,255,0.75)',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  actions: { gap: spacing.sm },
  stepsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  stepsTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepDotText: { ...typography.label, color: colors.primary, fontSize: 12 },
  stepText: { ...typography.body, color: colors.textSecondary, flex: 1 },
  disclaimer: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
