import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Badge, Button, ConfirmDialog, EmptyState, FAB, Input } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useContacts } from '../../hooks/useContacts';
import { createGuardian, deleteGuardian, listGuardians, updateGuardian } from '../../services/guardians';

function initialsOf(name) {
  return (name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function digitsOnly(phone) {
  return (phone ?? '').replace(/[^\d+]/g, '');
}

function GuardianRow({ guardian, onEdit }) {
  const { colors, spacing, radii, typography } = useTheme();
  const { showToast } = useToast();

  const call = () => Linking.openURL(`tel:${digitsOnly(guardian.phone)}`);
  const whatsapp = async () => {
    const url = `whatsapp://send?phone=${digitsOnly(guardian.phone)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      showToast('WhatsApp is not installed on this device', 'error');
      return;
    }
    Linking.openURL(url);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Pressable
        onPress={() => onEdit(guardian)}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${guardian.name}`}
        style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.6 : 1 }]}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: typography.weight.semibold }}>
            {initialsOf(guardian.name)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.medium }}>
              {guardian.name}
            </Text>
            {guardian.isPrimary ? (
              <Badge label="Primary" variant="primary" size="sm" style={{ marginLeft: spacing.sm }} />
            ) : null}
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 }}>
            {guardian.relation ? `${guardian.relation} · ` : ''}
            {guardian.phone}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={call}
        accessibilityRole="button"
        accessibilityLabel={`Call ${guardian.name}`}
        style={({ pressed }) => [
          {
            width: 44,
            height: 44,
            borderRadius: radii.full,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          },
        ]}
      >
        <Text style={{ fontSize: typography.size.lg }}>📞</Text>
      </Pressable>
      <Pressable
        onPress={whatsapp}
        accessibilityRole="button"
        accessibilityLabel={`Message ${guardian.name} on WhatsApp`}
        style={({ pressed }) => [
          {
            width: 44,
            height: 44,
            borderRadius: radii.full,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          },
        ]}
      >
        <Text style={{ fontSize: typography.size.lg }}>💬</Text>
      </Pressable>
    </View>
  );
}

function ModalSheet({ visible, onClose, children, title }) {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}>
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radii.lg,
            borderTopRightRadius: radii.lg,
            maxHeight: '85%',
            paddingTop: spacing.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold }}>
              {title}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.size.lg }}>✕</Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function AddChoiceModal({ visible, onClose, onPickContacts, onPickManual }) {
  const { spacing } = useTheme();

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Add a guardian">
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md }}>
        <Button title="Import from contacts" onPress={onPickContacts} />
        <Button title="Enter manually" variant="secondary" onPress={onPickManual} />
      </View>
    </ModalSheet>
  );
}

