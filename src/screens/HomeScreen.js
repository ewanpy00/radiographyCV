import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadows } from '../constants/theme';

const FEATURE_CARDS = [
  { icon: '📐', title: 'Instant AI Feedback', desc: 'Claude Vision evaluates your positioning in seconds' },
  { icon: '🎯', title: '6-Point Assessment', desc: 'Alignment, rotation, centering, fingers, detector & accuracy' },
  { icon: '📚', title: '4 Hand Projections', desc: 'AP, PA, Lateral, and Oblique with reference standards' },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Hero Header */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoIcon}>🩻</Text>
        </View>
        <Text style={styles.heroTitle}>Radiography</Text>
        <Text style={styles.heroSubtitle}>Positioning Trainer</Text>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Educational Use Only</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <Button
            title="Start Practice"
            icon="▶️"
            onPress={() => navigation.navigate('ExamType')}
            style={styles.primaryBtn}
          />
          <Button
            title="Choose Body Part"
            icon="🦴"
            variant="secondary"
            onPress={() => navigation.navigate('ExamType')}
            style={styles.secondaryBtn}
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>How it works</Text>
          <View style={styles.divider} />
        </View>

        {/* Step guide */}
        <View style={styles.stepsCard}>
          {[
            { num: '1', text: 'Select a projection type (AP, PA, Lateral, Oblique)' },
            { num: '2', text: 'Position your hand using the on-screen reference guide' },
            { num: '3', text: 'Capture a photo with your device camera' },
            { num: '4', text: 'Receive instant AI-powered positioning feedback' },
          ].map((step) => (
            <View key={step.num} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{step.num}</Text>
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Feature cards */}
        <Text style={styles.sectionTitle}>Features</Text>
        {FEATURE_CARDS.map((card) => (
          <View key={card.title} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{card.icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{card.title}</Text>
              <Text style={styles.featureDesc}>{card.desc}</Text>
            </View>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>⚕️</Text>
          <Text style={styles.disclaimerText}>
            This app is for educational and training purposes only. It is not a medical diagnostic tool.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: { fontSize: 44 },
  heroTitle: {
    ...typography.h1,
    color: colors.white,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.h3,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 2,
  },
  heroBadge: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroBadgeText: {
    ...typography.label,
    color: colors.white,
    fontSize: 11,
  },
  scroll: { flex: 1 },
  content: {
    padding: spacing.lg,
  },
  ctaSection: {
    marginTop: -spacing.xl,
    gap: spacing.sm,
  },
  primaryBtn: { width: '100%' },
  secondaryBtn: { width: '100%' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.label,
    color: colors.textMuted,
    fontSize: 11,
  },
  stepsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
    marginBottom: spacing.xl,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 13,
  },
  stepText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  featureCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  featureIcon: { fontSize: 28 },
  featureText: { flex: 1 },
  featureTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 2 },
  featureDesc: { ...typography.bodySmall, color: colors.textSecondary },
  disclaimer: {
    backgroundColor: colors.overlay,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerIcon: { fontSize: 18 },
  disclaimerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
});
