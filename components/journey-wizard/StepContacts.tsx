import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContactsConverge } from '../Illustrations';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme/colors';

export function StepContacts({
  contacts,
  selectedIds,
  onToggle,
  onNext,
}: {
  contacts: any[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.root}>
      <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.illustration}>
          <ContactsConverge width={220} height={150} />
        </View>

        <Text style={styles.title}>Who should we notify?</Text>
        <Text style={styles.subtitle}>They'll be alerted if you miss a check-in or send an emergency alert.</Text>

        {contacts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="people-outline" size={20} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>
              You have no trusted contacts yet. Add some from the Contacts tab so someone can be alerted.
            </Text>
          </View>
        ) : (
          <View style={styles.contactsBox}>
            {contacts.map((contact, index) => {
              const selected = selectedIds.has(contact._id);
              return (
                <TouchableOpacity
                  key={contact._id}
                  style={[styles.contactRow, index < contacts.length - 1 && styles.contactRowDivider]}
                  onPress={() => onToggle(contact._id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                >
                  <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                    {selected ? <Ionicons name="checkmark" size={14} color="white" /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  {contact.isPriority ? <Ionicons name="star" size={14} color={COLORS.warning} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Confirm Contacts</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollFlex: { flex: 1 },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  illustration: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: FONTS.extraBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  contactsBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  contactRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  contactName: {
    fontSize: 15,
    fontWeight: FONTS.medium,
    color: COLORS.textPrimary,
  },
  contactPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    height: 54,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: FONTS.bold,
  },
});
