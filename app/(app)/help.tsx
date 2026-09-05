import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme/colors';

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'How does Homecoming know if something is wrong?',
    answer: 'While a journey is active, you check in periodically. If you miss a check-in, a countdown appears on screen and, if ignored, an emergency text is prepared to your trusted contacts automatically.',
  },
  {
    question: 'Does the Emergency button send messages automatically?',
    answer: "It opens your phone's Messages app pre-filled with your trusted contacts and current location — you still need to tap Send. This is a platform limitation: apps can't send SMS silently without your confirmation.",
  },
  {
    question: 'Why does background location need a special app build?',
    answer: "Expo Go (the app you're likely using to test this) doesn't support background location tracking on a real device. Foreground tracking, check-ins, and emergency alerts all work normally — only tracking while the app is fully backgrounded needs a custom build.",
  },
  {
    question: 'Can I use Homecoming without starting a journey?',
    answer: 'Yes — the Safety tab has a standalone SOS button and quick tools (Fake Call, Share Location) that work any time, no active journey required.',
  },
  {
    question: 'What happens to my data if I delete my account?',
    answer: 'Deleting your account permanently removes your profile, trusted contacts, and journey history. This cannot be undone.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <TouchableOpacity
              key={faq.question}
              style={styles.faqCard}
              onPress={() => setOpenIndex(isOpen ? null : index)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
              </View>
              {isOpen && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionLabel, { marginTop: SPACING.xl }]}>Still Need Help?</Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => Linking.openURL('mailto:support@homecoming.app?subject=Homecoming%20Support')}
        >
          <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
          <Text style={styles.contactButtonText}>Email Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  faqCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  faqAnswer: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginTop: SPACING.sm,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 52,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
});
