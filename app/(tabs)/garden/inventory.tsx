import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, Image, TouchableOpacity, Text, ScrollView, ImageBackground } from "react-native";
import * as FileSystem from "expo-file-system";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";

import TreeDisplay from "@/components/TreeDisplay";
import useChoose from "@/hooks/useChoose";

export default function InventoryScreen() {
  const router = useRouter();
  const handleChoose = useChoose();

  const { name } = useLocalSearchParams();
  const buttonName = name as string;

  const [fileNames, setFileNames] = useState<string[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileUri = FileSystem.documentDirectory + "treeLayout.json";

  const checkFileExistence = async () => {
    const fileExist = await FileSystem.getInfoAsync(fileUri);
    if (!fileExist.exists) {
      const defaultData = { layout: { pot: "", tree1: "", tree2: "" } };
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(defaultData));
    }
  };

  const loadFiles = async () => {
    try {
      const fileDirectory = FileSystem.documentDirectory + "trees/";
      const files = await FileSystem.readDirectoryAsync(fileDirectory);
      setFileNames(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkFileExistence();
      loadFiles();
    }, [])
  );
  

  const handleDelete = () => {
    setDeleteMode(false);
    const fileDirectory = FileSystem.documentDirectory + "trees/";
    selectedDelete.forEach(async (tree) => {
      try {
        await FileSystem.deleteAsync(fileDirectory + tree);
      } catch (e) {
        console.error("Error deleting file:", e);
      }
    });
    setSelectedDelete([]);
    loadFiles();
  };

  return (
    <ImageBackground
      source={require("@/assets/images/grassBackground.png")}
      style={styles.screenContainer}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.modeButton} onPress={() => setDeleteMode(d => !d)}>
          <Text style={styles.modeButtonText}>
            {deleteMode ? "Delete\nMode" : "Normal\nMode"}
          </Text>
        </TouchableOpacity>

        {selectedDelete.length > 0 && (
          <TouchableOpacity style={styles.acceptButton} onPress={handleDelete}>
            <Text style={styles.acceptButtonText}>
              Delete selected tree(s)?
            </Text>
          </TouchableOpacity>
        )}

        {error ? (
          <Text style={{ color: "red" }}>No tree here</Text>
        ) : (
          <View style={styles.bagContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            >
              {fileNames.map((name, index) =>
                name.endsWith(".png") ? (
                  <View key={index} style={styles.treeSlot}>
                    <TreeDisplay
                      treeName={name}
                      buttonName={buttonName}
                      isDeleting={deleteMode}
                      pushBeingDelete={(tree) =>
                        setSelectedDelete((prev) => [...prev, tree])
                      }
                      removeBeingDelete={(tree) =>
                        setSelectedDelete((prev) => prev.filter((t) => t !== tree))
                      }
                    />
                  </View>
                ) : null
              )}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity style={styles.removeTreeButton} onPress={() => handleChoose(buttonName, "")}>
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
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
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
