import React, { useRef, useEffect, useState } from "react";
import { View, Image, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import { htmlContent } from "../../../lib/htmlText";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function App() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  const webviewRef = useRef<WebView>(null);

  const handleMessage = async (event: WebViewMessageEvent) => {
    const base64Image = event.nativeEvent.data;
    try {
      const base64 = base64Image.replace(/^data:image\/png;base64,/, "");

      const handleCreateFolder = async () => {
        try {
          const dirPath = FileSystem.documentDirectory + "trees/";
          const dirInfo = await FileSystem.getInfoAsync(dirPath);

          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(dirPath, {
              intermediates: true,
            });
            setMessage(`Folder trees/  created successfully!`);
          } else {
            setMessage(`Folder trees/ already exists!`);
          }
        } catch (error: any) {
          setMessage(`Error: ${error.message}`);
          console.error(error);
        }
      };
      await handleCreateFolder();

      // Save to app's document directory instead of the gallery
      const fileName = `canvas-image-${new Date().getTime()}.png`;
      const fileUri = FileSystem.documentDirectory + "trees/" + fileName;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (err: any) {
      console.error("Error saving image:", err);
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.webview}>
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
        />
      </View>
        {/* {message ? <Text>Error: {message}</Text> : null} */}
        <MaterialIcons name="pinch" size={40}/>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.button}
          >
            <Ionicons name="arrow-back-outline" size={34} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              webviewRef.current?.injectJavaScript("saveCanvasImage(); true;");
            }}
          >
            <Ionicons name="save" size={34} color="white" />
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#50a385",
    alignItems: "center",
    justifyContent: "center",
  },
  webview: {
    width: 350,
    height: 350,
    borderRadius: 250,
    backgroundColor: "#e4e5a3",
    overflow: "scroll",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    margin: 19,
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth : 1,
    borderColor: 'white',
    borderRadius : 2,
    margin: 25,
  },
});