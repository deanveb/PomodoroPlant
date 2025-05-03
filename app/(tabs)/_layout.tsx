import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', headerShown: false}}>
      <Tabs.Screen
        name="Pomodoro"
        options={{
          title: 'Pomodoro',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="clock-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: 'Garden',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="tree" color={color} />,
        }}
      />
    </Tabs>
  );
}