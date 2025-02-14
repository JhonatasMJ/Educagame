import React, { useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated, Dimensions, Platform } from 'react-native';
import BigAvatar1 from '../../../assets/images/grande-avatar1.svg';
import BigAvatar2 from '../../../assets/images/grande-avatar2.svg';
import BigAvatar3 from '../../../assets/images/grande-avatar3.svg';
import BigAvatar4 from '../../../assets/images/grande-avatar4.svg';
import { useLocalSearchParams } from 'expo-router';

const { height, width } = Dimensions.get('window');

const bigAvatarMapping: Record<string, React.FC<any>> = {
  avatar1: BigAvatar1,
  avatar2: BigAvatar2,
  avatar3: BigAvatar3,
  avatar4: BigAvatar4,
};

const StatsScreen = () => {
  const { avatarId, avatarSource } = useLocalSearchParams<{ avatarId: string; avatarSource: string }>();
  const SelectedBigAvatar = avatarSource ? bigAvatarMapping[avatarSource] : null;
  
  // Animated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Create more dramatic movement for the avatar
  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -400], // Move much further up to ensure it goes off-screen
    extrapolate: 'clamp'
  });
  
  const avatarScale = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0.7],
    extrapolate: 'clamp'
  });
  
  const avatarOpacity = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0.4],
    extrapolate: 'clamp'
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.avatarContainer,
          { 
            transform: [
              { translateY: avatarTranslateY },
              { scale: avatarScale }
            ],
            opacity: avatarOpacity
          }
        ]}
      >
        <BigAvatar1 width={182} height={300} />
      </Animated.View>
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={styles.spacer} />
        <View style={styles.statsContainerWrapper}>
          <View style={styles.statsContainer}>
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
            
            <View style={styles.statContainer}>
              <Text style={styles.statIconText}>🏆</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Conquistas</Text>
                <Text style={styles.statValue}>42</Text>
              </View>
            </View>
            
            <View style={styles.statContainer}>
              <Text style={styles.statIconText}>🌟</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Nível</Text>
                <Text style={styles.statValue}>15</Text>
              </View>
            </View>
            
            <View style={styles.statContainer}>
              <Text style={styles.statIconText}>👥</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Amigos</Text>
                <Text style={styles.statValue}>73</Text>
              </View>
            </View>
            
            <View style={styles.statContainer}>
              <Text style={styles.statIconText}>👥</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Amigos</Text>
                <Text style={styles.statValue}>73</Text>
              </View>
            </View>
            
            <View style={styles.statContainer}>
              <Text style={styles.statIconText}>👥</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Amigos</Text>
                <Text style={styles.statValue}>73</Text>
              </View>
            </View>
            
            <View style={{
             height: 100 
            }}/>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'absolute',
    top: 0, // Aumentado significativamente para dar mais margem para subir
    alignSelf: 'center',
    zIndex: 2,
    // Eliminando quaisquer limitações que possam impedir o movimento completo
    overflow: 'visible',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  spacer: {
    height: 320, // Aumentado para compensar a nova posição inicial do avatar
    zIndex: 1,
  },
  statsContainerWrapper: {
    flex: 1,
    width: '100%',
    minHeight: height * 0.7,
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 999,
    elevation: 999, // Garante a sobreposição no Android
  },
  statsContainer: {
    width: '100%',
    paddingTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
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