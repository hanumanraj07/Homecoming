import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useState } from 'react';

export function useCamera() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();

  const [facing, setFacing] = useState('back');
  const [torchOn, setTorchOn] = useState(false);
  const [zoom, setZoom] = useState(0);

  const isLoading = cameraPermission === null || microphonePermission === null;
  const isGranted = Boolean(cameraPermission?.granted && microphonePermission?.granted);
  const isDenied = Boolean(
    (cameraPermission && !cameraPermission.granted && !cameraPermission.canAskAgain) ||
      (microphonePermission && !microphonePermission.granted && !microphonePermission.canAskAgain)
  );

  const requestPermissions = async () => {
    const [cam, mic] = await Promise.all([requestCameraPermission(), requestMicrophonePermission()]);
    return Boolean(cam.granted && mic.granted);
  };

  const toggleFacing = () => setFacing((current) => (current === 'back' ? 'front' : 'back'));
  const toggleTorch = () => setTorchOn((current) => !current);
  const adjustZoom = (delta) => setZoom((current) => Math.min(1, Math.max(0, current + delta)));

  return {
    isLoading,
    isGranted,
    isDenied,
    requestPermissions,
    facing,
    toggleFacing,
    torchOn,
    toggleTorch,
    zoom,
    adjustZoom,
  };
}
