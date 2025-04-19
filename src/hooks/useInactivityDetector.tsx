"use client";

import React, { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus, PanResponder } from "react-native";

interface UseInactivityDetectorProps {
  timeout?: number;
  onInactivity: () => void;
  resetOnActivity?: boolean;
  shouldShowTutorial?: () => boolean; // Nova propriedade
}

export const useInactivityDetector = ({
  timeout = 6000, // Default 6 seconds
  onInactivity,
  resetOnActivity = true,
  shouldShowTutorial, // Adicione esta linha
}: UseInactivityDetectorProps) => {
  const [isActive, setIsActive] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Function to reset the inactivity timer
  const resetInactivityTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsActive(true);

    // Dentro da função resetInactivityTimer no hook useInactivityDetector
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
      if (shouldShowTutorial ? shouldShowTutorial() : true) {
        onInactivity();
      }
    }, timeout);
  };

  // Set up PanResponder to detect user interactions
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (resetOnActivity) {
          resetInactivityTimer();
        }
      },
      onPanResponderMove: () => {
        if (resetOnActivity) {
          resetInactivityTimer();
        }
      },
      onPanResponderRelease: () => {
        if (resetOnActivity) {
          resetInactivityTimer();
        }
      },
    })
  ).current;

  // Handle app state changes (background/foreground)
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // App has come to the foreground
      if (resetOnActivity) {
        resetInactivityTimer();
      }
    }
    appState.current = nextAppState;
  };

  // Set up the inactivity timer and app state listener
  useEffect(() => {
    // Start the initial timer
    resetInactivityTimer();

    // Set up app state change listener
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Clean up
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      subscription.remove();
    };
  }, [timeout, resetOnActivity]);

  // Function to manually reset the timer
  const resetTimer = () => {
    resetInactivityTimer();
  };

  return {
    isActive,
    panResponder,
    resetTimer,
  };
};
