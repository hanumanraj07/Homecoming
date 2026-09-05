import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';
import { CategoryBadge, TimeOfDayScene, DriftingClouds, WalkingTraveler, getDayPeriod } from '../../../components/Illustrations';
import { HamburgerMenu } from '../../../components/HamburgerMenu';
import { COLORS, FONTS, RADIUS, SPACING, SCREEN_WIDTH, SHADOW } from '../../../theme/colors';

const getGreeting = () => {
  const period = getDayPeriod();
  if (period === 'morning') return 'Good morning';
  if (period === 'afternoon') return 'Good afternoon';
  if (period === 'evening') return 'Good evening';
  return 'Still up';
};

const BANNER_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: COLORS.primary,
  SAFE: COLORS.success,
  COMPLETED: COLORS.success,
  'CHECK-IN_MISSED': COLORS.warning,
  ESCALATED: COLORS.danger,
  CANCELLED: COLORS.textMuted,
  PLANNED: COLORS.textMuted,
};

const TIPS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: 'people-outline', text: "Add at least one trusted contact before starting a journey — they're who gets alerted." },
  { icon: 'battery-charging-outline', text: 'Keep your phone charged. Low battery can cut off location tracking mid-trip.' },
  { icon: 'star-outline', text: 'Mark your most important contact as Priority for one-tap calling in an emergency.' },
  { icon: 'call-outline', text: 'Use Fake Call from the Safety tab whenever you need a quick, believable exit.' },
  { icon: 'location-outline', text: 'Keep location permission "Always Allow" so tracking keeps working while the app is backgrounded.' },
];

function formatRelativeDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Staggered "the page is waking up" entrance — each section rises + fades in a beat after the
// last, rather than the whole screen appearing at once.
function useRise(delay: number) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 450,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, delay]);
  return {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  };
}

