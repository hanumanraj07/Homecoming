import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme/colors';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Name and phone are required.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await api.put('/auth/me', { name: name.trim(), phone: phone.trim() });
      if (response.data.success) {
        await updateUser(response.data.user);
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={COLORS.textMuted} />
        </View>

        <Text style={styles.label}>Phone</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color={COLORS.textMuted} />
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={COLORS.textMuted} keyboardType="phone-pad" />
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.disabledValue}>{user?.email}</Text>
        </View>
        <Text style={styles.hint}>Email can't be changed here.</Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
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
  headerTitle: { fontSize: 17, fontWeight: FONTS.bold, color: COLORS.textPrimary },
  scroll: { padding: SPACING.lg },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 52,
    gap: SPACING.sm,
  },
  inputWrapperDisabled: {
    backgroundColor: COLORS.bgElevated,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  disabledValue: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 15,
  },
  hint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: FONTS.bold,
  },
});
