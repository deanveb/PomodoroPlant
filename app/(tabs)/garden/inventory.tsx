import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Button, Image, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

interface treeLayoutInfo {
  layout : Record<string, string>,
}

export default function InventoryScreen() {
  const router = useRouter();
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<treeLayoutInfo>();
  const { name } = useLocalSearchParams();
  const buttonName = name as string;


  useEffect(() => {
    console.log(buttonName);
    const loadFiles = async () => {
      try {
        const fileDirectory = FileSystem.documentDirectory + "trees/";
        if (!fileDirectory) {
          throw new Error('Directory does not exist');
        }
        const files = await FileSystem.readDirectoryAsync(fileDirectory);
        setFileNames(files);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error reading directory:', err);
      }
    };

    loadFiles();
  }, []);

  const handleChoose = async (name : string) => {
    const fileUri = FileSystem.documentDirectory + 'treeLayout.json';

    const checkExist = async () => {
      const fileExist = FileSystem.getInfoAsync(fileUri);
      if (!(await fileExist).exists) {
        try {
          const fileUri = FileSystem.documentDirectory + 'treeLayout.json';
          await FileSystem.writeAsStringAsync(
            fileUri,
            '{}',
            { encoding: FileSystem.EncodingType.UTF8 }
          );

        } catch (e) {
          console.error("while creating empty file: ",e);
        }
      }
    }
    checkExist();

    const getData = async () => {
      const fileUri = FileSystem.documentDirectory + 'treeLayout.json';
        try {
          const FileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8
          });
          
          const jsonData = JSON.parse(FileContent) as treeLayoutInfo;
          console.log('File content inventory:', jsonData);
          return jsonData
        } catch (e) {
          console.error("while getting data: ",e);
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

    // layoutData.layout.set(buttonName, name);
    layoutData.layout[buttonName] = name;
    console.log(layoutData);

    const storeData = async (value : treeLayoutInfo) => {
      try {
        const jsonValue = JSON.stringify(value);
        const fileUri = FileSystem.documentDirectory + 'treeLayout.json';
        await FileSystem.writeAsStringAsync(
          fileUri,
          jsonValue,
          { encoding: FileSystem.EncodingType.UTF8 }
        );
        console.log(jsonValue);
      } catch (e) {
        console.error("while storing data: ",e);
      }
    };
    storeData(layoutData);

    router.push("/(tabs)/garden");
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {error ? (
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      ) : (
        <>
          {fileNames.map((name, index) => {
            if (name.includes(".png")) {
              return (
              <TouchableOpacity key={index} onPress={() => handleChoose(name)}>
                <Image
                  source = {{uri : FileSystem.documentDirectory+"trees/"+name}}
                  style = {{ width: 300, height: 300 }}
                />
              </TouchableOpacity>
              )
            }
          })}
        </>
      )}
      
      <Button 
        title="Back to Garden"
        onPress={() => router.back()}
      />
    </View>
  );
}