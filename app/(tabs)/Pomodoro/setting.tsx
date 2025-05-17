import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

// Define the setting interface directly in the file
interface Setting {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  session: number;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [localSettings, setLocalSettings] = useState({
    work: "25",
    shortBreak: "5",
    longBreak: "15",
    session: "2",
  });
  const [error, setError] = useState<string>();
  const [fileContent, setFileContent] = useState<Setting>();

  const fileUri = FileSystem.documentDirectory + "setting.json";

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        // Check if file exists
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        // Create file with default values if it doesn't exist
        if (!fileInfo.exists) {
          const defaultSettings: Setting = {
            workDuration: 25 * 60,
            shortBreakDuration: 5 * 60,
            longBreakDuration: 15 * 60,
            session: 4
          };
          await FileSystem.writeAsStringAsync(
            fileUri,
            JSON.stringify(defaultSettings),
            { encoding: FileSystem.EncodingType.UTF8 }
          );
          setFileContent(defaultSettings);
          return;
        }

        // Load existing settings
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const parsedSettings = JSON.parse(fileContent) as Setting;
        setFileContent(parsedSettings);
        
      } catch (error) {
        console.error("Error initializing settings:", error);
        setError("Không thể tải cài đặt");
      }
    };

    initializeSettings();
  }, []);

  // Update local settings when file content changes
  useEffect(() => {
    if (fileContent) {
      setLocalSettings({
        work: String(Math.floor(fileContent.workDuration / 60 )),
        shortBreak: String(Math.floor(fileContent.shortBreakDuration / 60)),
        longBreak: String(Math.floor(fileContent.longBreakDuration / 60)),
        session: String(fileContent.session),
      });
    }
  }, [fileContent]);

  const validateInputs = (): boolean => {
    // First check for empty fields
    if (!localSettings.work.trim() || !localSettings.shortBreak.trim() || 
        !localSettings.longBreak.trim() || !localSettings.session.trim()) {
      setError("Vui lòng điền đầy đủ thông tin");
      return false;
    }
  
    // Improved number validation
    const workValue = localSettings.work.replace(',', '.'); // Handle comma decimals
    const shortBreakValue = localSettings.shortBreak.replace(',', '.');
    const longBreakValue = localSettings.longBreak.replace(',', '.');
    const sessionValue = localSettings.session.replace(',', '.');
  
    if (!/^\d+$/.test(workValue)) {
      setError("Pomodoro phải là số nguyên dương");
      return false;
    }
    if (!/^\d+$/.test(shortBreakValue)) {
      setError("Nghỉ ngắn phải là số nguyên dương");
      return false;
    }
    if (!/^\d+$/.test(longBreakValue)) {
      setError("Nghỉ dài phải là số nguyên dương");
      return false;
    }
    if (!/^\d+$/.test(sessionValue)) {
      setError("Kỳ phải là số nguyên dương");
      return false;
    }
  
    // Convert to numbers after validation
    const workNum = parseInt(workValue);
    const shortBreakNum = parseInt(shortBreakValue);
    const longBreakNum = parseInt(longBreakValue);
    const sessionNum = parseInt(sessionValue);
  
    // Check positive values
    if (workNum <= 0) {
      setError("Pomodoro phải lớn hơn 0");
      return false;
    }
    if (shortBreakNum <= 0) {
      setError("Nghỉ ngắn phải lớn hơn 0");
      return false;
    }
    if (longBreakNum <= 0) {
      setError("Nghỉ dài phải lớn hơn 0");
      return false;
    }
    if (sessionNum <= 0) {
      setError("Kỳ phải lớn hơn 0");
      return false;
    }
  
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    try {
      const newSettings: Setting = {
        workDuration: Math.min(Number(localSettings.work) * 60, 5940), // Max 99 minutes
        shortBreakDuration: Math.min(Number(localSettings.shortBreak) * 60, 5940),
        longBreakDuration: Math.min(Number(localSettings.longBreak) * 60, 5940),
        session: Math.min(Number(localSettings.session), 100), // Max 100 sessions
      };

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(newSettings),
        { encoding: FileSystem.EncodingType.UTF8 }
      );

      router.replace("/(tabs)/Pomodoro/pomodoro");
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Lỗi khi lưu cài đặt");
    }
  };

  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            <Ionicons name="settings-outline" size={34} color="#4B5320" /> Cài Đặt
          </Text>
        </View>

        <ScrollView>
          <View style={styles.settingContainer}>
            <Text style={styles.subtitle}>Chỉnh thời gian</Text>
            <View style={styles.timeContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Pomodoro (phút)</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setLocalSettings(prev => ({...prev, work: text}))}
                  value={localSettings.work}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nghỉ ngắn (phút)</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setLocalSettings(prev => ({...prev, shortBreak: text}))}
                  value={localSettings.shortBreak}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nghỉ dài (phút)</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setLocalSettings(prev => ({...prev, longBreak: text}))}
                  value={localSettings.longBreak}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Số kỳ</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setLocalSettings(prev => ({...prev, session: text}))}
                  value={localSettings.session}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Lưu cài đặt</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    paddingBottom: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  settingContainer: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#444",
  },
  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  inputContainer: {
    width: "48%",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#FAFAFA",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4B5320",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});