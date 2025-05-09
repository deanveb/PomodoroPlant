import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { TreeLayoutInfo } from "@/interfaces";

export default function useChoose() {
  const router = useRouter();

  return async function (target: string, pngName: string) {
    const fileUri = FileSystem.documentDirectory + "treeLayout.json";

    const checkExist = async () => {
      const fileExist = FileSystem.getInfoAsync(fileUri);
      if (!(await fileExist).exists) {
        try {
          const fileUri = FileSystem.documentDirectory + "treeLayout.json";
          await FileSystem.writeAsStringAsync(fileUri, "{}", {
            encoding: FileSystem.EncodingType.UTF8,
          });
        } catch (e) {
          console.error("while creating empty file: ", e);
        }
      }
    };
    checkExist();

    const getData = async () => {
      const fileUri = FileSystem.documentDirectory + "treeLayout.json";
      try {
        const FileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const jsonData = JSON.parse(FileContent) as TreeLayoutInfo;
        console.log("File content inventory:", jsonData);
        return jsonData;
      } catch (e) {
        console.error("while getting data: ", e);
        return null;
      }
    };
    const layoutData = await getData();

    if (!layoutData) {
      console.error("layoutData does not exist");
      return;
    }

    if (!layoutData.layout) {
      console.log(typeof layoutData);
      layoutData.layout = {};
    }

    layoutData.layout[target] = pngName;
    console.log(layoutData);

    const storeData = async (value: TreeLayoutInfo) => {
      try {
        const jsonValue = JSON.stringify(value);
        const fileUri = FileSystem.documentDirectory + "treeLayout.json";
        await FileSystem.writeAsStringAsync(fileUri, jsonValue, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        console.log(jsonValue);
      } catch (e) {
        console.error("while storing data: ", e);
      }
    };
    storeData(layoutData);

    router.replace("/(tabs)/garden");
  };
}
