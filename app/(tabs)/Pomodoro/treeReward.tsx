import React, { useRef, useEffect, useState } from 'react';
import { View, Button, Alert, StyleSheet, Text } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { htmlContent } from '../../../lib/htmlText';
import { useRouter } from 'expo-router';
// No longer need MediaLibrary since we're saving to the app's files
// 
export default function App() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const webviewRef = useRef<WebView>(null);

  const handleMessage = async (event: WebViewMessageEvent) => {
    const base64Image = event.nativeEvent.data;
    try {
      const base64 = base64Image.replace(/^data:image\/png;base64,/, '');
      
      const handleCreateFolder = async () => {
        try {
          const dirPath = FileSystem.documentDirectory + "trees/";
          const dirInfo = await FileSystem.getInfoAsync(dirPath);
          
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
            setMessage(`Folder trees/  created successfully!`);
          } else {
            setMessage(`Folder trees/ already exists!`);
          }
        } catch (error : any) {
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
      
      // Display the file location
      // console.log('Image saved to:', fileUri);
      Alert.alert('Bỏ cây thành công');
    } catch (err: any) {
      console.error('Error saving image:', err);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        style={styles.webview}
        javaScriptEnabled={true}
      />
      {message ?? <Text>Error: {message}</Text> }
      <View style={styles.buttonContainer}>
        <Button 
            title='Back'
            onPress={() => router.push("/(tabs)/Pomodoro/pomodoro")}
        />
        <Button
          title="Thêm cây vào túi"
          onPress={() => {
            webviewRef.current?.injectJavaScript('saveCanvasImage(); true;');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
});
