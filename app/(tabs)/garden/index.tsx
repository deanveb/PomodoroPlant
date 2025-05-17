import { useFocusEffect, useRouter } from "expo-router";
import { View, StyleSheet, Image, TouchableOpacity, ImageResizeMode } from "react-native";
import * as FileSystem from "expo-file-system";
import { useCallback, useRef, useState } from "react";
import { useFileSync } from "@/hooks/useFileSync";

export default function Tab() {
  const router = useRouter();
  // Get file content and refresh key from the sync hook
  const { fileContent, refreshKey } = useFileSync();
  
  // State for controlling image resize mode (contain/cover)
  const [resizeFix, setResizeFix] = useState<ImageResizeMode>("contain");
  // Ref to track how many times the image has been resized
  const resized = useRef<number>(0);

  // Hook that runs when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Skip resizing if we've already done it twice
      if (resized.current == 2) {
        resized.current = 0;
        return;
      }
      // Function to toggle between 'contain' and 'cover' resize modes
      const alternateResizeMode = () => {
        setResizeFix(prev => prev === "contain" ? "cover" : "contain");
        resized.current++;
      }

      alternateResizeMode();
    }, [resizeFix])
  );

  // Extract layout data from file content or use empty object
  const layoutData = fileContent?.layout || {};
  // Check if there's a pot with a tree in the layout
  const hasPotTree = layoutData && "pot" in layoutData && layoutData["pot"];

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={require("@/assets/images/background.png")}
        style={styles.backgroundImage}
      />
      
      {/* Interactive area for the pot/tree */}
      <TouchableOpacity
        style={hasPotTree ? styles.treeContainer : styles.potContainer}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/garden/inventory",
            params: { name: "pot" },
          })
        }
      >
        {/* Show either the tree (if planted) or just the pot */}
        {hasPotTree ? (
          <Image
            source={{
              uri: `${FileSystem.documentDirectory}trees/${layoutData["pot"]}?refresh=${refreshKey}`,
            }}
            style={styles.tree}
            resizeMode={resizeFix}
            key={refreshKey} // Important for forcing image reload
          />
        ) : (
          <Image
            source={require("@/assets/images/pot.png")}
            style={styles.pot}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

// Style definitions
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 100,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  potContainer: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
  },
  treeContainer: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  pot: {
    width: 50,
    height: 50,
  },
  tree: {
    width: 800,
    height: 1000,
    marginBottom: -50, // Adjust to make tree base align with pot position
  },
});