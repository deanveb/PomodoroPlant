import { useFocusEffect, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Text } from "react-native";


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