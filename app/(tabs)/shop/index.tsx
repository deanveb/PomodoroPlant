import ItemCard from "@/components/ItemCard";
import { Text, View, StyleSheet} from "react-native";
import * as FileSystem from "expo-file-system";

import { owned } from "@/interfaces";
import { useCallback, useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function shop() {
  const [ownedContent, setOwnedContent] = useState<owned>();

  const ownedUri = FileSystem.documentDirectory + "owned.json";

  const loadOwned = useCallback(async () => {
    try {
      const FileContent = await FileSystem.readAsStringAsync(ownedUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const jsonData = JSON.parse(FileContent) as owned;
      setOwnedContent(jsonData);
    } catch (e) {
      console.error("Error reading owned content: ", e);
      return null;
    }
  }, [ownedUri]);

  useEffect(() => {
    loadOwned();
  }, [])

  const userCash = ownedContent ? ownedContent.cash : 0;

  return (
    <View style={styles.container}>
      <View>
        <Text>{userCash}</Text>
        <MaterialIcons name="payments" size={20} color="#444" />
      </View>
      <ItemCard 
        title="Cherry Blossom"
        price={1}
        image={require("@/assets/images/trees/Cherry_Blossom.png")}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {

  },
  info: {

  },
  card: {

  },
  price: {

  },
  purchaseBtn: {

  },
});