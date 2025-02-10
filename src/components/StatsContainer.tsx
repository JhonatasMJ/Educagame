import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

interface StatsContainerProps { 
    children: React.ReactNode;
}

const StatsContainer = ({ children }: StatsContainerProps) => {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '75%',
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
});

export default StatsContainer;