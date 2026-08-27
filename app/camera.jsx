import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';
import { Button, EmptyState } from '../components/ui';
import { CaptureControls } from '../components/camera/CaptureControls';
import { MediaPreview } from '../components/camera/MediaPreview';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useCamera } from '../hooks/useCamera';
import { uploadMedia } from '../services/media';

export default function CameraScreen() {
  const { colors, spacing } = useTheme();
  const { showToast } = useToast();
  const camera = useCamera();
  const cameraRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const takePhoto = async () => {
    if (!cameraRef.current || isRecording) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      setCapturedMedia({ uri: photo.uri, type: 'photo' });
    } catch {
      showToast('Could not capture photo', 'error');
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({ videoQuality: '480p' });
      if (video?.uri) {
        setCapturedMedia({ uri: video.uri, type: 'video' });
      }
    } catch {
      showToast('Could not record video', 'error');
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (isRecording) {
      cameraRef.current?.stopRecording();
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.5,
    });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    setCapturedMedia({ uri: asset.uri, type: asset.type === 'video' ? 'video' : 'photo' });
  };

  const handleUse = async () => {
    if (!capturedMedia) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      await uploadMedia({
        uri: capturedMedia.uri,
        type: capturedMedia.type,
        onProgress: setUploadProgress,
      });
      showToast('Media uploaded', 'success');
      router.back();
    } catch {
      showToast('Upload failed. Try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (camera.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (camera.isDenied) {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 40 }}>🔒</Text>}
        title="Camera access is off"
        message="Turn on camera and microphone access in Settings to capture incident evidence."
        actionLabel="Open Settings"
        onAction={() => Linking.openSettings()}
        style={{ flex: 1, backgroundColor: colors.background }}
      />
    );
  }

  if (!camera.isGranted) {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 40 }}>📷</Text>}
        title="Camera access needed"
        message="Homecoming needs your camera and microphone to capture photo and video evidence."
        actionLabel="Allow access"
        onAction={camera.requestPermissions}
        style={{ flex: 1, backgroundColor: colors.background }}
      />
    );
  }

  if (capturedMedia) {
    return (
      <MediaPreview
        uri={capturedMedia.uri}
        type={capturedMedia.type}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onRetake={() => setCapturedMedia(null)}
        onUse={handleUse}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={camera.facing}
        enableTorch={camera.torchOn}
        zoom={camera.zoom}
        mode={isRecording ? 'video' : 'picture'}
      />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <CaptureControls
          facing={camera.facing}
          onToggleFacing={camera.toggleFacing}
          torchOn={camera.torchOn}
          onToggleTorch={camera.toggleTorch}
          zoom={camera.zoom}
          onZoomIn={() => camera.adjustZoom(0.1)}
          onZoomOut={() => camera.adjustZoom(-0.1)}
          isRecording={isRecording}
          onCapturePress={takePhoto}
          onCaptureLongPress={startRecording}
          onCaptureRelease={stopRecording}
        />
        <View style={{ alignItems: 'center', paddingBottom: spacing.lg }}>
          <Button title="Choose from gallery" variant="ghost" onPress={pickFromGallery} textStyle={{ color: '#fff' }} />
        </View>
      </View>
    </View>
  );
}
