import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, Image, TouchableOpacity, Text, ScrollView, ImageBackground } from "react-native";
import * as FileSystem from "expo-file-system";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";
import TreeDisplay from "@/components/TreeDisplay";
import useChoose from "@/hooks/useChoose";
import { useFileSync } from "@/hooks/useFileSync";

export default function InventoryScreen() {
  const router = useRouter();
  const handleChoose = useChoose();
  const { fileContent, refreshKey } = useFileSync();

  const { name } = useLocalSearchParams();
  const buttonName = name as string;

  const [fileNames, setFileNames] = useState<string[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      const fileDirectory = FileSystem.documentDirectory + "trees/";
      const dirExists = await FileSystem.getInfoAsync(fileDirectory);
      
      if (!dirExists.exists) {
        await FileSystem.makeDirectoryAsync(fileDirectory, { intermediates: true });
        setFileNames([]);
        return;
      }

      const files = await FileSystem.readDirectoryAsync(fileDirectory);
      setFileNames(files.filter(file => file.endsWith('.png')));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setFileNames([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFiles();
    }, [refreshKey])
  );

  const resetDeleteState = () => {
    setSelectedDelete([]);
  };

  const handleModeToggle = () => {
    setDeleteMode(prevMode => {
      // If switching from delete mode to normal mode, clear selected items
      if (prevMode) {
        setSelectedDelete([]);
      }
      return !prevMode;
    });
  };
  

  const handleDelete = async () => {
    if (selectedDelete.length === 0) return;
    
    setDeleteMode(false);
    const fileDirectory = FileSystem.documentDirectory + "trees/";
    
    try {
      await Promise.all(
        selectedDelete.map(async (tree) => {
          await FileSystem.deleteAsync(fileDirectory + tree);
        })
      );
      
      // Check if we're deleting the currently planted tree
      const currentTree = fileContent?.layout[buttonName as keyof typeof fileContent.layout];
      if (currentTree && selectedDelete.includes(currentTree)) {
        await handleChoose(buttonName, "");
      }
      
      setSelectedDelete([]);
      await loadFiles();
    } catch (e) {
      console.error("Error deleting files:", e);
      setError("Failed to delete trees");
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/grassBackground.png")}
      style={styles.screenContainer}
    >
      <View style={styles.overlay}>
        {/* Mode Toggle Button */}
        <TouchableOpacity style={styles.modeButton} onPress={handleModeToggle}>
          <Text style={styles.modeButtonText}>
            {deleteMode ? "Delete\nMode" : "Normal\nMode"}
          </Text>
        </TouchableOpacity>

        {/* Delete Confirmation */}
        {selectedDelete.length > 0 && (
          <TouchableOpacity style={styles.acceptButton} onPress={handleDelete}>
            <Text style={styles.acceptButtonText}>
              Delete selected tree(s)?
            </Text>
          </TouchableOpacity>
        )}

        {/* Error or Content */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : fileNames.length === 0 ? (
          <View style={styles.noTreesContainer}>
            <Text style={styles.noTreesText}>No trees available</Text>
          </View>
        ) : (
          <View style={styles.bagContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            >
              {fileNames.map((name, index) => (
                <View key={`${name}-${index}-${refreshKey}`} style={styles.treeSlot}>
                  <TreeDisplay
                    treeName={name}
                    buttonName={buttonName}
                    isDeleting={deleteMode}
                    resetKey={deleteMode ? "delete" : "normal"} // Add this prop
                    pushBeingDelete={(tree) => setSelectedDelete((prev) => [...prev, tree])}
                    removeBeingDelete={(tree) => setSelectedDelete((prev) => prev.filter((t) => t !== tree))}
                    refreshKey={refreshKey}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.removeTreeButton} 
          onPress={() => handleChoose(buttonName, "")}
        >
          <Text style={styles.removeTreeButtonText}>Remove tree</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image source={require('@/assets/images/goBack.png')} style={styles.icon} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  noTreesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTreesText: {
    color: "#333",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "darkgreen",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  emptyContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    right: '50%',
    bottom: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'lightgray',
    width: 500,
    height: 200,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  bagContainer: {
    position: "absolute",
    top: 160,
    width: 300,
    maxHeight: 500,
    padding: 10,
    marginVertical: 20,
    backgroundColor: "darkgreen",
    borderColor: "#ccc",
    borderWidth: 2,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scrollView: {
    width: "100%",
    maxHeight: 400,
  },
  scrollContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
  },
  treeSlot: {
    width: 200,
    height: 200,
    margin: 5,
    backgroundColor: "lightyellow",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  modeButton: {
    position: "absolute",
    top: 10,
    right: 20,
    width: 100,
    height: 100,
    padding: 5,
    backgroundColor: "lightgreen",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modeButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
  acceptButton: {
    position: "absolute",
    top: 120,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "green",
    borderRadius: 10,
  },
  acceptButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 20,
  },
  removeTreeButton: {
    position: "absolute",
    bottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "red",
    borderRadius: 10,
  },
  removeTreeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  backText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
});