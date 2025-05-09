import { Link, router, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AppState,
  Image,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { setting } from "@/interfaces";
import { Ionicons } from "@expo/vector-icons";
import { Storage } from "expo-storage";
import { bootSave } from "@/interfaces";

const PomodoroTimer = () => {
  const [appState, setAppState] = useState(AppState.currentState);
  // Timer states
  const [startTime, setStartTime] = useState(Date.now());
  const [mode, setMode] = useState<"work" | "break">("work");
  const [breakMode, setBreakMode] = useState<"short" | "long">("short");
  const [timeLeft, setTimeLeft] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [fileContent, setFileContent] = useState<setting>();
  const interval = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTime = useRef<number>(0);

  const fileUri = FileSystem.documentDirectory + "setting.json";

  // Timer durations in seconds
  const workDurationRef = useRef(3);
  const longBreakDurationRef = useRef(15 * 60);
  const shortBreakDurationRef = useRef(5 * 60);
  const longBreakIntervalRef = useRef(1);

  const breakDuration = useRef(shortBreakDurationRef.current);

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

    const getBootSave = async () => {
      // try {
      //   // const item = await Storage.getItem({ key: "bootSave" })
      //   // if (item !== null) {
      //   //   const parsedItem = JSON.parse(item);
      //   //   console.log(parsedItem);
      //   // }
      // } catch (error) {
      //   // Handle invalid keys or read failures
      // }   
    };

    checkExist();
    getBootSave();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const FileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const jsonData = JSON.parse(FileContent) as setting;
      setFileContent(jsonData);
    } catch (e) {
      console.error("Error reading file content: ", e);
      return null;
    }
  }, [fileUri]);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  useEffect(() => {
    if (isActive) return;
    if (!fileContent) return;

    const breakMode =
      breakDuration.current === shortBreakDurationRef.current
        ? "shortBreak"
        : "longBreak";

    workDurationRef.current = fileContent.workDuration / 60 || 25 * 60;
    shortBreakDurationRef.current = fileContent.shortBreakDuration || 5 * 60;
    longBreakDurationRef.current = fileContent.longBreakDuration || 15 * 60;
    longBreakIntervalRef.current = fileContent.session || 4;

    breakDuration.current =
      breakMode === "shortBreak"
        ? shortBreakDurationRef.current
        : longBreakDurationRef.current;

    handleResetTimer();
  }, [fileContent]);

  const changeToSecond = (input: number) => {
    return Math.max(0, Math.floor(input / 1000));
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        const remainingTime = currentTime.current - changeToSecond(Date.now() - startTime);
        setTimeLeft(remainingTime);
        if (remainingTime === 0) {
          handleTimerEnd();
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, startTime]);

  // FIXME: Timer jump ahead 15 sec when switching from inactive to active for a brief moment
  // TODO: Bring timer back to the state before turning off app
  useEffect(() => {
    const subscription = handleInactive();

    return () => subscription.remove();

    function handleInactive() {
      return AppState.addEventListener("change", (nextAppState) => {
        if (
          appState.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          if (isActive) {
            // console.log("hi");
            
            currentTime.current = Math.max(
              0,
              currentTime.current - changeToSecond(Date.now() - startTime)
            );
            setTimeLeft(currentTime.current);
            setStartTime(Date.now());
          }
        } else {
          // const saving : bootSave = {
          //   status: mode,
          //   breakStatus : breakMode,
          //   time : currentTime.current,
          //   start : startTime,
          // };

          // try {
          //   // await Storage.setItem({
          //   //   key: "bootSave",
          //   //   value: JSON.stringify(saving),
          //   // });
          // } catch(e) {
          //   console.error("while trying to bootSave: ", e);
          // }
        }
        setAppState(nextAppState);
      });
    }
  }, [appState, startTime]);

  const updateInterval = () => {
    if (interval.current >= longBreakIntervalRef.current) {
      breakDuration.current = longBreakDurationRef.current;
      setBreakMode("long");
      interval.current = 0;
    } else {
      breakDuration.current = shortBreakDurationRef.current;
      setBreakMode("short");
      interval.current++;
    }
  };

  const handleTimerEnd = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    switchMode(mode === "work" ? "break" : "work");
    if ((mode === "work" ? "break" : "work") === "break") {
      updateInterval();
      // TODO: Switch to in-app notification (optional)
      router.push("/(tabs)/Pomodoro/treeReward");
    }
  };

  const handleStartTimer = () => {
    setStartTime(Date.now());
    setIsActive(true);
  };

  const handlePauseTimer = () => {
    if (isActive) currentTime.current -= changeToSecond(Date.now() - startTime);
    setIsActive(false);
  };

  useEffect(() => {
    onModeChange();

    function onModeChange() {
      handleResetTimer();
    }
  }, [mode]);

  const handleResetTimer = () => {
    handlePauseTimer();
    setStartTime(Date.now());
    const duration =
      mode === "work"
        ? workDurationRef.current
        : breakMode === "short"
        ? shortBreakDurationRef.current
        : longBreakDurationRef.current;
    setTimeLeft(duration);
    currentTime.current = duration;
  };

  const switchMode = (newMode: "work" | "break") => {
    setMode(newMode);
  };

  const handleSkip = () => {
    switchMode(mode === "work" ? "break" : "work");
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}><Ionicons name="leaf" size={20} color="b87de9" />Pomodoro Plant</Text>
        </View>
        <View style={styles.navButtonsContainer}>
          <Link href={"/(tabs)/Pomodoro/setting"}>
            <Ionicons name="settings" size={34} color="black" />
          </Link>
        </View>
      </View>

      <View style={styles.timerContainer}>
        <View style={styles.timerBoxContainer}>
          <Text> #{interval.current} </Text>
          <View style={styles.modeContainer}>
            {
              mode === "work" ?
              <Text
              style={[
                styles.modes,
              ]}
            >
              Pomodoro
            </Text>
            : breakMode === "short" ? 
            <Text style={styles.modes}>Short Break</Text>
            : <Text style={styles.modes}>Long Break</Text>
            }
          </View>
          <View>
            <Text style={styles.timer}>
              {formatTime(timeLeft).slice(0, 2) + '\n'}
              {formatTime(timeLeft).slice(3, 5)}
            </Text>
          </View>
          <View style={styles.timeButtonsContainer}>
            <TouchableOpacity onPress={handleResetTimer}>
              <Text style={styles.timerButtons}>
                <Ionicons name="refresh-circle" size={34} color="b87de9" />
              </Text>
            </TouchableOpacity>
            {!isActive ? (
              <TouchableOpacity onPress={handleStartTimer}>
                <Text style={styles.timerButtons}>
                  <Ionicons name="play-circle" size={34} color="b87de9"/>
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handlePauseTimer}>
                <Text style={styles.timerButtons}>
                  <Ionicons name="pause-circle" size={34} color="b87de9"/>
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.timerButtons}>
                <Ionicons
                  name="play-skip-forward-circle"
                  size={34}
                  color="b87de9"
                />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};


// FIXME: add a grassy background to container
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5F9", // Soft green background
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#A0C878",
    borderBottomWidth: 1,
    borderColor: "#C8E6C9",
  },
  logoContainer: {
    flex: 1,
  },
  logoText: {
    fontWeight: "bold",
  },
  navButtonsContainer: {
    flexDirection: "row",
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
  },
  timerBoxContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
    width: 300,
  },
  modeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    width: "100%",
  },
  modes: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#C8E6C9",
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "600",
    overflow: "hidden",
  },
  timeButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  timerButtons: {
    marginHorizontal: 15,
    fontSize: 20,
    color: "#388E3C",
  },
  timer: {
    textAlign: "center",
    fontSize: 60,
    fontWeight: "bold",
    color: "#2E7D32",
    marginVertical: 10,
  },
});


export default PomodoroTimer;