import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function CaptureControls({
  facing,
  onToggleFacing,
  torchOn,
  onToggleTorch,
  zoom,
  onZoomIn,
  onZoomOut,
  isRecording,
  onCapturePressIn,
  onCapturePress,
  onCaptureLongPress,
  onCaptureRelease,
}) {
  const { spacing, radii } = useTheme();

  return (
    <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, paddingTop: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        <IconButton label="Flip camera" icon="🔄" onPress={onToggleFacing} accessibilityLabel={`Switch to ${facing === 'back' ? 'front' : 'back'} camera`} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton label="Zoom out" icon="−" onPress={onZoomOut} accessibilityLabel="Zoom out" />
          <Text style={{ color: '#fff', marginHorizontal: spacing.sm, minWidth: 36, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </Text>
          <IconButton label="Zoom in" icon="+" onPress={onZoomIn} accessibilityLabel="Zoom in" />
        </View>
        <IconButton
          label="Torch"
          icon={torchOn ? '🔦' : '💡'}
          onPress={onToggleTorch}
          accessibilityLabel={torchOn ? 'Turn off torch' : 'Turn on torch'}
        />
      </View>

      <View style={{ alignItems: 'center' }}>
        <Pressable
          onPressIn={onCapturePressIn}
          onPress={onCapturePress}
          onLongPress={onCaptureLongPress}
          onPressOut={onCaptureRelease}
          delayLongPress={350}
          accessibilityRole="button"
          accessibilityLabel={isRecording ? 'Stop recording' : 'Capture photo, hold for video'}
          style={{
            width: 76,
            height: 76,
            borderRadius: radii.full,
            borderWidth: 4,
            borderColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: isRecording ? 30 : 60,
              height: isRecording ? 30 : 60,
              borderRadius: isRecording ? radii.sm : radii.full,
              backgroundColor: isRecording ? '#E5484D' : '#fff',
            }}
          />
        </Pressable>
      </View>
    </View>
  );
}

function IconButton({ icon, onPress, accessibilityLabel }) {
  const { radii } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: radii.full,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 18 }}>{icon}</Text>
    </Pressable>
  );
}
