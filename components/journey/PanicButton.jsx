import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

const HOLD_DURATION_MS = 1400;
const SIZE = 88;

export function PanicButton({ onActivate, isBusy }) {
  const { colors, spacing, typography } = useTheme();
  const progress = useSharedValue(0);
  const [isHolding, setIsHolding] = useState(false);
  const hapticTimers = useRef([]);

  const clearHapticTimers = () => {
    hapticTimers.current.forEach(clearTimeout);
    hapticTimers.current = [];
  };

  const fireActivate = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsHolding(false);
    onActivate?.();
  };

  const handlePressIn = () => {
    if (isBusy) return;
    setIsHolding(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    hapticTimers.current.push(
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), HOLD_DURATION_MS * 0.5),
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), HOLD_DURATION_MS * 0.85)
    );

    progress.value = withTiming(1, { duration: HOLD_DURATION_MS }, (finished) => {
      if (finished) {
        runOnJS(fireActivate)();
      }
    });
  };

  const handlePressOut = () => {
    if (isBusy) return;
    clearHapticTimers();
    cancelAnimation(progress);
    progress.value = withTiming(0, { duration: 200 });
    setIsHolding(false);
  };

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
    opacity: 0.9,
  }));

  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isBusy}
        accessibilityRole="button"
        accessibilityLabel="Hold to send an emergency alert"
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          borderWidth: 3,
          borderColor: colors.danger,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: colors.dangerSoft,
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: SIZE,
              height: SIZE,
              borderRadius: SIZE / 2,
              backgroundColor: colors.danger,
            },
            fillStyle,
          ]}
        />
        <Text
          style={{
            color: isHolding ? colors.dangerText : colors.danger,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.bold,
          }}
        >
          {isBusy ? '…' : 'SOS'}
        </Text>
      </Pressable>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.size.xs,
          marginTop: spacing.sm,
          textAlign: 'center',
        }}
      >
        {isBusy ? 'Sending alert…' : 'Hold to alert guardians'}
      </Text>
    </View>
  );
}
