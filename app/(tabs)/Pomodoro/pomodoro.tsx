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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { setting } from "@/interfaces";
import { owned } from "@/interfaces";
import { tree } from "@/interfaces";

const PomodoroTimer = () => {
  const [appState, setAppState] = useState(AppState.currentState);
  // Timer states
  const [startTime, setStartTime] = useState(Date.now());
  const [mode, setMode] = useState<"work" | "break">("work");
  const [breakMode, setBreakMode] = useState<"short" | "long">("short");
  const [timeLeft, setTimeLeft] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [settingContent, setSettingContent] = useState<setting>();
  const [ownedContent, setOwnedContent] = useState<owned>();
  const [cash, setCash] = useState<number>(0);
  const interval = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTime = useRef<number>(0);

  const settingUri = FileSystem.documentDirectory + "setting.json";
  const ownedUri = FileSystem.documentDirectory + "owned.json";

  // Timer durations in seconds
  const workDurationRef = useRef(3);
  const longBreakDurationRef = useRef(15 * 60);
  const shortBreakDurationRef = useRef(5 * 60);
  const longBreakIntervalRef = useRef(1);

  const breakDuration = useRef(shortBreakDurationRef.current);

  useEffect(() => {
    const checkExist = async () => {
      const settingExist = await FileSystem.getInfoAsync(settingUri);
      if (!settingExist.exists) {
        try {
          await FileSystem.writeAsStringAsync(settingUri, "{}", {
            encoding: FileSystem.EncodingType.UTF8,
          });
        } catch (e) {
          console.error("Error while creating empty file: ", e);
          return;
        }
      }
      const ownedExist = await FileSystem.getInfoAsync(settingUri);
      if (!ownedExist) {
        try {
          await FileSystem.writeAsStringAsync(ownedExist, "{}", {
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
      const FileContent = await FileSystem.readAsStringAsync(settingUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const jsonData = JSON.parse(FileContent) as setting;
      setSettingContent(jsonData);
    } catch (e) {
      console.error("Error reading setting content: ", e);
      return null;
    }
  }, [settingUri]);

  const loadOwned = useCallback(async () => {
    try {
      const FileContent = await FileSystem.readAsStringAsync(ownedUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const jsonData = JSON.parse(FileContent) as owned;
      setOwnedContent(jsonData);
    } catch (e) {
      console.error("Error reading owned content: ", e);
      return null;
    }
  }, [ownedUri]);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
      loadOwned();
    }, [loadSettings])
  );

  useEffect(() => {
    if (isActive) return;
    if (!settingContent) return;

    const breakMode =
      breakDuration.current === shortBreakDurationRef.current
        ? "shortBreak"
        : "longBreak";

    workDurationRef.current = settingContent.workDuration / 60 || 25 * 60;
    shortBreakDurationRef.current = settingContent.shortBreakDuration || 5 * 60;
    longBreakDurationRef.current = settingContent.longBreakDuration || 15 * 60;
    longBreakIntervalRef.current = settingContent.session || 4;

    breakDuration.current =
      breakMode === "shortBreak"
        ? shortBreakDurationRef.current
        : longBreakDurationRef.current;

    handleResetTimer();
  }, [settingContent]);

  useEffect(() => {
    if (ownedContent) {
      setCash(ownedContent.cash);
    }
  }, [ownedContent]);

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
        } setAppState(nextAppState);
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
      router.push({
        pathname: "/(tabs)/Pomodoro/treeReward",
        params: {time: workDurationRef.current},
      });
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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

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
          <View>
            <Text>{cash}</Text>
            <MaterialIcons name="payments" size={20} color="#444" />
          </View>
          <View>
            <Link href={"/(tabs)/Pomodoro/setting"}>
              <Ionicons name="settings" size={34} color="black" />
            </Link>
          </View>
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
            <TouchableOpacity>
              <Text>change</Text>
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