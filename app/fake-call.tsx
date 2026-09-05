import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient as SvgLinearGradient, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import { FONTS, RADIUS, SPACING, SCREEN_WIDTH, SCREEN_HEIGHT } from '../theme/colors';

const RING_PATTERN = [0, 800, 800];
const CALLER_NAME = 'Mom';
const CALLER_KIND = 'mobile';

export default function FakeCallScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<'ringing' | 'active'>('ringing');
  const [callSeconds, setCallSeconds] = useState(0);
  const [now, setNow] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ringing pulse rings behind the avatar
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const jitter = useRef(new Animated.Value(0)).current;
  const answerGlow = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('');

  useEffect(() => {
    // No ringtone asset is bundled with this project, so this relies on vibration alone to sell
    // the "incoming call" illusion — still effective for the quiet-excuse use case.
    Vibration.vibrate(RING_PATTERN, true);
    clockRef.current = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => {
      Vibration.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, []);

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (phase !== 'active') return;
    timerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Pulse rings + jitter + dots only while ringing
  useEffect(() => {
    if (phase !== 'ringing') return;

    const loop1 = Animated.loop(
      Animated.timing(ring1, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(ring2, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ])
    );
    const loopBreathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const loopJitter = Animated.loop(
      Animated.sequence([
        Animated.timing(jitter, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(jitter, { toValue: -1, duration: 90, useNativeDriver: true }),
        Animated.timing(jitter, { toValue: 0, duration: 90, useNativeDriver: true }),
        Animated.delay(700),
      ])
    );
    const loopAnswerGlow = Animated.loop(
      Animated.timing(answerGlow, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );

    loop1.start();
    loop2.start();
    loopBreathe.start();
    loopJitter.start();
    loopAnswerGlow.start();

    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 450);

    return () => {
      loop1.stop();
      loop2.stop();
      loopBreathe.stop();
      loopJitter.stop();
      loopAnswerGlow.stop();
      clearInterval(dotsInterval);
      ring1.setValue(0);
      ring2.setValue(0);
      jitter.setValue(0);
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
  const timeLabel = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const ring1Style = {
    opacity: ring1.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.55, 0.2, 0] }),
    transform: [{ scale: ring1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
  };
  const ring2Style = {
    opacity: ring2.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.45, 0.15, 0] }),
    transform: [{ scale: ring2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
  };
  const avatarStyle = {
    transform: [
      { scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
      { translateX: jitter.interpolate({ inputRange: [-1, 1], outputRange: [-3, 3] }) },
    ],
  };
  const enterStyle = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
      { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
    ],
  };
  const answerGlowStyle = {
    opacity: answerGlow.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.5, 0.15, 0] }),
    transform: [{ scale: answerGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }],
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050608" />

      {/* Backdrop: near-black vertical gradient with a soft accent glow behind the avatar */}
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={styles.backdrop}>
        <Defs>
          <SvgLinearGradient id="callBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1B2331" />
            <Stop offset="0.45" stopColor="#0E1219" />
            <Stop offset="1" stopColor="#020304" />
          </SvgLinearGradient>
          <RadialGradient id="callGlow" cx="50%" cy="30%" r="55%">
            <Stop offset="0" stopColor="#4C6B8A" stopOpacity={0.45} />
            <Stop offset="1" stopColor="#4C6B8A" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="url(#callBg)" />
        <Circle cx={SCREEN_WIDTH / 2} cy={SCREEN_HEIGHT * 0.32} r={SCREEN_WIDTH * 0.75} fill="url(#callGlow)" />
      </Svg>

      <Text style={styles.clock}>{timeLabel}</Text>

      <Animated.View style={[styles.caller, enterStyle]}>
        <View style={styles.ringWrap}>
          {phase === 'ringing' && <Animated.View style={[styles.pulseRing, ring1Style]} />}
          {phase === 'ringing' && <Animated.View style={[styles.pulseRing, ring2Style]} />}
          <Animated.View style={[styles.avatar, avatarStyle]}>
            <Svg width={120} height={120} style={styles.avatarSvg}>
              <Defs>
                <RadialGradient id="avatarGrad" cx="35%" cy="30%" r="75%">
                  <Stop offset="0" stopColor="#4A5A72" />
                  <Stop offset="1" stopColor="#242B36" />
                </RadialGradient>
              </Defs>
              <Circle cx={60} cy={60} r={60} fill="url(#avatarGrad)" />
            </Svg>
            <Text style={styles.avatarInitial}>{CALLER_NAME.charAt(0)}</Text>
          </Animated.View>
        </View>

        <Text style={styles.callerName}>{CALLER_NAME}</Text>
        <Text style={styles.callerStatus}>
          {phase === 'ringing' ? `${CALLER_KIND} · Incoming call${dots}` : `${CALLER_KIND} · ${formattedDuration}`}
        </Text>
      </Animated.View>

      {phase === 'active' && (
        <Animated.View style={[styles.toolbarGrid, enterStyle]}>
          <ToolbarButton icon="mic-off" label="Mute" active={isMuted} onPress={() => setIsMuted((m) => !m)} />
          <ToolbarButton icon="keypad" label="Keypad" onPress={() => {}} />
          <ToolbarButton icon="volume-high" label="Speaker" active={isSpeaker} onPress={() => setIsSpeaker((s) => !s)} />
          <ToolbarButton icon="add" label="Add Call" onPress={() => {}} />
          <ToolbarButton icon="videocam" label="FaceTime" onPress={() => {}} />
          <ToolbarButton icon="person" label="Contacts" onPress={() => {}} />
        </Animated.View>
      )}

      {phase === 'ringing' ? (
        <Animated.View style={[styles.ringingRow, enterStyle]}>
          <CallButton label="Decline" color="#E4572E" icon="close" onPress={handleDecline} />
          <View style={styles.answerWrap}>
            <Animated.View style={[styles.answerGlowRing, answerGlowStyle]} />
            <CallButton label="Accept" color="#4C9A5B" icon="call" onPress={handleAnswer} />
          </View>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.activeRow, enterStyle]}>
          <CallButton label="End" color="#E4572E" icon="call" iconRotate onPress={handleEndCall} />
        </Animated.View>
      )}
    </View>
  );
}

function ToolbarButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.toolbarItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.toolbarIconWrap, active && styles.toolbarIconWrapActive]}>
        <Ionicons name={icon} size={22} color={active ? '#111' : '#fff'} />
      </View>
      <Text style={styles.toolbarLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function CallButton({
  label,
  color,
  icon,
  iconRotate,
  onPress,
}: {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconRotate?: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.callButtonWrap}>
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.callButton, { backgroundColor: color }]}
        activeOpacity={0.85}
      >
        <Ionicons name={icon} size={30} color="#fff" style={iconRotate ? { transform: [{ rotate: '135deg' }] } : undefined} />
      </TouchableOpacity>
      <Text style={styles.callButtonLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050608',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 70,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  clock: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: FONTS.semiBold,
    letterSpacing: 0.5,
  },
  caller: {
    alignItems: 'center',
  },
  ringWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(140,170,210,0.8)',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 44,
    fontWeight: FONTS.bold,
  },
  callerName: {
    color: '#fff',
    fontSize: 30,
    fontWeight: FONTS.semiBold,
    letterSpacing: 0.2,
  },
  callerStatus: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    marginTop: SPACING.sm,
    textTransform: 'capitalize',
  },
  toolbarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: SPACING.xl,
    justifyContent: 'space-between',
    rowGap: SPACING.lg,
  },
  toolbarItem: {
    width: '30%',
    alignItems: 'center',
  },
  toolbarIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  toolbarIconWrapActive: {
    backgroundColor: '#fff',
  },
  toolbarLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
  ringingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: SPACING.xxl,
  },
  answerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerGlowRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(76,154,91,0.9)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  callButtonLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: SPACING.sm,
  },
});
