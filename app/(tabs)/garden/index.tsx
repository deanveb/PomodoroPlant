import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Button, Pressable, Image} from 'react-native';
import * as FileSystem from "expo-file-system";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function Tab() {
  const router = useRouter();

  const getData = async (key : string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("can't get data: ", e);
    }
  };

  const {layoutData} = await getData("treeLayout");

  return (
    <View>
      <Text>Hello World</Text>
      <Pressable onPress={() => router.push(
        {
          pathname : "/(tabs)/garden/inventory",
          params : {name : "pot"}
        })}>
        {(layoutData.get("pot")) ? (
          <Image
            source={{uri : FileSystem.documentDirectory+"trees/"+layoutData.get("pot")}}
          />
        ) : (
          <Text>+</Text>
        )}
      </Pressable>
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
