import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleNext = async () => {
    if (name.trim()) {
      await AsyncStorage.setItem("userName", name.trim());
    router.replace('/(tabs)/Pomodoro/pomodoro');
     
    } else {
      alert("Vui lòng nhập tên");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào bạn! Tên bạn là gì?</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên của bạn"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Bắt đầu</Text>
      </TouchableOpacity>
    </View>
  );
}

// Style giữ nguyên như đã chỉnh màu xanh ở trên

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#e6ffe6" }, // nền xanh nhạt
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#2e7d32", // xanh đậm
  },
  input: {
    height: 40,
    borderColor: "#4caf50", // xanh lá cây
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
  button: {
    backgroundColor: "#4caf50", // xanh lá cây
    padding: 10,
    borderRadius: 5,
    borderColor : "#388e3c", // xanh đậm
  },
    buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
