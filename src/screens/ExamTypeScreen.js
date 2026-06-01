import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Button from '../components/Button';
import { PROJECTION_LIST } from '../constants/projections';
import { colors, typography, spacing, radius, shadows } from '../constants/theme';

function ReferenceModal({ projection, visible, onClose }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.root}>
        <View style={modalStyles.handle} />
        <View style={modalStyles.header}>
          <Text style={modalStyles.icon}>{projection?.icon}</Text>
          <Text style={modalStyles.title}>{projection?.fullName}</Text>
          <Text style={modalStyles.subtitle}>{projection?.id} Projection</Text>
        </View>

        <ScrollView
          contentContainerStyle={modalStyles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={modalStyles.sectionLabel}>Overview</Text>
          <View style={modalStyles.overviewCard}>
            <Text style={modalStyles.overview}>{projection?.description}</Text>
          </View>

          <Text style={modalStyles.sectionLabel}>Reference Standard</Text>
          <View style={modalStyles.refCard}>
            <Text style={modalStyles.refText}>{projection?.referenceDescription}</Text>
          </View>

          <Text style={modalStyles.sectionLabel}>Positioning Checklist</Text>
          {projection?.checkpoints.map((cp, i) => (
            <View key={i} style={modalStyles.checkItem}>
              <Text style={modalStyles.checkBox}>☐</Text>
              <Text style={modalStyles.checkText}>{cp}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={modalStyles.footer}>
          <Button title="Close Reference" onPress={onClose} variant="secondary" />
        </View>
      </View>
    </Modal>
  );
}

export default function ExamTypeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [showRef, setShowRef] = useState(false);

  const selectedProjection = PROJECTION_LIST.find((p) => p.id === selected);

  return (
    <View style={styles.root}>
      <Header
        title="Choose Projection"
        subtitle="Select a hand X-ray view"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>
          Select the projection you want to practice:
        </Text>

        <View style={styles.grid}>
          {PROJECTION_LIST.map((proj) => {
            const isSelected = selected === proj.id;
            return (
              <TouchableOpacity
                key={proj.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                  { borderColor: isSelected ? proj.color : colors.border },
                ]}
                onPress={() => setSelected(proj.id)}
                activeOpacity={0.8}
              >
                {isSelected && (
                  <View style={[styles.selectedBadge, { backgroundColor: proj.color }]}>
                    <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                  </View>
                )}
                <Text style={styles.cardIcon}>{proj.icon}</Text>
                <Text style={[styles.cardLabel, isSelected && { color: proj.color }]}>
                  {proj.label}
                </Text>
                <Text style={styles.cardFullName}>{proj.fullName}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {proj.description}
                </Text>

                <TouchableOpacity
                  style={[styles.refBtn, { borderColor: proj.color }]}
                  onPress={() => {
                    setSelected(proj.id);
                    setShowRef(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.refBtnText, { color: proj.color }]}>
                    View Reference →
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedInfoText}>
              Selected: <Text style={{ fontWeight: '700' }}>{selectedProjection?.fullName}</Text>
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {selected && (
            <Button
              title="View Reference Guide"
              icon="📖"
              variant="secondary"
              onPress={() => setShowRef(true)}
              style={{ marginBottom: spacing.sm }}
            />
          )}
          <Button
            title={selected ? 'Open Camera' : 'Select a Projection First'}
            icon="📷"
            disabled={!selected}
            onPress={() =>
              navigation.navigate('Camera', { projection: selectedProjection })
            }
          />
        </View>
      </ScrollView>

      {showRef && selectedProjection && (
        <ReferenceModal
          projection={selectedProjection}
          visible={showRef}
          onClose={() => setShowRef(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  instruction: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: '#F0FBFD',
    ...shadows.md,
  },
  selectedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  selectedBadgeText: {
    ...typography.label,
    fontSize: 9,
    color: colors.white,
  },
  cardIcon: { fontSize: 32, marginBottom: spacing.sm },
  cardLabel: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardFullName: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  cardDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  refBtn: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 5,
    alignItems: 'center',
  },
  refBtnText: { ...typography.bodySmall, fontWeight: '600' },
  selectedInfo: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  selectedInfoText: { ...typography.body, color: colors.primary },
  actions: { gap: spacing.sm },
});

const modalStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  icon: { fontSize: 40, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.white, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 4,
  },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  overviewCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  overview: { ...typography.body, color: colors.textPrimary },
  refCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  refText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkBox: { fontSize: 18, color: colors.primary },
  checkText: { ...typography.body, color: colors.textPrimary, flex: 1 },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
});
