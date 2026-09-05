import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { useEffect } from 'react';

// This component handles the routing logic based on auth state
const InitialLayout = () => {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      // Redirect to the login page.
      router.replace('/(auth)/welcome');
    } else if (token && inAuthGroup) {
      // Redirect away from the login page.
      router.replace('/(app)');
    }
  }, [token, isLoading, segments]);

  return <Slot />;
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
