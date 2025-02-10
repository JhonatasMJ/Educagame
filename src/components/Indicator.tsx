import React from "react";
import { View, StyleSheet } from "react-native";

interface StepIndicatorProps { 	
    currentStep: number;
}

const StepIndicator = ({ currentStep }:StepIndicatorProps) => {
  return (
    <View style={styles.indicatorContainer}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.indicator,
            currentStep === step && styles.activeIndicator,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,

  
  },
  indicator: {
    width: 16,
    height: 16,
    borderRadius: '100%',
    backgroundColor: "#eee",
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: "#3185BE",
  },
});

export default StepIndicator;
