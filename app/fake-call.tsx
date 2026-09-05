import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/colors';

const RING_PATTERN = [0, 800, 800];

export default function FakeCallScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<'ringing' | 'active'>('ringing');
  const [callSeconds, setCallSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // No ringtone asset is bundled with this project, so this relies on vibration alone to sell
    // the "incoming call" illusion — still effective for the quiet-excuse use case.
    Vibration.vibrate(RING_PATTERN, true);
    return () => {
      Vibration.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'active') return;
    timerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const handleAnswer = () => {
    Vibration.cancel();
    setPhase('active');
  };

  const handleDecline = () => {
    Vibration.cancel();
    router.back();
  };

  const handleEndCall = () => {
    router.back();
  };

  const formattedDuration = `${Math.floor(callSeconds / 60)}:${String(callSeconds % 60).padStart(2, '0')}`;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D10" />

      <View style={styles.caller}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.callerName}>Mom</Text>
        <Text style={styles.callerStatus}>{phase === 'ringing' ? 'Incoming call…' : formattedDuration}</Text>
      </View>

      {phase === 'ringing' ? (
        <View style={styles.ringingRow}>
          <CallButton label="Decline" color={COLORS.danger} icon="close" onPress={handleDecline} />
          <CallButton label="Answer" color={COLORS.success} icon="checkmark" onPress={handleAnswer} />
        </View>
      ) : (
        <View style={styles.activeRow}>
          <CallButton label="End" color={COLORS.danger} icon="close" onPress={handleEndCall} />
        </View>
      )}
    </View>
  );
}

function CallButton({
  label,
  color,
  icon,
  onPress,
}: {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <View style={styles.callButtonWrap}>
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.callButton, { backgroundColor: color }]}
      >
        <Ionicons name={icon} size={28} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.callButtonLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0D10',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
  },
  caller: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2A2E36',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  callerName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: FONTS.semiBold,
  },
  callerStatus: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    marginTop: SPACING.sm,
  },
  ringingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: SPACING.xxl,
  },
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  callButtonWrap: {
    alignItems: 'center',
  },
  callButton: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: SPACING.sm,
  },
});