function ContactPickerModal({ visible, onClose, onConfirm }) {
  const { colors, spacing, radii, typography } = useTheme();
  const { status, contacts, isLoading, error, load } = useContacts();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setSearch('');
      setSelectedIds(new Set());
      load();
    }
  }, [visible, load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((contact) => contact.name?.toLowerCase().includes(query));
  }, [contacts, search]);

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    const selected = contacts.filter((contact) => selectedIds.has(contact.id));
    setIsSaving(true);
    try {
      await onConfirm(selected);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Import from contacts">
      {isLoading ? (
        <View style={{ padding: spacing.xxl, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : status === 'denied' ? (
        <EmptyState
          icon={<Text style={{ fontSize: 40 }}>🔒</Text>}
          title="Contacts access is off"
          message="Turn on contacts access in Settings to import guardians, or add them manually instead."
          actionLabel="Open Settings"
          onAction={() => Linking.openSettings()}
          style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        />
      ) : error ? (
        <EmptyState
          icon={<Text style={{ fontSize: 40 }}>⚠️</Text>}
          title="Couldn't load contacts"
          message={error}
          actionLabel="Retry"
          onAction={load}
          style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        />
      ) : (
        <>
          <View style={{ paddingHorizontal: spacing.lg }}>
            <Input placeholder="Search contacts" value={search} onChangeText={setSearch} autoCapitalize="none" />
          </View>
          <ScrollView style={{ maxHeight: 320 }}>
            {filtered.length === 0 ? (
              <EmptyState title="No contacts found" message="Try a different search." style={{ paddingVertical: spacing.xl }} />
            ) : (
              filtered.map((contact) => {
                const selected = selectedIds.has(contact.id);
                return (
                  <Pressable
                    key={contact.id}
                    onPress={() => toggle(contact.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={contact.name}
                    style={({ pressed }) => [
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        minHeight: 44,
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.lg,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: radii.sm,
                        borderWidth: 2,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? colors.primary : 'transparent',
                        marginRight: spacing.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selected ? <Text style={{ color: colors.primaryText, fontSize: typography.size.xs }}>✓</Text> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.textPrimary, fontSize: typography.size.md }}>{contact.name}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs }}>
                        {contact.phoneNumbers?.[0]?.number}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
          <View style={{ padding: spacing.lg }}>
            <Button
              title={selectedIds.size > 0 ? `Add ${selectedIds.size} guardian${selectedIds.size > 1 ? 's' : ''}` : 'Select contacts to add'}
              onPress={handleConfirm}
              loading={isSaving}
              disabled={selectedIds.size === 0}
            />
          </View>
        </>
      )}
    </ModalSheet>
  );
}

function GuardianFormModal({ visible, onClose, guardian, onSave, onDelete }) {
  const { colors, spacing } = useTheme();
  const isEditing = Boolean(guardian);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(guardian?.name ?? '');
      setPhone(guardian?.phone ?? '');
      setRelation(guardian?.relation ?? '');
      setIsPrimary(guardian?.isPrimary ?? false);
      setErrors({});
    }
  }, [visible, guardian]);

  const handleSave = async () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = 'Name is required';
    if (!phone.trim()) nextErrors.phone = 'Phone number is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), phone: phone.trim(), relation: relation.trim(), isPrimary });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title={isEditing ? 'Edit guardian' : 'New guardian'}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
        <Input label="Name" value={name} onChangeText={setName} error={errors.name} placeholder="Jane Doe" />
        <Input label="Phone" value={phone} onChangeText={setPhone} error={errors.phone} placeholder="+1 555 0100" keyboardType="phone-pad" />
        <Input label="Relation" value={relation} onChangeText={setRelation} placeholder="Mom, roommate, coworker…" />

        <PrimaryToggle value={isPrimary} onChange={setIsPrimary} />

        <Button title="Save" onPress={handleSave} loading={isSaving} style={{ marginTop: spacing.md }} />

        {isEditing ? (
          <Button
            title="Remove guardian"
            variant="ghost"
            onPress={() => setConfirmDeleteVisible(true)}
            textStyle={{ color: colors.danger }}
            style={{ marginTop: spacing.sm }}
          />
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Remove guardian?"
        message={guardian?.name ? `${guardian.name} will no longer be notified about your journeys.` : undefined}
        confirmLabel="Remove"
        destructive
        onConfirm={async () => {
          setConfirmDeleteVisible(false);
          await onDelete(guardian);
        }}
        onCancel={() => setConfirmDeleteVisible(false)}
      />
    </ModalSheet>
  );
}

function PrimaryToggle({ value, onChange }) {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      accessibilityLabel="Primary guardian"
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 44,
          marginBottom: spacing.md,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: radii.sm,
          borderWidth: 2,
          borderColor: value ? colors.primary : colors.border,
          backgroundColor: value ? colors.primary : 'transparent',
          marginRight: spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value ? <Text style={{ color: colors.primaryText, fontSize: typography.size.xs }}>✓</Text> : null}
      </View>
      <Text style={{ color: colors.textPrimary, fontSize: typography.size.md }}>Primary guardian</Text>
    </Pressable>
  );
}

export default function GuardiansScreen() {
  const { colors, spacing } = useTheme();
  const { showToast } = useToast();

  const [guardians, setGuardians] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [addChoiceVisible, setAddChoiceVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState(null);

  const fetchGuardians = useCallback(async () => {
    setLoadState('loading');
    try {
      const data = await listGuardians();
      setGuardians(data);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    fetchGuardians();
  }, [fetchGuardians]);

  const openManualAdd = () => {
    setAddChoiceVisible(false);
    setEditingGuardian(null);
    setFormVisible(true);
  };

  const openEdit = (guardian) => {
    setEditingGuardian(guardian);
    setFormVisible(true);
  };

  const handleImportConfirm = async (selectedContacts) => {
    try {
      await Promise.all(
        selectedContacts.map((contact) =>
          createGuardian({
            name: contact.name,
            phone: contact.phoneNumbers[0].number,
            relation: '',
            isPrimary: false,
            contactId: contact.id,
          })
        )
      );
      setPickerVisible(false);
      showToast(`Added ${selectedContacts.length} guardian${selectedContacts.length > 1 ? 's' : ''}`, 'success');
      fetchGuardians();
    } catch {
      showToast('Could not add guardians. Try again.', 'error');
    }
  };

  const handleFormSave = async (payload) => {
    try {
      if (editingGuardian) {
        await updateGuardian(editingGuardian._id, payload);
        showToast('Guardian updated', 'success');
      } else {
        await createGuardian(payload);
        showToast('Guardian added', 'success');
      }
      setFormVisible(false);
      fetchGuardians();
    } catch {
      showToast('Could not save guardian. Try again.', 'error');
    }
  };

  const handleDelete = async (guardian) => {
    try {
      await deleteGuardian(guardian._id);
      setFormVisible(false);
      showToast('Guardian removed', 'success');
      fetchGuardians();
    } catch {
      showToast('Could not remove guardian. Try again.', 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {loadState === 'loading' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : loadState === 'error' ? (
        <EmptyState
          icon={<Text style={{ fontSize: 40 }}>⚠️</Text>}
          title="Couldn't load guardians"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={fetchGuardians}
          style={{ flex: 1 }}
        />
      ) : guardians.length === 0 ? (
        <EmptyState
          icon={<Text style={{ fontSize: 40 }}>🛡️</Text>}
          title="No guardians yet"
          message="Add 2-3 people who should know when you're travelling alone."
          actionLabel="Add a guardian"
          onAction={() => setAddChoiceVisible(true)}
          style={{ flex: 1 }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
          {guardians.map((guardian) => (
            <GuardianRow key={guardian._id} guardian={guardian} onEdit={openEdit} />
          ))}
        </ScrollView>
      )}

      {loadState === 'ready' && guardians.length > 0 ? (
        <FAB
          icon={<Text style={{ fontSize: 22, color: colors.primaryText }}>+</Text>}
          onPress={() => setAddChoiceVisible(true)}
          accessibilityLabel="Add guardian"
          style={{ position: 'absolute', bottom: spacing.xl, right: spacing.xl }}
        />
      ) : null}

      <AddChoiceModal
        visible={addChoiceVisible}
        onClose={() => setAddChoiceVisible(false)}
        onPickContacts={() => {
          setAddChoiceVisible(false);
          setPickerVisible(true);
        }}
        onPickManual={openManualAdd}
      />

      <ContactPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} onConfirm={handleImportConfirm} />

      <GuardianFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        guardian={editingGuardian}
        onSave={handleFormSave}
        onDelete={handleDelete}
      />
    </View>
  );
}
