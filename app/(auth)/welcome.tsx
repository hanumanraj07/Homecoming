import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, Easing, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HeroScene, DriftingClouds } from '../../components/Illustrations';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Entrance: the scene settles in first, then the copy and button rise into place.
  const sceneAnim = useRef(new Animated.Value(0)).current;
  const copyAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(140, [
      Animated.timing(sceneAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(copyAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(ctaAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [sceneAnim, copyAnim, ctaAnim]);

  const rise = (value: Animated.Value, distance: number) => ({
    opacity: value,
    transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.hero,
          {
            opacity: sceneAnim,
            transform: [{ scale: sceneAnim.interpolate({ inputRange: [0, 1], outputRange: [1.08, 1] }) }],
          },
        ]}
      >
        <HeroScene height={420} />
        <DriftingClouds width={width} />
      </Animated.View>

      <View style={styles.sheet}>
        <Animated.View style={[styles.copy, rise(copyAnim, 24)]}>
          <Text style={styles.title}>WELCOME TO{'\n'}HOMECOMING</Text>
          <Text style={styles.subtitle}>
            Start a journey, share it with people you trust, and let them know the moment you're home safe.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.ctaWrap, rise(ctaAnim, 18)]}>
          <TouchableOpacity style={styles.cta} onPress={() => router.push('/(auth)/login')} activeOpacity={0.9}>
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.linkRow}>
            <Text style={styles.linkText}>New here? </Text>
            <Text style={[styles.linkText, styles.linkHighlight]}>Create an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
  },
  hero: {
    height: 420,
    overflow: 'hidden',
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -36,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  copy: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: FONTS.extraBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: SPACING.md,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  ctaWrap: {
    width: '100%',
    alignItems: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    height: 56,
    width: '100%',
    marginTop: SPACING.xl,
  },
  ctaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: FONTS.bold,
  },
  linkRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  linkHighlight: {
    color: COLORS.primary,
    fontWeight: FONTS.semiBold,
  },
});
