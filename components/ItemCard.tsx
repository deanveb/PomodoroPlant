import { MaterialIcons } from "@expo/vector-icons";
import { Button, Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

interface ItemCard {
  title: string;
  price: number;
  image: ImageSourcePropType;
}

export default function ItemCard({ title: name, price, image }: ItemCard) {
  const handlePurchase = () => {
    // Add your purchase logic here
  };

  // TODO: add font to the title for each new tree
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{name}</Text>
        <Image source={image} style={styles.image} resizeMode="contain" />
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{price.toFixed(2)}</Text>
          <MaterialIcons name="payments" size={20} color="#444" />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Buy" onPress={handlePurchase} color="#2196F3" />
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
