import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="journey/new" />
        <Stack.Screen name="journey/[id]" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="templates" />
        <Stack.Screen name="favorites" />
      </Stack>
    </GestureHandlerRootView>
  );
}
