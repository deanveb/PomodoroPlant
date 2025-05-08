import { Link, router, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AppState,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { setting } from "@/interfaces";
import { Ionicons } from "@expo/vector-icons";
import { Storage } from "expo-storage";

const PomodoroTimer = () => {
  const [appState, setAppState] = useState(AppState.currentState);
  // Timer states
  const [startTime, setStartTime] = useState(Date.now());
  const [mode, setMode] = useState<"work" | "break">("work");
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
        console.log("no");

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

    workDurationRef.current = fileContent.workDuration || 25 * 60;
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
    timer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

    function timer() {
      if (isActive && timeLeft > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft(
            currentTime.current - changeToSecond(Date.now() - startTime)
          );
        }, 1000);
      } else if (timeLeft === 0) {
        handleTimerEnd();
      }
    }
  }, [isActive, startTime, mode, timeLeft]);

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
            currentTime.current = Math.max(
              0,
              currentTime.current - changeToSecond(Date.now() - startTime)
            );
            setTimeLeft(currentTime.current);
            setStartTime(Date.now());
          }
        }
        setAppState(nextAppState);
      });
    }
  }, [appState, startTime]);

  const handleTimerEnd = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Switch mode
    const nextMode = mode === "work" ? "break" : "work";
    if (nextMode === "break") {
      if (interval.current >= longBreakIntervalRef.current) {
        breakDuration.current = longBreakDurationRef.current;
        interval.current = 0;
      } else {
        breakDuration.current = shortBreakDurationRef.current;
        interval.current++;
      }
      // TODO: Switch to in-app notification
      router.push("/(tabs)/Pomodoro/treeReward");
    }
    switchMode(nextMode);
  };

  const handleStartTimer = () => {
    setStartTime(Date.now());
    setIsActive(true);
  };

  const handlePauseTimer = () => {
    currentTime.current -= changeToSecond(Date.now() - startTime);
    setIsActive(false);
  };

  const handleResetTimer = () => {
    handlePauseTimer();
    setStartTime(Date.now());
    setTimeLeft(
      mode === "work" ? workDurationRef.current : breakDuration.current
    );
    currentTime.current =
      mode === "work" ? workDurationRef.current : breakDuration.current;
  };

  const switchMode = (newMode: "work" | "break") => {
    setMode(newMode);
    handleResetTimer();  
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
          <Text>Pomodoro Plant</Text>
        </View>
        <View style={styles.navButtonsContainer}>
          <Link href={"/(tabs)/Pomodoro/setting"}>
            <Ionicons name="settings" size={34} color="black" />
          </Link>
        </View>
      </View>

      <View style={styles.timerContainer}>
        <View style={styles.timerBoxContainer}>
          <View style={styles.modeContainer}>
            <Text style={styles.modes}>Pomodoro</Text>
            <Text style={styles.modes}>Break</Text>
            <Text style={styles.modes}>Long Break</Text>
          </View>
          <View>
            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          </View>
          <View style={styles.timeButtonsContainer}>
            {!isActive ? (
              <TouchableOpacity onPress={handleStartTimer}>
                <Text style={styles.timerButtons}>Start</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handlePauseTimer}>
                <Text style={styles.timerButtons}>Pause</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleResetTimer}>
              <Text style={styles.timerButtons}>
                <Ionicons name="refresh-circle" size={34} color="black" />
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.timerButtons}>
                <Ionicons name="play-skip-forward-circle" size={34} color="black" />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  logoContainer: {
    flex: 1,
  },
  navButtonsContainer: {
    flexDirection: "row",
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#328E6E",
  },
  timerBoxContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 3,
  },
  modeContainer: {
    flexDirection: "row",
  },
  modes: {
    margin: 6,
    fontSize: 18,
  },
  timeButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  timerButtons: {
    margin: 10,
    fontSize: 22,
  },
  timer: {
    textAlign: "center",
    fontSize: 33,
    fontWeight: "bold",
  },
});

export default PomodoroTimer;
