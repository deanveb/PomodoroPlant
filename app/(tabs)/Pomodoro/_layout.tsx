import { Stack } from 'expo-router';
<<<<<<< HEAD
=======
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors'
>>>>>>> 2625594 (saving progress)

export default function GardenLayout() {
  return (
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name='pomodoro'/>
      <Stack.Screen name='treeReward'/>
    </Stack>
  );
}