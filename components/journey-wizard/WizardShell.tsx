import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../theme/colors';

const STEP_LABELS = ['Destination', 'Route', 'Contacts', 'Review'];

// Every step's content rises + fades in on arrival — a light, consistent transition layered on
// top of each step's own, more elaborate illustration animation (which replays every time the
// step remounts, since it's keyed on the step index).
function useStepEnterAnimation(step: number) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [step, progress]);

  return {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };
}

export function WizardShell({
  step,
  onBack,
  children,
}: {
  step: number;
  onBack: () => void;
  children: React.ReactNode;
}) {
  const enterStyle = useStepEnterAnimation(step);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.dots}>
          {STEP_LABELS.map((label, index) => (
            <View key={label} style={styles.dotWrap}>
              <View style={[styles.dot, index === step && styles.dotActive, index < step && styles.dotDone]} />
            </View>
          ))}
        </View>

        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.stepLabel}>
        Step {step + 1} of {STEP_LABELS.length} · {STEP_LABELS[step]}
      </Text>

      <Animated.View key={step} style={[styles.content, enterStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  dotWrap: {
    padding: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 20,
  },
  dotDone: {
    backgroundColor: COLORS.primary,
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.sm,
  },
  content: {
    flex: 1,
  },
});