// A button that visibly compresses on press and springs back — small tactile feedback used on
// every tappable card on this screen instead of the flatter default TouchableOpacity feel.
function PressScale({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

// Auto-advancing safety tips, crossfading every few seconds, with tappable dots to jump directly
// to one — replaces what used to be a single static tip that never changed.
function TipsCarousel() {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  const goTo = useCallback(
    (next: number) => {
      Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setIndex(next);
        Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    },
    [fade]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      goTo((index + 1) % TIPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [index, goTo]);

  const tip = TIPS[index];

  return (
    <View style={styles.tipsCard}>
      <Animated.View style={{ opacity: fade, flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm }}>
        <Ionicons name={tip.icon} size={20} color={COLORS.warning} />
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Safety Tip</Text>
          <Text style={styles.tipText}>{tip.text}</Text>
        </View>
      </Animated.View>
      <View style={styles.tipDots}>
        {TIPS.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={6}>
            <View style={[styles.tipDot, i === index && styles.tipDotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const headerAnim = useRise(0);
  const bannerAnim = useRise(90);
  const statusAnim = useRise(160);
  const ctaAnim = useRise(230);
  const actionsAnim = useRise(300);
  const tipsAnim = useRise(370);

  const scrollY = useRef(new Animated.Value(0)).current;
  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true });
  const parallaxY = scrollY.interpolate({ inputRange: [-120, 0, 120], outputRange: [24, 0, -18], extrapolate: 'clamp' });
  const parallaxScale = scrollY.interpolate({ inputRange: [-120, 0], outputRange: [1.15, 1], extrapolate: 'clamp' });

  // A slow "breathing" pulse on the status dot — a small, continuous cue that the app is
  // actively watching, not a static screenshot.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const dotScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const dotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0.3] });

  // The status card used to always say "No Active Journey" regardless of reality — a real gap in
  // a safety app, since reopening the app during a live journey should surface that immediately.
  // Now it reflects the most recent journey: in progress, or a summary of the last completed one.
  const [recentJourney, setRecentJourney] = useState<any>(null);
  const [isLoadingJourney, setIsLoadingJourney] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const response = await api.get('/journeys');
          if (!cancelled && response.data.success) {
            setRecentJourney(response.data.data[0] || null);
          }
        } catch (err) {
          console.error('Failed to load recent journey for home status', err);
        } finally {
          if (!cancelled) setIsLoadingJourney(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const isActive = recentJourney?.status === 'ACTIVE';
  const statusColor = recentJourney ? STATUS_COLOR[recentJourney.status] || COLORS.textMuted : COLORS.textMuted;

  const quickActions: { label: string; badge: 'contacts' | 'history' | 'call' | 'profile'; route: string }[] = [
    { label: 'Contacts', badge: 'contacts', route: '/(app)/(tabs)/contacts' },
    { label: 'History', badge: 'history', route: '/(app)/(tabs)/journeys' },
    { label: 'Fake Call', badge: 'call', route: '/fake-call' },
    { label: 'Profile', badge: 'profile', route: '/(app)/(tabs)/profile' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >

        {/* Header */}
        <Animated.View style={[styles.header, headerAnim]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.username}>{user?.name?.split(' ')[0] || 'User'}</Text>
          </View>
          <HamburgerMenu />
        </Animated.View>

        {/* Illustrated banner — reflects the real time of day, with clouds drifting by day and
            stars twinkling by night, plus a little traveler always on the move. Shadow lives on
            this outer wrapper and clipping on the inner one — a rounded view can't do both
            itself, since overflow:hidden would clip its own shadow away on iOS. */}
        <Animated.View
          style={[
            styles.bannerShadowWrap,
            { opacity: bannerAnim.opacity, transform: [...bannerAnim.transform, { translateY: parallaxY }, { scale: parallaxScale }] },
          ]}
        >
          <View style={styles.banner}>
            <TimeOfDayScene width={BANNER_WIDTH} height={160} />
            <DriftingClouds width={BANNER_WIDTH} height={160} night={getDayPeriod() === 'night'} />
            <WalkingTraveler width={BANNER_WIDTH} bottom={20} />
          </View>
        </Animated.View>

        {/* Journey Status Card — dynamic, not a static placeholder */}
        <Animated.View style={[styles.statusCard, statusAnim]}>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDotWrap}>
              <Animated.View
                style={[
                  styles.statusDotPulse,
                  { backgroundColor: statusColor, opacity: dotOpacity, transform: [{ scale: dotScale }] },
                ]}
              />
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>
            <Text style={styles.statusLabel}>Status</Text>
          </View>

          {isLoadingJourney ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
          ) : isActive ? (
            <>
              <Text style={styles.statusValue}>Journey in Progress</Text>
              <Text style={styles.statusSub} numberOfLines={1}>→ {recentJourney.destination?.address || 'Unknown destination'}</Text>
              <TouchableOpacity
                style={styles.statusLink}
                onPress={() => router.push(`/(app)/journey/${recentJourney._id}` as any)}
              >
                <Text style={styles.statusLinkText}>View Journey</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </>
          ) : recentJourney ? (
            <>
              <Text style={styles.statusValue}>No Active Journey</Text>
              <Text style={styles.statusSub} numberOfLines={1}>
                Last trip: {recentJourney.name} · {formatRelativeDate(recentJourney.createdAt)}
              </Text>
              <TouchableOpacity
                style={styles.statusLink}
                onPress={() => router.push(`/(app)/journey/${recentJourney._id}` as any)}
              >
                <Text style={styles.statusLinkText}>View Details</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.statusValue}>No Active Journey</Text>
              <Text style={styles.statusSub}>You're currently not on a journey. Start one when you're ready.</Text>
            </>
          )}
        </Animated.View>

        {/* Start Journey CTA — repurposed to jump back into an active journey if one exists */}
        <Animated.View style={ctaAnim}>
          <PressScale
            style={styles.startButton}
            onPress={() =>
              isActive
                ? router.push(`/(app)/journey/${recentJourney._id}` as any)
                : router.push('/(app)/journey/new')
            }
          >
            <Ionicons name={isActive ? 'navigate-circle' : 'navigate'} size={24} color="white" />
            <Text style={styles.startButtonText}>{isActive ? 'View Active Journey' : 'Start a Journey'}</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </PressScale>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={actionsAnim}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <PressScale key={action.label} style={styles.quickActionItem} onPress={() => router.push(action.route as any)}>
                <CategoryBadge type={action.badge} size={60} />
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </PressScale>
            ))}
          </View>
        </Animated.View>

        {/* Rotating Safety Tips */}
        <Animated.View style={tipsAnim}>
          <TipsCarousel />
        </Animated.View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  username: {
    fontSize: 26,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  bannerShadowWrap: {
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOW.medium,
  },
  banner: {
    height: 160,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  statusCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusDotWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  statusDotPulse: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: FONTS.semiBold,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  statusSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  statusLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: SPACING.sm,
  },
  statusLinkText: {
    fontSize: 13,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  startButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    shadowColor: COLORS.accentDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: FONTS.bold,
    flex: 1,
    marginLeft: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quickActionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  tipsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
    ...SHADOW.small,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  tipDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.md,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  tipDotActive: {
    backgroundColor: COLORS.warning,
    width: 16,
  },
});
