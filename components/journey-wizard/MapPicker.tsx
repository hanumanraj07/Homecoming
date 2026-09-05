import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import MapView from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { reverseGeocode } from '../../services/places';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme/colors';

type Coordinate = { latitude: number; longitude: number };

// Classic "pin fixed to screen center, map moves underneath it" picker — avoids needing a
// separate draggable-marker gesture and reads clearly as "this is where you're placing the pin."
export function MapPicker({
  visible,
  initialRegion,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  initialRegion: Coordinate;
  onCancel: () => void;
  onConfirm: (place: { label: string; latitude: number; longitude: number }) => void;
}) {
  const [center, setCenter] = useState<Coordinate>(initialRegion);
  const [address, setAddress] = useState('Move the map to choose a spot');
  const [isResolving, setIsResolving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRegionChangeComplete = (region: any) => {
    const next = { latitude: region.latitude, longitude: region.longitude };
    setCenter(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsResolving(true);
      const label = await reverseGeocode(next);
      setAddress(label);
      setIsResolving(false);
    }, 500);
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    const label = address === 'Move the map to choose a spot' ? await reverseGeocode(center) : address;
    setIsConfirming(false);
    onConfirm({ label, latitude: center.latitude, longitude: center.longitude });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={styles.root}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: initialRegion.latitude,
            longitude: initialRegion.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onRegionChangeComplete={handleRegionChangeComplete}
        />

        <View pointerEvents="none" style={styles.centerPinWrap}>
          <Ionicons name="location" size={40} color={COLORS.accent} style={styles.pinIcon} />
          <View style={styles.pinShadow} />
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onCancel} hitSlop={8}>
          <Ionicons name="close" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.bottomCard}>
          <View style={styles.addressRow}>
            {isResolving ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            )}
            <Text style={styles.addressText} numberOfLines={2}>
              {address}
            </Text>
          </View>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} disabled={isConfirming}>
            {isConfirming ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.confirmText}>Confirm This Location</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centerPinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -46,
    alignItems: 'center',
  },
  pinIcon: {
    marginBottom: -6,
  },
  pinShadow: {
    width: 10,
    height: 4,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    minHeight: 40,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontSize: 15,
    fontWeight: FONTS.bold,
  },
});
