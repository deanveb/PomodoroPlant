import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { View, Text, Switch, TextInput, StyleSheet, TouchableOpacity} from "react-native";
import { router, useFocusEffect, useRouter } from "expo-router";
import { setting } from "@/interfaces";
import { useSharedValue } from 'react-native-reanimated';

export default function App() {
  const router = useRouter();
  const [setting, setSetting] = useState({
    work : "25",
    shortBreak : "5",
    longBreak : "15",
  })
  const [error, setError] = useState<string>();
  const [fileContent, setFileContent] = useState<setting>();

  const fileUri = FileSystem.documentDirectory + "setting.json";

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
        }
      }
    };
    checkExist();

    const getData = async () => {
      try {
        const FileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const jsonData = JSON.parse(FileContent) as setting;
        console.log(`got ${jsonData}`);
        setFileContent(jsonData);
      } catch (e) {
        console.error("Error reading file content: ", e);
        return null;
      }
    };
    getData();
    
  }, []);

  useEffect(() => {
    if (fileContent) {
      setSetting(prev => ({...prev, work : String(fileContent.workDuration / 60)}));
      setSetting(prev => ({...prev, shortBreak : String(fileContent.shortBreakDuration / 60)}));
      setSetting(prev => ({...prev, longBreak : String(fileContent.longBreakDuration / 60)}));
    }
    // console.log("hi",fileContent.);
  }, [fileContent])

  const handleSave = () => {  
    const saveSettings = async (value : setting) => {
      try {
        const jsonValue = JSON.stringify(value);
        await FileSystem.writeAsStringAsync(
          fileUri,
          jsonValue,
          { encoding: FileSystem.EncodingType.UTF8 }
        );
        console.log(`Saved ${jsonValue}`);
      } catch (e) {
        console.error("while storing data: ",e);
      }
    };

    // In seconds
    const data : setting = {
      workDuration : 0,
      shortBreakDuration : 0,
      longBreakDuration : 0,
    }

    for (const [key, value] of Object.entries(setting)) {
      if (value !== "") {
        if (parseInt(value)) {
          data[key+"Duration" as keyof setting] = parseInt(value) * 60; 

        } else {
          setError(`${key} không hợp lệ(chỉ có thể ghi chữ số)`);
          return;
        }
      } else {
        setError("Không được để ô trống");
        return;
      }
    } 

    // console.log(`data:${data}`);

    saveSettings(data);
    
    router.back();
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        onChangeText={(text) => {
          setSetting(prev => ({...prev, work : text}))
        }}
        value={String(setting.work)}
        inputMode="numeric"
      />
      <TextInput
        style={styles.input}
        onChangeText={(text) => {
          setSetting(prev => ({...prev, shortBreak : text}));
        }}
        value={String(setting.shortBreak)}
        inputMode="numeric"
      />
      <TextInput
        style={styles.input}
        onChangeText={(text) => {
          setSetting(prev => ({...prev, longBreak : text}))
        }}
        value={String(setting.longBreak)}
        inputMode="numeric"
      />

      { error && <Text>Error: {error} </Text> }

      <TouchableOpacity onPress={handleSave}>
        <Text>Save</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#888',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});