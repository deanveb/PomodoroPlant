import ItemCard from "@/components/ItemCard";
import { Text, View, Button, StyleSheet, Image } from "react-native";

export default function shop() {

  return (
    <View style={styles.container}>
      <ItemCard 
        title="Cherry Blossom"
        price={500}
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