import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';

const SHAKE_THRESHOLD = 2.2;
const SHAKE_COOLDOWN_MS = 3000;
const UPDATE_INTERVAL_MS = 100;

export function useShakeDetector(onShake, { enabled = true } = {}) {
  const lastShakeAt = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;

    Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (magnitude > SHAKE_THRESHOLD && now - lastShakeAt.current > SHAKE_COOLDOWN_MS) {
        lastShakeAt.current = now;
        onShake();
      }
    });

    return () => subscription.remove();
  }, [enabled, onShake]);
}
