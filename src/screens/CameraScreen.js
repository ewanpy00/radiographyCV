import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Button from '../components/Button';
import { colors, typography, spacing, radius, shadows } from '../constants/theme';

export default function CameraScreen({ navigation, route }) {
  const { projection } = route.params;
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [capturedUri, setCapturedUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const openCamera = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access in your device settings to capture positioning images.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    setShowCamera(true);
  }, [permission, requestPermission]);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });
      setCapturedUri(photo.uri);
      setShowCamera(false);
    } catch (e) {
      Alert.alert('Capture Failed', e.message);
    }
  }, []);

  const pickFromLibrary = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Allow photo library access to select an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setCapturedUri(result.assets[0].uri);
      setShowCamera(false);
    }
  }, []);

  const retake = () => {
    setCapturedUri(null);
    setShowCamera(false);
  };

  const analyze = () => {
    navigation.navigate('Feedback', { imageUri: capturedUri, projection });
  };

  // ── Camera viewfinder ────────────────────────────────────────────
  if (showCamera) {
    return (
      <View style={styles.cameraRoot}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
        >
          {/* Top overlay */}
          <View style={[styles.camTop, { paddingTop: insets.top + spacing.sm }]}>
            <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.camBackBtn}>
              <Text style={styles.camBackText}>✕ Cancel</Text>
            </TouchableOpacity>
            <View style={styles.camBadge}>
              <Text style={styles.camBadgeText}>{projection.icon} {projection.label}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
              style={styles.camBackBtn}
            >
              <Text style={styles.camBackText}>🔄 Flip</Text>
            </TouchableOpacity>
          </View>

          {/* Guide overlay */}
          <View style={styles.guideWrap}>
            <View style={styles.guideBox}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <Text style={styles.guideText}>Position hand within frame</Text>
            </View>
          </View>

          {/* Bottom controls */}
          <View style={[styles.camBottom, { paddingBottom: insets.bottom + spacing.lg }]}>
            <TouchableOpacity onPress={pickFromLibrary} style={styles.sideBtn}>
              <Text style={styles.sideBtnIcon}>🖼️</Text>
              <Text style={styles.sideBtnLabel}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={takePicture} style={styles.shutter} activeOpacity={0.85}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
            <View style={styles.sideBtn} />
          </View>
        </CameraView>
      </View>
    );
  }

  // ── Preview / Review captured image ────────────────────────────
  if (capturedUri) {
    return (
      <View style={styles.root}>
        <Header
          title="Review Photo"
          subtitle={`${projection.label} — ${projection.fullName}`}
          onBack={retake}
        />
        <ScrollView
          contentContainerStyle={[
            styles.previewContent,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
        >
          <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="cover" />

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Before analyzing, confirm:</Text>
            {projection.checkpoints.map((cp, i) => (
              <View key={i} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{cp}</Text>
              </View>
            ))}
          </View>

          <View style={styles.previewActions}>
            <Button
              title="Retake Photo"
              icon="🔄"
              variant="secondary"
              onPress={retake}
              style={styles.halfBtn}
            />
            <Button
              title="Analyze Positioning"
              icon="🔬"
              onPress={analyze}
              style={styles.halfBtn}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Default: Prompt to capture ──────────────────────────────────
  return (
    <View style={styles.root}>
      <Header
        title="Capture Image"
        subtitle={`${projection.label} — ${projection.fullName}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Projection reminder */}
        <View style={[styles.projCard, { borderColor: projection.color }]}>
          <Text style={styles.projIcon}>{projection.icon}</Text>
          <View style={styles.projInfo}>
            <Text style={[styles.projLabel, { color: projection.color }]}>
              {projection.fullName}
            </Text>
            <Text style={styles.projDesc}>{projection.description}</Text>
          </View>
        </View>

        {/* Photo placeholder */}
        <TouchableOpacity style={styles.placeholder} onPress={openCamera} activeOpacity={0.8}>
          <Text style={styles.placeholderIcon}>📷</Text>
          <Text style={styles.placeholderTitle}>Tap to Open Camera</Text>
          <Text style={styles.placeholderSub}>Position your hand and capture a photo</Text>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>📋 Positioning Tips</Text>
          {projection.checkpoints.map((cp, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipNum}>{i + 1}.</Text>
              <Text style={styles.tipRowText}>{cp}</Text>
            </View>
          ))}
        </View>

        {/* Lighting tip */}
        <View style={styles.lightingTip}>
          <Text style={styles.lightingIcon}>💡</Text>
          <Text style={styles.lightingText}>
            Use good, even lighting. Place your hand on a flat, contrasting surface for best results.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title="Open Camera" icon="📷" onPress={openCamera} />
          <Button
            title="Choose from Library"
            icon="🖼️"
            variant="secondary"
            onPress={pickFromLibrary}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  cameraRoot: { flex: 1, backgroundColor: '#000' },

  // Camera UI
  camTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  camBackBtn: { padding: spacing.sm },
  camBackText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  camBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  camBadgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  guideWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  guideBox: {
    width: 260,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.accent,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  guideText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    position: 'absolute',
    bottom: -28,
  },
  camBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
  },
  sideBtn: {
    width: 60,
    alignItems: 'center',
  },
  sideBtnIcon: { fontSize: 24 },
  sideBtnLabel: { color: '#fff', fontSize: 11, marginTop: 4 },

  // Preview
  previewContent: { padding: spacing.lg, gap: spacing.md },
  preview: {
    width: '100%',
    height: 320,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
    ...shadows.md,
  },
  tipCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  tipTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.sm },
  tipItem: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  tipBullet: { color: colors.primary, fontWeight: '700' },
  tipText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfBtn: { flex: 1 },

  // Default state
  projCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    ...shadows.sm,
  },
  projIcon: { fontSize: 36 },
  projInfo: { flex: 1 },
  projLabel: { ...typography.h4, marginBottom: 2 },
  projDesc: { ...typography.bodySmall, color: colors.textSecondary },
  placeholder: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: spacing.sm,
    ...shadows.sm,
  },
  placeholderIcon: { fontSize: 52 },
  placeholderTitle: { ...typography.h3, color: colors.textPrimary },
  placeholderSub: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
  tipsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  tipsTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.sm },
  tipRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  tipNum: { color: colors.primary, fontWeight: '700', width: 20 },
  tipRowText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  lightingTip: {
    backgroundColor: colors.overlay,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lightingIcon: { fontSize: 18 },
  lightingText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  actions: { gap: spacing.sm },
});
