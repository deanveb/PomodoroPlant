import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Button, } from 'react-native';

export default function Tab() {
  const router = useRouter();
  
  return (
    <View>
      <Button 
        title='+'
        onPress={() => router.navigate("/(tabs)/garden/inventory")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
