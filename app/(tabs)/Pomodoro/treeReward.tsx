import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, Image, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import { htmlContent } from "../../../lib/htmlText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { owned } from "@/interfaces";

export default function App() {
  const [ownedContent, setOwnedContent] = useState<owned>({cash: 0, trees: {}});
  const router = useRouter();
  const [message, setMessage] = useState("");
  const { time } = useLocalSearchParams();
  const timeValue : string = time.toString();

  const webviewRef = useRef<WebView>(null);
  const ownedUri = FileSystem.documentDirectory + "owned.json";

  useEffect(() => {
    const loadOwned = async () => {
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
    }
    
    loadOwned();
  }, []);
  useEffect(() => {
    const saveCash = async (value: owned) => {
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
    
    if (ownedContent) {
      const data : owned = {...ownedContent, cash : parseInt(timeValue) + ownedContent.cash};
      saveCash(data);
    }
  }, [ownedContent, timeValue]);

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
      const treeUri = FileSystem.documentDirectory + "trees/" + fileName;

      await FileSystem.writeAsStringAsync(treeUri, base64, {
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
        <MaterialIcons name="pinch" size={40}/>
        <View>
          <Text>+{time}</Text>
          <MaterialIcons name="payments" size={20} color="#444" />
        </View>
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
    width: 300,
    height: 300,
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