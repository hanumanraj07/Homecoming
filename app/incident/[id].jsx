import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { Badge, Button, Card, EmptyState } from '../../components/ui';
import { resolveMediaUrl } from '../../constants/config';
import { useTheme } from '../../context/ThemeContext';
import { getIncident } from '../../services/incidents';

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, spacing, typography } = useTheme();

  const [incident, setIncident] = useState(null);
  const [loadState, setLoadState] = useState('loading');

  const fetchIncident = async () => {
    setLoadState('loading');
    try {
      const data = await getIncident(id);
      setIncident(data);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  if (loadState === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (loadState === 'error' || !incident) {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 40 }}>⚠️</Text>}
        title="Couldn't load this report"
        message="Check your connection and try again."
        actionLabel="Retry"
        onAction={fetchIncident}
        style={{ flex: 1, backgroundColor: colors.background }}
      />
    );
  }

  const createdAt = new Date(incident.createdAt).toLocaleString();
  const isSos = incident.type === 'sos';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
        <Text style={{ fontSize: 48 }}>{isSos ? '🆘' : '📍'}</Text>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xl,
            fontWeight: typography.weight.bold,
            marginTop: spacing.sm,
          }}
        >
          {isSos ? 'Alert recorded' : 'Report recorded'}
        </Text>
        <Badge label={isSos ? 'SOS' : 'Unsafe spot'} variant={isSos ? 'danger' : 'warning'} style={{ marginTop: spacing.sm }} />
      </View>

      {incident.mediaUrls?.length > 0 ? (
        <Card padded={false} style={{ marginBottom: spacing.lg, overflow: 'hidden' }}>
          <Image source={{ uri: resolveMediaUrl(incident.mediaUrls[0]) }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
        </Card>
      ) : null}

      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs }}>LOCATION</Text>
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, marginTop: 2 }}>
          {incident.location?.address || `${incident.location?.lat.toFixed(4)}, ${incident.location?.lng.toFixed(4)}`}
        </Text>

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs, marginTop: spacing.md }}>TIME</Text>
        <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, marginTop: 2 }}>{createdAt}</Text>

        {incident.note ? (
          <>
            <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs, marginTop: spacing.md }}>NOTE</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, marginTop: 2 }}>{incident.note}</Text>
          </>
        ) : null}
      </Card>

      <Button title="Back to home" onPress={() => router.replace('/')} />
    </ScrollView>
  );
}
