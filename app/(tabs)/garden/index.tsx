import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Button, Pressable, Image, ImageBackground} from 'react-native';
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from 'react';

interface treeLayoutInfo {
  layout : Record<string, string>,
}

export default  function Tab() {
  const router = useRouter();
  const [fileContent, setFileContent] = useState<treeLayoutInfo>();

  useEffect(() => {
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

    // FIXME: when file just got created, getting data might not be necessary
    const getData = async () => {
        try {
          const fileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8
          });
          
          const jsonData = JSON.parse(fileContent) as treeLayoutInfo;
          console.log('File content:', jsonData);
          setFileContent(jsonData);
        } catch (e) {
          return null;
        }
    };

    getData();
  }, []);

  const deleteAllFiles = async () => {
    try {
      if (!FileSystem.documentDirectory) {
        return
      }
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      
      await Promise.all(
        files.map(async (file) => {
          const fileUri = `${FileSystem.documentDirectory}${file}`;
          await FileSystem.deleteAsync(fileUri);
        })
      );
      
      console.log('All files in document directory deleted');
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  };

  const layoutData = fileContent ? fileContent.layout : {};
  const backgroundImg = require("../../../assets/images/background.png");

  return (
    <View style={styles.container}>
      {/* <Text></Text> */}
      <Pressable onPress={() => router.push(
        {
          pathname : "/(tabs)/garden/inventory",
          params : {name : "pot"}
        })}>
        {"pot" in layoutData && layoutData["pot"] ? (
          <Image
            source={{uri : FileSystem.documentDirectory+"trees/"+layoutData["pot"]}}
            style={{width: 300, height: 300}}
          />
        ) : (
          <Text>+</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundImage : '../../../assets/images/background.png',
    width : '100%',
    height : '100%',
  },
});
