import { useRouter } from "expo-router";
import { View, Text, Button, Image } from "react-native";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

export default function InventoryScreen() {
  const router = useRouter();
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {error ? (
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      ) : (
        <>
          {fileNames.map((name, index) => {
            if (name.includes(".png")) {
              return <Image 
                key={index}
                source = {{uri : FileSystem.documentDirectory+"trees/"+name}}
                style = {{ width: 300, height: 300 }}
              /> 
            }
            // <Text key={index}>{name}</Text>
          })}
        </>
      )}
      
      <Button 
        title="Back to Garden"
        onPress={() => router.push("/(tabs)/garden")}
      />
    </View>
  );
}