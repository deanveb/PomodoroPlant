import React, { useRef, useState, useEffect } from "react";
import { View, Image, Alert, StyleSheet, Text, TouchableOpacity, Modal, BackHandler } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import { htmlContent } from "../../../lib/htmlText";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function TreeRewardScreen() {
  const router = useRouter();
  const webviewRef = useRef<WebView>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [webViewLoaded, setWebViewLoaded] = useState(false);

  // Add back button handler to exit the screen
   useEffect(() => {
    const backAction = () => {
      if (!hasSaved) {
        setShowConfirmation(true);
        return true; // Prevent default back action
      }
      return false; // Allow default back action if already saved
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [hasSaved]);

  // Handle WebView messages
  const handleMessage = (event: WebViewMessageEvent) => {
    console.log("Message received from WebView");
    const data = event.nativeEvent.data;
    
    // Check if it's image data (starts with data:image)
    if (data.startsWith('data:image')) {
      console.log("Image data received, length:", data.length);
      setImageData(data);
    } else if (data.startsWith('ERROR:')) {
      console.error("WebView error:", data);
      Alert.alert("Error", "Failed to capture tree image. Please try again.");
    } else if (data === 'LOADED') {
      console.log("WebView canvas is ready");
      setWebViewLoaded(true);
    } else {
      console.log("Unknown message:", data.substring(0, 50));
    }
  };

  const saveTreeImage = async () => {
    try {
      console.log("Starting tree save process");
      
      // If we already have image data from a previous capture, use it
      if (imageData) {
        await saveImageToFileSystem(imageData);
        return;
      }
      
      // Check if WebView is loaded before requesting image
      if (!webViewLoaded) {
        console.log("WebView not fully loaded yet");
        Alert.alert("Please wait", "Tree is still loading. Please try again in a moment.");
        return;
      }
      
      // Request image data from WebView
      if (webviewRef.current) {
        console.log("Requesting image from WebView");
        webviewRef.current.injectJavaScript(`
          (function() {
            try {
              console.log("Canvas extraction started");
              // Make sure we use the correct canvas selector
              // First try by id, then try by tag name
              let canvas = document.getElementById('canvas');
              
              if (!canvas) {
                // If not found by ID, try to find the first canvas element
                const canvases = document.getElementsByTagName('canvas');
                if (canvases.length > 0) {
                  canvas = canvases[0];
                  console.log("Found canvas by tag name");
                }
              }
              
              if (!canvas) {
                console.error('Canvas element not found');
                window.ReactNativeWebView.postMessage('ERROR: Canvas not found');
                return false;
              }
              
              console.log("Canvas found, generating image data");
              const imageData = canvas.toDataURL('image/png');
              console.log("Image data generated, length: " + imageData.length);
              window.ReactNativeWebView.postMessage(imageData);
              return true;
            } catch(err) {
              console.error('Error generating image:', err);
              window.ReactNativeWebView.postMessage('ERROR: ' + err.message);
              return false;
            }
          })();
        `);
      } else {
        throw new Error("WebView reference is not available");
      }
    } catch (err: any) {
      console.error("Error in saveTreeImage:", err);
      Alert.alert("Error", "Failed to capture tree image");
    }
  };
  
  // Function to actually save the image to file system
  const saveImageToFileSystem = async (base64Image: string) => {
    try {
      console.log("Saving image to file system");
      const base64 = base64Image.replace(/^data:image\/png;base64,/, "");

      // Create trees directory if it doesn't exist
      const dirPath = FileSystem.documentDirectory + "trees/";
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        console.log("Creating directory:", dirPath);
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
      }

      // Save the image
      const fileName = `tree-reward-${new Date().getTime()}.png`;
      const fileUri = dirPath + fileName;
      console.log("Writing file to:", fileUri);
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Image saved successfully at:", fileUri);
      setHasSaved(true);
      
      // Instead of using Alert, set a success state to show custom modal
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Error saving image to filesystem:", err);
      Alert.alert("Error", "Failed to save tree to your inventory");
    }
  };

  // Function to exit the screen
  const exitScreen = () => {
    console.log("Exiting TreeReward screen");
    router.back();
  };

  const handleSavePress = () => {
    setShowConfirmation(true);
  };

  const handleConfirmation = async (confirmed: boolean) => {
    setShowConfirmation(false);
    if (confirmed) {
      // Check if we already have image data
      if (imageData) {
        await saveImageToFileSystem(imageData);
      } else {
        // First trigger the WebView to capture the image
        await saveTreeImage();
        // The image will be saved when the message handler receives the data
      }
    }
  };

  // Effect to handle saving when we receive image data
  useEffect(() => {
    if (imageData && showConfirmation === false && !hasSaved) {
      saveImageToFileSystem(imageData);
    }
  }, [imageData, showConfirmation]);

  // HTML content with added notification when canvas is ready
  const modifiedHtmlContent = `
    ${htmlContent}
    <script>
      // Add this code to notify React Native when the canvas is ready
      document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit to ensure all scripts have run
        setTimeout(function() {
          try {
            // Try to find canvas by ID first
            let canvas = document.getElementById('canvas');
            
            // If not found, try by tag name
            if (!canvas) {
              const canvases = document.getElementsByTagName('canvas');
              if (canvases.length > 0) {
                canvas = canvases[0];
              }
            }
            
            if (canvas) {
              window.ReactNativeWebView.postMessage('LOADED');
            } else {
              window.ReactNativeWebView.postMessage('ERROR: Canvas element not found on DOMContentLoaded');
            }
          } catch (err) {
            window.ReactNativeWebView.postMessage('ERROR: ' + err.message);
          }
        }, 1000);
      });
    </script>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.webview}>
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html: modifiedHtmlContent }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          onLoad={() => {
            console.log("WebView loaded, waiting for canvas to be ready");
            // Add a fallback in case DOMContentLoaded doesn't fire
            setTimeout(() => {
              if (!webViewLoaded) {
                setWebViewLoaded(true);
              }
            }, 3000);
          }}
        />
      </View>

      <View style={styles.zoomInstruction}>
        <MaterialIcons name="pinch" size={24} color="white" />
        <Text style={styles.instructionText}>This is your reward, pinch to zoom</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, hasSaved && styles.disabledButton]}
          onPress={handleSavePress}
          disabled={hasSaved}
        >
          <Ionicons name="save" size={24} color={hasSaved ? "#aaa" : "white"} />
          <Text style={styles.saveButtonText}>Save Tree</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Save and exit?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.noButton]}
                onPress={() => handleConfirmation(false)}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.yesButton]}
                onPress={() => handleConfirmation(true)}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Success</Text>
            <Text style={styles.modalSubText}>Tree saved to your inventory!</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.yesButton, styles.fullWidthButton]}
                onPress={() => {
                  setShowSuccessModal(false);
                  exitScreen();
                }}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#50a385",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  webview: {
    width: 350,
    height: 350,
    borderRadius: 250,
    backgroundColor: "#e4e5a3",
    overflow: "hidden",
    marginBottom: 20,
  },
  zoomInstruction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
  },
  saveButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    width: '80%',
  },
  modalText: {
    fontSize: 20,
    marginBottom: 8, // Adjusted spacing
    textAlign: 'center',
    fontWeight: '500',
  },
  modalSubText: { // Added missing style
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#50a385',
  },
  noButton: {
    backgroundColor: '#e57373',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fullWidthButton: { // Added missing style
    width: '100%',
  },
});