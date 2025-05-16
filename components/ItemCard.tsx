import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { owned } from "@/interfaces";

interface ItemCard {
  title: string;
  price: number;
  image: ImageSourcePropType;
  updateUserCash: (value : number) => void;
}

export default function ItemCard({ title, price, image, updateUserCash }: ItemCard) {
  const [ownedContent, setOwnedContent] = useState<owned>();
  const [btnText, setBtnText] = useState<"Mua" | "Đã mua">("Mua");

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
  }, []);

  useEffect(() => {
    if (!ownedContent) return;
    setBtnText(title in ownedContent.trees ? "Đã mua" : "Mua");
  }, [ownedContent]);

  const handlePurchase = () => {
    if (!ownedContent) return;
    if (ownedContent.cash >= price) {
      const savePurchase = async (value: owned) => {
        try {
          const jsonValue = JSON.stringify(value);
          await FileSystem.writeAsStringAsync(ownedUri, jsonValue, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          console.log(`Saved ${jsonValue}`);
        } catch (e) {
          console.error("while storing data: ", e);
        }
      };

      const data: owned = {
        ...ownedContent,
        cash: ownedContent.cash - price,
        trees: { ...ownedContent.trees, [title]: image },
      };

      updateUserCash(ownedContent.cash - price);
      savePurchase(data);
      loadOwned();
    }
  };

  // TODO: add font to the title for each new tree
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Image source={image} style={styles.image} resizeMode="contain" />
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{price.toFixed(2)}</Text>
          <MaterialIcons name="payments" size={20} color="#444" />
        </View>
        <View style={styles.buttonContainer}>
          <Button title={btnText} onPress={handlePurchase} color="#2196F3" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    height: "100%",
  },
  card: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 6,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 8,
  },
});
