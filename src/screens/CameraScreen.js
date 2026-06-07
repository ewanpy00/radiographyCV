import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView,
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
      const r = await requestPermission();
      if (!r.granted) {
        Alert.alert('Camera Permission Required', 'Allow camera access in your device settings.');
        return;
      }
    }
    setShowCamera(true);
  }, [permission, requestPermission]);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, exif: false });
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

  // ── Camera viewfinder ────────────────────────────────────────────
  if (showCamera) {
    return (
      <View style={styles.cameraRoot}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing}>
          {/* Top bar */}
          <View style={[styles.camTop, { paddingTop: insets.top + spacing.sm }]}>
            <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.camBtn}>
              <Text style={styles.camBtnText}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.camLabel}>
              <Text style={styles.camLabelText}>{projection.label}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
              style={styles.camBtn}
            >
              <Text style={styles.camBtnText}>Flip</Text>
            </TouchableOpacity>
          </View>

          {/* Frame guide */}
          <View style={styles.frameWrap}>
            <View style={styles.frame}>
              <View style={[styles.corner, styles.tl]} />
              <View style={[styles.corner, styles.tr]} />
              <View style={[styles.corner, styles.bl]} />
              <View style={[styles.corner, styles.br]} />
            </View>
            <Text style={styles.frameHint}>Position your hand within the frame</Text>
          </View>

          {/* Bottom controls */}
          <View style={[styles.camBottom, { paddingBottom: insets.bottom + spacing.lg }]}>
            <TouchableOpacity onPress={pickFromLibrary} style={styles.sideControl}>
              <Text style={styles.sideControlText}>Library</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={takePicture} style={styles.shutter} activeOpacity={0.8}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
            <View style={styles.sideControl} />
          </View>
        </CameraView>
      </View>
    );
  }

  // ── Review captured photo ────────────────────────────────────────
  if (capturedUri) {
    return (
      <View style={styles.root}>
        <Header title="Review Photo" subtitle={projection.fullName} onBack={() => setCapturedUri(null)} />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
          <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="cover" />
          <View style={styles.checkCard}>
            <Text style={styles.checkTitle}>Before analyzing, confirm:</Text>
            {projection.checkpoints.map((cp, i) => (
              <View key={i} style={styles.checkRow}>
                <View style={styles.checkDot} />
                <Text style={styles.checkText}>{cp}</Text>
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <Button title="Retake" variant="secondary" onPress={() => setCapturedUri(null)} style={styles.half} />
            <Button
              title="Analyze"
              onPress={() => navigation.navigate('Feedback', { imageUri: capturedUri, projection })}
              style={styles.half}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Default: capture prompt ──────────────────────────────────────
  return (
    <View style={styles.root}>
      <Header title="Capture Image" subtitle={projection.fullName} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.projBadge}>
          <Text style={[styles.projCode, { color: projection.color }]}>{projection.label}</Text>
          <Text style={styles.projName}>{projection.fullName}</Text>
          <Text style={styles.projDesc}>{projection.description}</Text>
        </View>

        <TouchableOpacity style={styles.placeholder} onPress={openCamera} activeOpacity={0.75}>
          <Text style={styles.placeholderTitle}>Tap to open camera</Text>
          <Text style={styles.placeholderSub}>or choose from library below</Text>
        </TouchableOpacity>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Positioning checklist</Text>
          {projection.checkpoints.map((cp, i) => (
            <View key={i} style={styles.checkRow}>
              <Text style={styles.checkNum}>{i + 1}.</Text>
              <Text style={styles.checkText}>{cp}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsCol}>
          <Button title="Open Camera" onPress={openCamera} />
          <Button title="Choose from Library" variant="secondary" onPress={pickFromLibrary} />
        </View>
      </ScrollView>
    </View>
  );
}

const C = 20;
const T = 3;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  cameraRoot: { flex: 1, backgroundColor: '#000' },

  camTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  camBtn: { padding: spacing.sm },
  camBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  camLabel: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  camLabelText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  frame: { width: 240, height: 300, position: 'relative' },
  corner: { position: 'absolute', width: C, height: C, borderColor: 'rgba(255,255,255,0.9)' },
  tl: { top: 0, left: 0, borderTopWidth: T, borderLeftWidth: T },
  tr: { top: 0, right: 0, borderTopWidth: T, borderRightWidth: T },
  bl: { bottom: 0, left: 0, borderBottomWidth: T, borderLeftWidth: T },
  br: { bottom: 0, right: 0, borderBottomWidth: T, borderRightWidth: T },
  frameHint: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center' },

  camBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sideControl: { width: 64, alignItems: 'center' },
  sideControlText: { color: '#fff', fontSize: 13 },
  shutter: {
    width: 70, height: 70, borderRadius: 35,
    borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  shutterInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff' },

  preview: {
    width: '100%',
    height: 340,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  checkCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  checkTitle: { ...typography.h4, color: colors.textPrimary },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  checkDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.primary, marginTop: 8, flexShrink: 0,
  },
  checkNum: { ...typography.body, color: colors.primary, fontWeight: '700', width: 18 },
  checkText: { ...typography.body, color: colors.textSecondary, flex: 1, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionsCol: { gap: spacing.sm },
  half: { flex: 1 },

  projBadge: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    gap: 4,
    ...shadows.sm,
  },
  projCode: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  projName: { ...typography.bodySmall, color: colors.textMuted, fontWeight: '600' },
  projDesc: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 18 },

  placeholder: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: spacing.xs,
    ...shadows.sm,
  },
  placeholderTitle: { ...typography.h4, color: colors.textPrimary },
  placeholderSub: { ...typography.bodySmall, color: colors.textMuted },

  tipsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  tipsTitle: { ...typography.h4, color: colors.textPrimary },
});
