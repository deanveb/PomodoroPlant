import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Button, Image, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from "react";

interface treeInfo {
  treeLayout : Map<string, string>,
}

export default function InventoryScreen() {
  const router = useRouter();
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { btnName } = useLocalSearchParams();

  useEffect(() => {
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

  const handleChoose = (name : string) => {
    const info = {
      [btnName as string]: name
    };
    
    const storeData = async (key :string, value : object) => {
      try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
      } catch (e) {
        console.error("while string data: ",e);
      }
    };

    storeData('treeLayout', info);

    router.back();
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
              <TouchableOpacity onPress={() => handleChoose(name)}>
                <Image
                  key={index}
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