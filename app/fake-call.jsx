import { StyleSheet, Text, View } from 'react-native';

export default function FakeCallScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fake call</Text>
      <Text style={styles.subtitle}>Built out in Phase 9.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { marginTop: 8, textAlign: 'center' },
});
