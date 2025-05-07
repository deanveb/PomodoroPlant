import { useFocusEffect, useRouter } from "expo-router";
<<<<<<< HEAD
import { useEffect } from "react";
import { View, Text } from "react-native";


=======
import { View, Text } from "react-native";

>>>>>>> 2625594 (saving progress)
export default function app() {
  const router = useRouter();

  useFocusEffect(() => {
    router.replace('/(tabs)/Pomodoro/pomodoro');
  });

  return (
    <View>
      <Text>Loading..</Text>
    </View>
  )
}