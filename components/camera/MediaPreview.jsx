import { ResizeMode, Video } from 'expo-av';
import { Image, View } from 'react-native';
import { Button } from '../ui';
import { useTheme } from '../../context/ThemeContext';

export function MediaPreview({ uri, type, isUploading, uploadProgress, onRetake, onUse }) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flex: 1 }}>
        {type === 'video' ? (
          <Video
            source={{ uri }}
            style={{ flex: 1 }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay
          />
        ) : (
          <Image source={{ uri }} style={{ flex: 1 }} resizeMode="contain" />
        )}
      </View>

      <View style={{ padding: spacing.xl, backgroundColor: colors.background }}>
        {isUploading ? (
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.surfaceAlt,
              overflow: 'hidden',
              marginBottom: spacing.lg,
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.round(uploadProgress * 100)}%`,
                backgroundColor: colors.primary,
              }}
            />
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button title="Retake" variant="secondary" onPress={onRetake} disabled={isUploading} style={{ flex: 1 }} />
          <Button
            title={isUploading ? 'Uploading…' : 'Use'}
            onPress={onUse}
            loading={isUploading}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>
  );
}
