import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme} from '@/hooks/useColorScheme';
// import TabBarBackground from '@/components/UI/TabBarBackground';

export default function TabLayout() {
  const color = useColorScheme();
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: Colors[color ?? 'light'].tint, tabBarInactiveBackgroundColor: Colors[color ?? 'light'].background, tabBarActiveBackgroundColor: Colors[color ?? 'light'].background, headerShown: false}}>
      <Tabs.Screen
<<<<<<< HEAD
        name="Pomodoro"
        options={{
          title: 'Pomodoro',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="clock-o" color={color} />,
        }}
      />
      <Tabs.Screen
=======
>>>>>>> 2625594 (saving progress)
        name="garden"
        options={{
          title: 'Garden',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="tree" color={color} />,
        }}
      />
<<<<<<< HEAD
      <Tabs.Screen
        name="bag"
        options={{
          title: 'Bag',
        }}
      />
    </Tabs>
  );
}
=======
        <Tabs.Screen
          name="Pomodoro"
          options={{
            title: 'Pomodoro',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="clock-o" color={color} />,
          }}
        />
    </Tabs>
  );
}
>>>>>>> 2625594 (saving progress)
