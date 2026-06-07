import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Button from '../components/Button';
import HandDiagram from '../components/HandDiagram';
import { PROJECTION_LIST } from '../constants/projections';
import { colors, typography, spacing, radius, shadows } from '../constants/theme';

function ReferenceModal({ projection, onClose }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[modal.root, { paddingBottom: insets.bottom }]}>
        <View style={modal.handle} />
        <View style={modal.header}>
          <Text style={modal.title}>{projection.fullName}</Text>
          <Text style={modal.subtitle}>{projection.id} Projection</Text>
        </View>
        <ScrollView contentContainerStyle={modal.content} showsVerticalScrollIndicator={false}>
          {/* Diagram with annotated key points */}
          <Text style={modal.sectionLabel}>POSITIONING DIAGRAM</Text>
          <HandDiagram projectionId={projection.id} />

          <Text style={modal.sectionLabel}>OVERVIEW</Text>
          <Text style={modal.overviewText}>{projection.description}</Text>

          <Text style={modal.sectionLabel}>KEY POINTS TO CHECK</Text>
          {projection.checkpoints.map((cp, i) => (
            <View key={i} style={modal.checkRow}>
              <View style={[modal.checkNum, { backgroundColor: projection.color }]}>
                <Text style={modal.checkNumText}>{i + 1}</Text>
              </View>
              <Text style={modal.checkText}>{cp}</Text>
            </View>
          ))}

          <Text style={modal.sectionLabel}>FULL REFERENCE STANDARD</Text>
          <View style={modal.refBox}>
            <Text style={modal.refText}>{projection.referenceDescription}</Text>
          </View>
        </ScrollView>
        <View style={modal.footer}>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

export default function ExamTypeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [showRef, setShowRef] = useState(false);

  const projection = PROJECTION_LIST.find(p => p.id === selected);

  return (
    <View style={styles.root}>
      <Header title="Choose Projection" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>Select the hand projection to practice:</Text>

        <View style={styles.grid}>
          {PROJECTION_LIST.map(p => {
            const active = selected === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => setSelected(p.id)}
                activeOpacity={0.75}
              >
                {active && <View style={[styles.activeDot, { backgroundColor: p.color }]} />}
                <Text style={[styles.cardCode, active && { color: p.color }]}>{p.label}</Text>
                <Text style={styles.cardName}>{p.fullName}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{p.description}</Text>
                <TouchableOpacity
                  onPress={() => { setSelected(p.id); setShowRef(true); }}
                  style={styles.refLink}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.refLinkText, { color: p.color }]}>View reference</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actions}>
          {selected && (
            <Button
              title="View Reference Guide"
              variant="secondary"
              onPress={() => setShowRef(true)}
            />
          )}
          <Button
            title={selected ? 'Open Camera' : 'Select a projection first'}
            disabled={!selected}
            onPress={() => navigation.navigate('Camera', { projection })}
          />
        </View>
      </ScrollView>

      {showRef && projection && (
        <ReferenceModal projection={projection} onClose={() => setShowRef(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  instruction: { ...typography.body, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.xs,
    ...shadows.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F5FEFF',
  },
  activeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardCode: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  cardName: { ...typography.bodySmall, color: colors.textMuted, fontWeight: '600' },
  cardDesc: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 17, marginTop: 2 },
  refLink: { marginTop: spacing.xs },
  refLinkText: { ...typography.bodySmall, fontWeight: '600' },
  actions: { gap: spacing.sm },
});

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },
  content: { padding: spacing.lg, gap: spacing.md },
  sectionLabel: { ...typography.label, color: colors.textMuted, marginTop: spacing.sm },
  overviewText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  refBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.xs },
  checkNum: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  checkNumText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  checkText: { ...typography.body, color: colors.textSecondary, flex: 1, lineHeight: 22 },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
});
