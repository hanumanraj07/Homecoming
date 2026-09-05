import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SunHillsBanner } from '../../../components/Illustrations';
import { HamburgerMenu } from '../../../components/HamburgerMenu';
import { COLORS, FONTS, RADIUS, SPACING } from '../../../theme/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const profileFields = [
    { icon: 'person-outline', label: 'Full Name', value: user?.name },
    { icon: 'mail-outline', label: 'Email', value: user?.email },
    { icon: 'call-outline', label: 'Phone', value: user?.phone },
  ];

  const menuItems: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; route: string }[] = [
    { icon: 'notifications-outline', label: 'Notifications', color: COLORS.primary, route: '/(app)/notifications' },
    { icon: 'shield-outline', label: 'Privacy & Security', color: COLORS.success, route: '/(app)/privacy' },
    { icon: 'help-circle-outline', label: 'Help & Support', color: COLORS.warning, route: '/(app)/help' },
    { icon: 'information-circle-outline', label: 'About Homecoming', color: COLORS.textSecondary, route: '/(app)/about' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Illustrated banner behind the avatar */}
        <View style={styles.banner}>
          <SunHillsBanner height={120} />
          <View style={styles.menuOverlay}>
            <HamburgerMenu />
          </View>
        </View>

        {/* Avatar + Name */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.displayName}>{user?.name || 'User'}</Text>
          <Text style={styles.displayEmail}>{user?.email}</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Account Details</Text>
          <TouchableOpacity style={styles.editLink} onPress={() => router.push('/(app)/edit-profile')} hitSlop={8}>
            <Ionicons name="pencil-outline" size={14} color={COLORS.primary} />
            <Text style={styles.editLinkText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {profileFields.map((field, index) => (
            <View key={field.label} style={[styles.infoRow, index < profileFields.length - 1 && styles.infoRowBorder]}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name={field.icon as any} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{field.label}</Text>
                <Text style={styles.infoValue}>{field.value || '—'}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <Text style={styles.sectionLabel}>Settings</Text>
        <View style={styles.card}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, index < menuItems.length - 1 && styles.infoRowBorder]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIconWrapper, { backgroundColor: item.color + '22' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

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
  banner: {
    height: 120,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  menuOverlay: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: -40,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 4,
    borderColor: COLORS.bg,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: FONTS.bold,
  },
  displayName: {
    fontSize: 22,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  displayEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  editLinkText: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger + '15',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: FONTS.semiBold,
    marginLeft: SPACING.sm,
  },
});
