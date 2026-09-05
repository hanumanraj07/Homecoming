import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CategoryBadge, SunHillsBanner, DriftingClouds, WalkingTraveler } from '../../../components/Illustrations';
import { HamburgerMenu } from '../../../components/HamburgerMenu';
import { COLORS, FONTS, RADIUS, SPACING, SCREEN_WIDTH } from '../../../theme/colors';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const BANNER_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;

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

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const headerAnim = useRise(0);
  const bannerAnim = useRise(90);
  const statusAnim = useRise(160);
  const ctaAnim = useRise(230);
  const actionsAnim = useRise(300);
  const tipsAnim = useRise(370);

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

  const quickActions: { label: string; badge: 'contacts' | 'history' | 'call' | 'profile'; route: string }[] = [
    { label: 'Contacts', badge: 'contacts', route: '/(app)/(tabs)/contacts' },
    { label: 'History', badge: 'history', route: '/(app)/(tabs)/journeys' },
    { label: 'Fake Call', badge: 'call', route: '/fake-call' },
    { label: 'Profile', badge: 'profile', route: '/(app)/(tabs)/profile' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View style={[styles.header, headerAnim]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.username}>{user?.name?.split(' ')[0] || 'User'}</Text>
          </View>
          <HamburgerMenu />
        </Animated.View>

        {/* Illustrated banner — a little scene that's actually alive: clouds drift, a traveler walks */}
        <Animated.View style={[styles.banner, bannerAnim]}>
          <SunHillsBanner height={130} />
          <DriftingClouds width={BANNER_WIDTH} height={130} />
          <WalkingTraveler width={BANNER_WIDTH} bottom={16} />
        </Animated.View>

        {/* Safety Status Card */}
        <Animated.View style={[styles.statusCard, statusAnim]}>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDotWrap}>
              <Animated.View style={[styles.statusDotPulse, { opacity: dotOpacity, transform: [{ scale: dotScale }] }]} />
              <View style={styles.statusDot} />
            </View>
            <Text style={styles.statusLabel}>Status</Text>
          </View>
          <Text style={styles.statusValue}>No Active Journey</Text>
          <Text style={styles.statusSub}>You're currently not on a journey. Start one when you're ready.</Text>
        </Animated.View>

        {/* Start Journey CTA */}
        <Animated.View style={ctaAnim}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/(app)/journey/new')}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate" size={24} color="white" />
            <Text style={styles.startButtonText}>Start a Journey</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={actionsAnim}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickActionItem}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.8}
              >
                <CategoryBadge type={action.badge} size={60} />
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Tips Card */}
        <Animated.View style={[styles.tipsCard, tipsAnim]}>
          <Ionicons name="bulb-outline" size={20} color={COLORS.warning} style={{ marginBottom: 8 }} />
          <Text style={styles.tipTitle}>Safety Tip</Text>
          <Text style={styles.tipText}>
            Always add at least one trusted contact before starting a journey. They'll be alerted if you miss a check-in.
          </Text>
        </Animated.View>

      </ScrollView>
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
  banner: {
    height: 130,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  statusCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.textMuted,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
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
  startButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
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
});
