import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../constants/theme';

const CRITERION_LABELS = {
  hand_alignment: 'Hand Alignment',
  rotation: 'Rotation / Angulation',
  centering: 'Centering',
  finger_spread: 'Finger Spread',
  detector_positioning: 'Detector Positioning',
  projection_accuracy: 'Projection Accuracy',
};

export function FeedbackItem({ item }) {
  const isCorrect = item.status === 'correct';
  return (
    <View style={[styles.item, isCorrect ? styles.itemCorrect : styles.itemIncorrect]}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemIcon}>{isCorrect ? '✅' : '⚠️'}</Text>
        <Text style={[styles.itemLabel, isCorrect ? styles.labelCorrect : styles.labelIncorrect]}>
          {CRITERION_LABELS[item.criterion] || item.criterion}
        </Text>
        <View style={[styles.badge, isCorrect ? styles.badgeCorrect : styles.badgeIncorrect]}>
          <Text style={[styles.badgeText, isCorrect ? styles.badgeTextCorrect : styles.badgeTextIncorrect]}>
            {isCorrect ? 'Correct' : 'Review'}
          </Text>
        </View>
      </View>
      <Text style={styles.itemMessage}>{item.message}</Text>
    </View>
  );
}

export function ScoreRing({ score }) {
  const getColor = (s) => {
    if (s >= 90) return colors.success;
    if (s >= 70) return colors.primary;
    if (s >= 50) return colors.warning;
    return colors.error;
  };
  const color = getColor(score);

  return (
    <View style={[styles.scoreRing, { borderColor: color }]}>
      <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
      <Text style={styles.scoreLabel}>/ 100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  itemCorrect: {
    backgroundColor: colors.successLight,
    borderLeftColor: colors.success,
  },
  itemIncorrect: {
    backgroundColor: colors.warningLight,
    borderLeftColor: colors.warning,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  itemIcon: {
    fontSize: 16,
  },
  itemLabel: {
    ...typography.h4,
    flex: 1,
  },
  labelCorrect: { color: '#166534' },
  labelIncorrect: { color: '#92400E' },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeCorrect: { backgroundColor: colors.success },
  badgeIncorrect: { backgroundColor: colors.warning },
  badgeText: { ...typography.label, fontSize: 10 },
  badgeTextCorrect: { color: colors.white },
  badgeTextIncorrect: { color: colors.white },
  itemMessage: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: 24,
  },
  scoreRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  scoreNumber: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
  },
  scoreLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
