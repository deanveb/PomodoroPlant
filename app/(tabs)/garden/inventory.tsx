import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";


export default function() {
  const router = useRouter();

  return (
    <>
      <View>
        <Button 
          title="Back"
          onPress={() => {router.navigate("/(tabs)/garden")}}
        />
        <Text>Inventory</Text>
      </View>
    </>
  );
}