import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { createIncident } from '../../services/incidents';
import { uploadMedia } from '../../services/media';

const CAMERA_READY_TIMEOUT_MS = 2500;

export default function NewIncidentScreen() {
  const { journeyId } = useLocalSearchParams();
  const { spacing, typography } = useTheme();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const cameraRef = useRef(null);
  const cameraReadyRef = useRef(false);
  const [status, setStatus] = useState('working');
  const [statusMessage, setStatusMessage] = useState('Getting your location…');

  useEffect(() => {
    if (cameraPermission === null) {
      requestCameraPermission();
    }
  }, [cameraPermission]);

  const runFlow = async () => {
    setStatus('working');
    setStatusMessage('Getting your location…');

    try {
      let location = null;
      try {
        await Location.requestForegroundPermissionsAsync();
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const [address] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: address ? [address.name, address.street, address.city].filter(Boolean).join(', ') : '',
        };
      } catch {
        location = { lat: 0, lng: 0, address: '' };
      }

      let mediaUrls = [];
      if (cameraPermission?.granted) {
        setStatusMessage('Capturing a photo…');
        const photoUri = await waitForCapture(cameraRef, cameraReadyRef, CAMERA_READY_TIMEOUT_MS);
        if (photoUri) {
          setStatusMessage('Uploading photo…');
          try {
            const url = await uploadMedia({ uri: photoUri, type: 'photo' });
            mediaUrls = [url];
          } catch {
            // Upload failed — still send the alert with location only.
          }
        }
      }

      setStatusMessage('Sending alert…');
      const incident = await createIncident({
        type: 'sos',
        journeyId: journeyId ?? null,
        location,
        mediaUrls,
        note: 'Triggered via panic button',
      });

      router.replace(`/incident/${incident._id}`);
    } catch {
      setStatus('error');
      setStatusMessage('Could not send the alert.');
    }
  };

  useEffect(() => {
    if (cameraPermission === null) return;
    runFlow();
  }, [cameraPermission?.granted]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {cameraPermission?.granted ? (
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
          onCameraReady={() => {
            cameraReadyRef.current = true;
          }}
        />
      ) : null}

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.75)',
          padding: spacing.xl,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: spacing.lg }}>🆘</Text>
        <Text
          style={{ color: '#fff', fontSize: typography.size.xl, fontWeight: typography.weight.bold, textAlign: 'center' }}
        >
          Emergency alert
        </Text>
        <Text
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: typography.size.md,
            marginTop: spacing.sm,
            marginBottom: spacing.xl,
            textAlign: 'center',
          }}
        >
          {statusMessage}
        </Text>

        {status === 'working' ? <ActivityIndicator color="#fff" /> : null}

        {status === 'error' ? (
          <View style={{ width: '100%', gap: spacing.md }}>
            <Button title="Try again" onPress={runFlow} />
            <Button title="Cancel" variant="ghost" onPress={() => router.back()} textStyle={{ color: '#fff' }} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function waitForCapture(cameraRef, cameraReadyRef, timeoutMs) {
  return new Promise((resolve) => {
    const capture = async () => {
      try {
        const photo = await cameraRef.current?.takePictureAsync({ quality: 0.4 });
        resolve(photo?.uri ?? null);
      } catch {
        resolve(null);
      }
    };

    if (cameraReadyRef.current) {
      capture();
      return;
    }

    const timeout = setTimeout(() => resolve(null), timeoutMs);
    const interval = setInterval(() => {
      if (cameraReadyRef.current) {
        clearInterval(interval);
        clearTimeout(timeout);
        capture();
      }
    }, 150);
  });
}
