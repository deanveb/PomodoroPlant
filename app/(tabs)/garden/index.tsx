import { useFocusEffect, useRouter } from "expo-router";
import { View, StyleSheet, Image, TouchableOpacity, ImageResizeMode } from "react-native";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useRef, useState } from "react";
import { TreeLayoutInfo } from "@/interfaces";

export default function Tab() {
  const router = useRouter();
  const [fileContent, setFileContent] = useState<TreeLayoutInfo>();
  const [resizeFix, setResizeFix] = useState<ImageResizeMode>("contain");
  const resized = useRef<number>(0);

  useFocusEffect(
    useCallback(() => {
      if (resized.current == 2) {
        resized.current = 0;
        return;
      }
      const alternateResizeMode = () => {
        setResizeFix(prev => prev === "contain" ? "cover" : "contain");
        resized.current++;
      }

      alternateResizeMode();
    }, [resizeFix])
  );

  //file check
  useEffect(() => {
    const fileUri = FileSystem.documentDirectory + "treeLayout.json";
    const checkExist = async () => {
      const fileExist = await FileSystem.getInfoAsync(fileUri);
      if (!fileExist.exists) {
        try {
          await FileSystem.writeAsStringAsync(fileUri, "{}", {
            encoding: FileSystem.EncodingType.UTF8,
          });
        } catch (e) {
          console.error("Error while creating empty file: ", e);
          return;
        }
      }
    };
    checkExist();

    const getData = async () => {
      try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const jsonData = JSON.parse(fileContent) as TreeLayoutInfo;
        setFileContent(jsonData);
      } catch (e) {
        console.error("Error reading file content: ", e);
        return null;
      }
    };

    getData();
  }, []);

  const deleteAllFiles = async () => {
    try {
      if (!FileSystem.documentDirectory) {
        return;
      }
      const files = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory
      );

      await Promise.all(
        files.map(async (file) => {
          const fileUri = `${FileSystem.documentDirectory}${file}`;
          await FileSystem.deleteAsync(fileUri);
        })
      );

      console.log("All files in document directory deleted");
    } catch (error) {
      console.error("Error deleting files:", error);
    }
  };

  const layoutData = fileContent ? fileContent.layout : {};
  const hasPotTree = layoutData && "pot" in layoutData && layoutData["pot"];

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/background.png")}
        style={styles.backgroundImage}
      />
      
      <TouchableOpacity
        style={hasPotTree ? styles.treeContainer : styles.potContainer}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/garden/inventory",
            params: { name: "pot" },
          })
        }
      >
        {hasPotTree ? (
          <Image
            source={{
              uri: FileSystem.documentDirectory + "trees/" + layoutData["pot"],
            }}
            style={styles.tree}
            resizeMode={resizeFix}
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
    marginBottom: -50, // Adjust to make tree base align with pot position
  },
});
