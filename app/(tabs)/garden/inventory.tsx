import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Button, ScrollView } from "react-native";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useRef, useState } from "react";

import TreeDisplay from "@/components/TreeDisplay";
import useChoose from "@/hooks/useChoose";

export default function InventoryScreen() {
  const router = useRouter();
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState<string[]>([]);
  const handleChoose = useChoose();

  const { name } = useLocalSearchParams();
  const buttonName = name as string;

  const loadFiles = async () => {
    try {
      const fileDirectory = FileSystem.documentDirectory + "trees/";
      if (!fileDirectory) {
        throw new Error("Directory does not exist");
      }
      const files = await FileSystem.readDirectoryAsync(fileDirectory);
      setFileNames(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      // console.error('Error reading directory:', err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // FIXME: tree list not updating when enter garnder tab
  useFocusEffect(
    useCallback(() => {
      loadFiles();
    }, [])
  );

  const handleDelete = () => {
    setDeleteMode(false);
    const fileUri = FileSystem.documentDirectory + "trees/";
    selectedDelete.forEach(async (tree) => {
      try {
        await FileSystem.deleteAsync(fileUri + tree);
      } catch (e) {
        console.error("Error deleting file:", error);
      }
    });

    setSelectedDelete([]);

    loadFiles();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button
        title={deleteMode ? "deleteMode" : "normalMode"}
        onPress={() => setDeleteMode((d) => !d)}
      />
      {selectedDelete.length != 0 && (
        <Button title="accept" onPress={handleDelete} />
      )}
      {error ? (
        <Text style={{ color: "red" }}>No tree here</Text>
      ) : (
        <ScrollView>
          {fileNames.map((name, index) => {
            if (name.includes(".jpeg")) {
              return (
                <>
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
                </>
              );
            }
          })}
        </ScrollView>
      )}

      <Button
        title="Xóa cây khỏi chậu"
        onPress={() => handleChoose(buttonName, "")}
      />

      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}
