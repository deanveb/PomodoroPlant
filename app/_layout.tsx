import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

export default function Layout() {
  useEffect(() => {
    LogBox.ignoreLogs(['Warning: ...']); // Optional: Ignore specific warnings
  }, []);

  return (
    <Stack>
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}