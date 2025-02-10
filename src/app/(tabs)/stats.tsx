import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatsContainer from '../../components/StatsContainer';

const StatsScreen = () => {
  return (
    <View style={styles.container}>
      <StatsContainer>
        <View style={styles.statContainer}>
          <Text style={styles.statIconText}>📨</Text>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Onocash</Text>
            <Text style={styles.statValue}>2800</Text>
          </View>
        </View>
        
        <View style={styles.statContainer}>
          <Text style={styles.statIconText}>⏰</Text>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Horas</Text>
            <Text style={styles.statValue}>520</Text>
          </View>
        </View>

<View style={styles.statContainer}>
  <Text style={styles.statIconText}>📆</Text>
  <View style={styles.statInfo}>
    <Text style={styles.statLabel}>Dias Seguidos</Text>
    <Text style={styles.statValue}>25</Text>
  </View>
</View>
      </StatsContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  statIconText: {
    fontSize: 24,
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default StatsScreen;