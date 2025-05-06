import { Link, router, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as FileSystem from "expo-file-system";
import { setting } from "@/interfaces"

const PomodoroTimer = () => {
  // Timer states
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(3); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [fileContent, setFileContent] = useState<setting>();
  const interval = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const fileUri = FileSystem.documentDirectory + "setting.json";

  // Timer durations in seconds
  let workDuration = 3;
  let longBreakDuration = 15 * 60;
  let shortBreakDuration = 5 * 60;
  let longBreakInterval = 1;

  const breakDuration = useRef(shortBreakDuration);

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
      }``
    };
    checkExist();
  }, []);

  useFocusEffect(() => {
    const getData = async () => {
      try {
        const FileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const jsonData = JSON.parse(FileContent) as setting;
        // console.log(`got ${FileContent}`);
        setFileContent(jsonData);
      } catch (e) {
        console.error("Error reading file content: ", e);
        return null;
      }
    };
    getData();
  });

  useEffect(() => {
    const breakMode = breakDuration.current === shortBreakDuration ? "shortBreak" : "longBreak";

    if (fileContent) {
      ({
        shortBreakDuration: shortBreakDuration,
        longBreakDuration: longBreakDuration,
        workDuration: workDuration,
        session: longBreakInterval,
      } = fileContent);
    }

    breakDuration.current = breakMode === 'shortBreak' ? shortBreakDuration : longBreakDuration;
    
    resetTimer();
  }, [fileContent]);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerEnd();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleTimerEnd = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Switch mode
    const nextMode = mode === 'work' ? 'break' : 'work';
    if (nextMode === 'break') {
      if (interval.current > longBreakInterval) {
        breakDuration.current = longBreakDuration;
        interval.current = 0;
      } else {
        breakDuration.current = shortBreakDuration;
        interval.current++;
      }
      // router.push("/(tabs)/Pomodoro/treeReward");
    }
    switchMode(nextMode);
  };

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeLeft(mode === 'work' ? workDuration : breakDuration.current);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    pauseTimer();
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? workDuration : breakDuration.current);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View>
      <Text>Pomodoro Timer</Text>

      <View>
        <Link href={"/(tabs)/Pomodoro/setting"}>Setting</Link>
      </View>

      <View>
        <TouchableOpacity onPress={() => switchMode("work")}>
          <Text>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => switchMode("break")}>
          <Text>Break</Text>
        </TouchableOpacity>
      </View>

      <Text>{mode === "work" ? "Work Time" : "Break Time"}</Text>
      <Text>{formatTime(timeLeft)}</Text>

      <View>
        {!isActive ? (
          <TouchableOpacity onPress={startTimer}>
            <Text>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={pauseTimer}>
            <Text>Pause</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={resetTimer}>
          <Text>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PomodoroTimer;