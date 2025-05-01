import React, { useRef, useEffect, useState } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { htmlContent } from './htmlText';
// No longer need MediaLibrary since we're saving to the app's files
// 
export default function App() {
  const webviewRef = useRef<WebView>(null);
  // No need for media library permissions since we're saving to app's documents directory

  const handleMessage = async (event: WebViewMessageEvent) => {
    const base64Image = event.nativeEvent.data;
    try {
      const base64 = base64Image.replace(/^data:image\/png;base64,/, '');
      
      // Save to app's document directory instead of the gallery
      const fileName = `canvas-image-${new Date().getTime()}.png`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Display the file location
      console.log('Image saved to:', fileUri);
      Alert.alert('Success', `Image saved to app's documents directory:\n${fileUri}`);
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
      <View style={styles.buttonContainer}>
        <Button
          title="Save to App Directory"
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
