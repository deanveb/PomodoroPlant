import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, Image, TouchableOpacity, Text, Button, ScrollView } from "react-native";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useRef, useState } from "react";

import TreeDisplay from "@/components/TreeDisplay";
import useChoose from "@/hooks/useChoose";

// Interface for layout JSON structure
interface TreeLayoutInfo {
  layout: Record<string, string>;
}

export default function InventoryScreen() {
  const router = useRouter();

  // State to store contents of layout JSON
  const [fileContent, setFileContent] = useState<TreeLayoutInfo>();

  // State to store all tree filenames (images)
  const [fileNames, setFileNames] = useState<string[]>([]);

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  // State for toggling delete mode
  const [deleteMode, setDeleteMode] = useState(false);

  // State to track which trees are selected to be deleted
  const [selectedDelete, setSelectedDelete] = useState<string[]>([]);

  // Custom hook to handle tree selection logic
  const handleChoose = useChoose();

  // Get current slot name from navigation parameters
  const { name } = useLocalSearchParams();
  const buttonName = name as string;

  // Path to tree layout JSON file
  const fileUri = FileSystem.documentDirectory + "treeLayout.json";

  // Checks if treeLayout.json exists, creates it with default data if not
  const checkFileExistence = async () => {
    const fileExist = await FileSystem.getInfoAsync(fileUri);
    if (!fileExist.exists) {
      const defaultData = {
        layout: { pot: "", tree1: "", tree2: "" }, // Initial empty layout
      };
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(defaultData));
    }
  };

  // Loads all .png files (trees) from the 'trees' directory
  const loadFiles = async () => {
    try {
      const fileDirectory = FileSystem.documentDirectory + "trees/";
      const files = await FileSystem.readDirectoryAsync(fileDirectory);
      setFileNames(files); // Updates state with tree image filenames
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  // Called once when the component mounts
  useEffect(() => {
    console.log(buttonName); // Logs which slot is being edited (e.g., "pot")
    checkFileExistence();    // Ensure layout file exists
    loadFiles();             // Load tree images
  }, []);

  // Called every time the screen regains focus (e.g., switching tabs)
  // Ensures the t  ree list is updated live
  useFocusEffect(
    useCallback(() => {
      loadFiles();
    }, [])
  );

  // Deletes all selected trees from the file system
  const handleDelete = () => {
    setDeleteMode(false); // Exit delete mode

    const fileUri = FileSystem.documentDirectory + "trees/";
    selectedDelete.forEach(async (tree) => {
      try {
        await FileSystem.deleteAsync(fileUri + tree); // Delete each selected tree
      } catch (e) {
        console.error("Error deleting file:", error);
      }
    });

    setSelectedDelete([]); // Reset selection
    loadFiles();           // Reload updated list
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Toggle between delete and normal mode */}
      <TouchableOpacity style={styles.modeButton} onPress={() => setDeleteMode((d) => !d)}>
        <Text style={styles.modeButtonText}>{deleteMode ? "Delete Mode" : "Normal Mode"}</Text>
      </TouchableOpacity>

      {/* Confirm deletion button only appears if some trees are selected */}
      {selectedDelete.length != 0 && (
        <TouchableOpacity style={styles.acceptButton} onPress={handleDelete} >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      )}

      {/* Error display if something goes wrong */}
      {error ? (
        <Text style={{ color: "red" }}>No tree here</Text>
      ) : (
        <ScrollView>
          {/* Display each tree as a selectable TreeDisplay component */}
          {fileNames.map((name, index) => {
            if (name.includes(".png")) {
              return (
                <TreeDisplay
                  key={index}
                  treeName={name}
                  buttonName={buttonName}
                  isDeleting={deleteMode}
                  pushBeingDelete={(newTree) => {
                    setSelectedDelete((s) => [...s, newTree]);
                  }}
                  removeBeingDelete={(Tree) => {
                    setSelectedDelete((s) =>
                      s.filter((item) => item != Tree)
                    );
                  }}
                />
              );
            }
          })}
        </ScrollView>
      //   <View style={styles.bagContainer}>
      //   <Image source={require("@/assets/images/gardenBag1.png")} style={styles.bagBackground} />
        
      //   <View style={styles.gridOverlay}>
      //     {fileNames
      //       .filter((name) => name.endsWith(".png"))
      //       .slice(0, 12) // Limit to 3x4 = 12 items
      //       .map((name, index) => (
      //         <TreeDisplay
      //           key={index}
      //           treeName={name}
      //           buttonName={buttonName}
      //           isDeleting={deleteMode}
      //           pushBeingDelete={(newTree) =>
      //             setSelectedDelete((s) => [...s, newTree])
      //           }
      //           removeBeingDelete={(Tree) =>
      //             setSelectedDelete((s) => s.filter((item) => item !== Tree))
      //           }
      //         />
      //       ))}
      //   </View>
      // </View>
      )}

      {/* Button to remove tree from the current garden slot */}
      <TouchableOpacity style={styles.removeTreeButton} onPress={() => handleChoose(buttonName, "")}>
        <Text style={styles.removeTreeButtonText}>Remove tree</Text>
      </TouchableOpacity>
      
      {/* Go back to previous screen */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image source={require('@/assets/images/goBack.png')} style={styles.icon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
  </View>
  );
}

// (Unused) Styles defined for reference or potential reuse
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
    width: 300,
    height: 400,
    marginBottom: -50,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    marginTop: 10,
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  acceptButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    alignSelf: "center", // Center horizontally
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "green", 
    borderRadius: 10,
  },
  backText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modeButton: {
    alignSelf: "center", // Center horizontally
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#4CAF50", // Green color
    borderRadius: 10,
  },
  modeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  removeTreeButton: {
    alignSelf: "center", // Center horizontally
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "red", // Green color
    borderRadius: 10,
  },
  removeTreeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  bagContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    position: "relative",
  },
  bagBackground: {
    width: 500,
    height: 600,
    resizeMode: "contain",
    position: "absolute",
    zIndex: -1,
  },

  gridOverlay: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 500,
    height: 600,
    padding: 10,
    justifyContent: "space-between",
    alignContent: "space-between",
  },  
});
