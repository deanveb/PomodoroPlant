import { useFocusEffect, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  Image,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useState } from "react";

import { TreeLayoutInfo } from "@/interfaces";
import TreePot from "@/components/TreePot";


export default function Tab() {
  const router = useRouter();
  const [fileContent, setFileContent] = useState<TreeLayoutInfo>();
  const [layoutData, setLayoutData] = useState<any>(undefined);

  const fileUri = FileSystem.documentDirectory + "treeLayout.json";

  useFocusEffect(
    useCallback(() => {
      const loadDataAndResize = async () => {
        try {
          const fileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          const jsonData = JSON.parse(fileContent) as TreeLayoutInfo;
          setFileContent(jsonData);
        } catch (e) {
          console.error("Error reading file content: ", e);
        }
      };

      loadDataAndResize();
    }, [])
  );

  //file check
  useEffect(() => {
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

  useEffect(() => {
    console.log("hi");
    
    setLayoutData(fileContent ? fileContent.layout : {});
    // setHasPotTree(layoutData && "pot" in layoutData && layoutData["pot"]);
  }, [fileContent]);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/background.png")}
        style={styles.backgroundImage}
      />
      <TreePot
        potName="pot"
        layoutData={layoutData}
      />
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
});
