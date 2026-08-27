import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export function useLocation({ watch = false } = {}) {
  const [status, setStatus] = useState('undetermined');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscription;
    let isMounted = true;

    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) return;
        setStatus(permissionStatus);

        if (permissionStatus !== 'granted') {
          return;
        }

        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown && isMounted) {
          setLocation(lastKnown);
        }

        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (isMounted) {
          setLocation(current);
        }

        if (watch) {
          subscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 15 },
            (update) => {
              if (isMounted) setLocation(update);
            }
          );
        }
      } catch (err) {
        if (isMounted) setError(err.message ?? 'Could not get your location');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [watch]);

  return { status, location, error, isLoading };
}
