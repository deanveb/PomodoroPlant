import { Stack } from 'expo-router';

export default function GardenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="pomodoro" />
      <Stack.Screen name="setting" options={{ presentation: "modal" }} />
      <Stack.Screen name="treeReward" options={{ presentation: "modal" }} />
    </Stack>
  );
}
