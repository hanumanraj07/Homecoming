import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, Vibration, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const RING_PATTERN = [0, 800, 800];

export default function FakeCallScreen() {
  const { spacing, typography } = useTheme();
  const soundRef = useRef(null);
  const [phase, setPhase] = useState('ringing');
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/ringtone.wav'), {
        isLooping: true,
        shouldPlay: true,
        volume: 1,
      });
      if (isMounted) {
        soundRef.current = sound;
      } else {
        sound.unloadAsync();
      }
    })();

    Vibration.vibrate(RING_PATTERN, true);

    return () => {
      isMounted = false;
      Vibration.cancel();
      soundRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'active') return undefined;
    const interval = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const stopRinging = async () => {
    Vibration.cancel();
    await soundRef.current?.stopAsync();
  };

  const handleAnswer = async () => {
    await stopRinging();
    setPhase('active');
  };

  const handleDecline = async () => {
    await stopRinging();
    router.back();
  };

  const handleEndCall = () => {
    router.back();
  };

  const formattedDuration = `${Math.floor(callSeconds / 60)}:${String(callSeconds % 60).padStart(2, '0')}`;

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0D10', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 80 }}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#2A2E36',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ fontSize: 48 }}>👤</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: typography.size.xxl, fontWeight: typography.weight.semibold }}>Mom</Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: typography.size.md, marginTop: spacing.sm }}>
          {phase === 'ringing' ? 'Incoming call…' : formattedDuration}
        </Text>
      </View>

      {phase === 'ringing' ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: spacing.xxl }}>
          <CallButton label="Decline" color="#E5484D" icon="✕" onPress={handleDecline} />
          <CallButton label="Answer" color="#1FA97D" icon="✓" onPress={handleAnswer} />
        </View>
      ) : (
        <CallButton label="End" color="#E5484D" icon="✕" onPress={handleEndCall} />
      )}
    </View>
  );
}

function CallButton({ label, color, icon, onPress }) {
  const { spacing, radii, typography } = useTheme();

  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => ({
          width: 72,
          height: 72,
          borderRadius: radii.full,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: '#fff', fontSize: typography.size.xl, fontWeight: typography.weight.bold }}>{icon}</Text>
      </Pressable>
      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: typography.size.sm, marginTop: spacing.sm }}>{label}</Text>
    </View>
  );
}
