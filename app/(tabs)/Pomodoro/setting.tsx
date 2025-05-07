import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { View, Text, Switch, TextInput, StyleSheet, TouchableOpacity, ScrollView} from "react-native";
import { router, useFocusEffect, useRouter } from "expo-router";
import { setting } from "@/interfaces";
import { useSharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';


export default function App() {
  const router = useRouter();
  const [setting, setSetting] = useState({
    work : "25",
    shortBreak : "5",
    longBreak : "15",
    session : "2",
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
      session : 0,
    }

    for (const [key, value] of Object.entries(setting)) {
      if (value !== "") {
        if (!parseInt(value)) {
          setError(`${key} không hợp lệ(chỉ có thể ghi chữ số và các số phải lớn hơn 0)`);
          return;
        }
      } else {
        setError("Không được để ô trống");
        return;
      }
    } 

    data.session = parseInt(setting.session);
    data.longBreakDuration = parseInt(setting.longBreak) * 60;
    data.shortBreakDuration = parseInt(setting.shortBreak) * 60;
    data.workDuration = parseInt(setting.work) * 60;


    // console.log(`data:${data}`);

    saveSettings(data);
    
    router.replace("/(tabs)/Pomodoro/pomodoro");
  };

  return (
	<View style={styles.backgroundContainer}>
    <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              <Ionicons name="settings-outline" size={34} color="black" /> Cài Đặt
            </Text>
          </View>
    
          <ScrollView>
            <View style={styles.settingContainer}>
              <Text style={styles.subtitle}>Chỉnh thời gian</Text>
              <View style={styles.timeContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Pomodoro</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                      setSetting(prev => ({...prev, work : text}))
                    }}
                    value={String(setting.work)}
                    inputMode="numeric"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nghỉ ngắn</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                      setSetting(prev => ({...prev, shortBreak : text}));
                    }}
                    value={String(setting.shortBreak)}
                    inputMode="numeric"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nghỉ dài</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                      setSetting(prev => ({...prev, longBreak : text}))
                    }}
                    value={String(setting.longBreak)}
                    inputMode="numeric"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Kỳ</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                      setSetting(prev => ({...prev, session : text}))
                    }}
                    value={String(setting.session)}
                    inputMode="numeric"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
          <View>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
  </View>
  )
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
    width: "90%",
    height: "100%",
    borderRadius: 5,
    borderEndEndRadius : 0,
    borderStartEndRadius : 0,
    marginTop: 20,
    elevation: 10,
  },
  titleContainer : {
    borderBottomWidth : 1,
    borderColor : "#cacaca",
  },
  settingContainer: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Evenly space items
    borderBottomWidth: 1,
    borderColor : "#cacaca",
  },
  inputContainer: {
    width: "45%", // Slightly less than 50% to account for margins
    marginBottom: 16, // Space between rows
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#888",
    marginBottom: 15,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 16,
    width: "80%",
    height: 45,
    margin: 5,
  },
  errorText: {
    color: 'red',
  },
  button: {
    backgroundColor: "#222",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});