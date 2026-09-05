import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { api } from '../../../services/api';
// This SDK version's top-level `expo-contacts` export deliberately throws on the old flat API
// (getContactsAsync, etc.) — it's kept only as a stub pointing at the new class-based API or,
// for the same functions this screen already uses, `expo-contacts/legacy`.
import * as Contacts from 'expo-contacts/legacy';
import { Ionicons } from '@expo/vector-icons';
import { PeopleEmptyState } from '../../../components/Illustrations';
import { HamburgerMenu } from '../../../components/HamburgerMenu';
import { COLORS, FONTS, RADIUS, SPACING } from '../../../theme/colors';

export default function ContactsScreen() {
  const [trustedContacts, setTrustedContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<any[]>([]);
  const [isLoadingDeviceContacts, setIsLoadingDeviceContacts] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTrustedContacts();
  }, []);

  const fetchTrustedContacts = async () => {
    try {
      const response = await api.get('/contacts');
      if (response.data.success) {
        setTrustedContacts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch contacts', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePriority = async (contact: any) => {
    const nextValue = !contact.isPriority;
    // Optimistic update so the star responds instantly rather than waiting on the round trip.
    setTrustedContacts((prev) => prev.map((c) => (c._id === contact._id ? { ...c, isPriority: nextValue } : c)));
    try {
      await api.put(`/contacts/${contact._id}`, { isPriority: nextValue });
    } catch (error) {
      setTrustedContacts((prev) => prev.map((c) => (c._id === contact._id ? { ...c, isPriority: !nextValue } : c)));
      Alert.alert('Error', 'Failed to update contact. Try again.');
    }
  };

  const handleCallContact = (contact: any) => {
    if (!contact.phone) return;
    Linking.openURL(`tel:${contact.phone}`);
  };

  const handleDeleteContact = (contact: any) => {
    Alert.alert(
      'Remove Contact',
      `Remove ${contact.name} from your trusted contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/contacts/${contact._id}`);
              setTrustedContacts((prev) => prev.filter((c) => c._id !== contact._id));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove contact. Try again.');
            }
          },
        },
      ]
    );
  };

  const openPicker = async () => {
    setSearch('');
    setSelectedIds(new Set());
    setPickerVisible(true);
    setIsLoadingDeviceContacts(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setPickerVisible(false);
        Alert.alert('Permission Denied', 'Cannot access contacts without permission.');
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });
      const withPhones = data.filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0);
      setDeviceContacts(withPhones);
    } catch (error) {
      setPickerVisible(false);
      Alert.alert('Error', 'Failed to load device contacts.');
    } finally {
      setIsLoadingDeviceContacts(false);
    }
  };

  const filteredDeviceContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return deviceContacts;
    return deviceContacts.filter((c) => c.name?.toLowerCase().includes(query));
  }, [deviceContacts, search]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImportSelected = async () => {
    const selected = deviceContacts.filter((c) => selectedIds.has(c.id));
    if (selected.length === 0) return;

    setIsSaving(true);
    let importedCount = 0;
    for (const contact of selected) {
      try {
        await api.post('/contacts', {
          name: contact.name || 'Unknown',
          phone: contact.phoneNumbers![0].number,
          relationship: 'Friend',
          isTrusted: true,
        });
        importedCount++;
      } catch (err) {
        console.error('Failed to import contact', err);
      }
    }
    setIsSaving(false);
    setPickerVisible(false);
    fetchTrustedContacts();
    Alert.alert('Success', `Imported ${importedCount} contact${importedCount === 1 ? '' : 's'}.`);
  };

  const renderContact = ({ item }: { item: any }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>{item.name?.charAt(0)?.toUpperCase()}</Text>
      </View>
      <View style={styles.contactInfo}>
        <View style={styles.contactNameRow}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.isPriority ? <Ionicons name="star" size={13} color={COLORS.warning} /> : null}
        </View>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleTogglePriority(item)}
        style={styles.iconButton}
        hitSlop={8}
        accessibilityLabel={item.isPriority ? `Unmark ${item.name} as priority` : `Mark ${item.name} as priority`}
      >
        <Ionicons name={item.isPriority ? 'star' : 'star-outline'} size={20} color={COLORS.warning} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleCallContact(item)}
        style={styles.iconButton}
        hitSlop={8}
        accessibilityLabel={`Call ${item.name}`}
      >
        <Ionicons name="call-outline" size={20} color={COLORS.success} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDeleteContact(item)}
        style={styles.iconButton}
        hitSlop={8}
        accessibilityLabel={`Remove ${item.name}`}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

  const renderPickerRow = ({ item }: { item: any }) => {
    const selected = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        style={styles.pickerRow}
        onPress={() => toggleSelected(item.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
      >
        <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
          {selected ? <Ionicons name="checkmark" size={14} color="white" /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pickerName}>{item.name}</Text>
          <Text style={styles.pickerPhone}>{item.phoneNumbers?.[0]?.number}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Trusted Contacts</Text>
          <HamburgerMenu />
        </View>
        <Text style={styles.pageSubtitle}>People who will be notified during your journeys</Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : trustedContacts.length > 0 ? (
        <FlatList
          data={trustedContacts}
          keyExtractor={(item) => item._id}
          renderItem={renderContact}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <PeopleEmptyState height={150} />
          <Text style={styles.emptyTitle}>No contacts yet</Text>
          <Text style={styles.emptySubtitle}>Import your trusted contacts from your phone to get started.</Text>
        </View>
      )}

      {/* Import Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.importButton} onPress={openPicker}>
          <Ionicons name="download-outline" size={20} color="white" />
          <Text style={styles.importButtonText}>Import from Device Contacts</Text>
        </TouchableOpacity>
      </View>

      {/* Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Import Contacts</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {isLoadingDeviceContacts ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : (
              <>
                <View style={styles.searchWrapper}>
                  <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search contacts"
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="none"
                  />
                </View>

                {filteredDeviceContacts.length === 0 ? (
                  <View style={styles.modalLoading}>
                    <Text style={styles.emptySubtitle}>No contacts found.</Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredDeviceContacts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPickerRow}
                    style={{ maxHeight: 360 }}
                    keyboardShouldPersistTaps="handled"
                  />
                )}

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.importButton, selectedIds.size === 0 && styles.importButtonDisabled]}
                    onPress={handleImportSelected}
                    disabled={selectedIds.size === 0 || isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.importButtonText}>
                        {selectedIds.size > 0 ? `Import ${selectedIds.size} selected` : 'Select contacts to import'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  contactCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  contactAvatarText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: FONTS.bold,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  contactPhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 4,
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  importButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  importButtonDisabled: {
    opacity: 0.5,
  },
  importButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: FONTS.semiBold,
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '85%',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  modalLoading: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    minHeight: 52,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pickerName: {
    fontSize: 15,
    fontWeight: FONTS.medium,
    color: COLORS.textPrimary,
  },
  pickerPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalFooter: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
});
