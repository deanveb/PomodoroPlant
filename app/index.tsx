import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkName = async () => {
      const savedName = await AsyncStorage.getItem("userName");

      if (savedName) {
        // router.replace("/(tabs)/Pomodoro");
          router.replace('/(tabs)/Pomodoro/pomodoro');
      } else {
        // router.replace("/(auth)/login");
      }
    };

    checkName();
  }, []);

  return (
    <View>
      <Text>Đang kiểm tra người dùng...</Text>
    </View>
  );
}
