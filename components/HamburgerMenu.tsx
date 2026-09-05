import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing, useWindowDimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/colors';

const MENU_ITEMS: { icon: keyof typeof Ionicons.glyphMap; label: string; sub: string; route: string }[] = [
  { icon: 'stats-chart-outline', label: 'Insights', sub: 'Your journey stats and trends', route: '/(app)/insights' },
  { icon: 'bookmark-outline', label: 'Journey Templates', sub: 'Manage your saved quick-start trips', route: '/(app)/templates' },
  { icon: 'star-outline', label: 'Saved Places', sub: 'Manage your favorite destinations', route: '/(app)/favorites' },
];

const PANEL_WIDTH_RATIO = 0.78;

// Self-contained: renders both the trigger button and the slide-in panel, so any screen just
// drops in <HamburgerMenu /> without wiring up shared state. A lightweight custom panel rather
// than expo-router's Drawer — that dependency (react-native-drawer-layout) broke the app earlier
// in this project from a Reanimated/Worklets version mismatch, so navigation here stays on plain
// Modal + Animated instead.
export function HamburgerMenu() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const panelWidth = width * PANEL_WIDTH_RATIO;
  const [visible, setVisible] = useState(false);
  const slide = useRef(new Animated.Value(0)).current;

  const open = () => {
    setVisible(true);
    slide.setValue(0);
    Animated.timing(slide, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const close = (after?: () => void) => {
    Animated.timing(slide, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      after?.();
    });
  };

  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [panelWidth, 0] });
  const backdropOpacity = slide.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={open} hitSlop={8}>
        <Ionicons name="menu" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="none" onRequestClose={() => close()}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => close()}>
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
          </Pressable>

          <Animated.View style={[styles.panel, { width: panelWidth, transform: [{ translateX }] }]}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>More</Text>
              <TouchableOpacity onPress={() => close()} hitSlop={8}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.menuRow}
                onPress={() => close(() => router.push(item.route as any))}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    backgroundColor: COLORS.bg,
    paddingTop: 56,
    paddingHorizontal: SPACING.lg,
    borderTopLeftRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.xl,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.tintGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  menuSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
