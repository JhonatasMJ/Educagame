import React, { useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated, Dimensions, Platform, Touchable, TouchableOpacity } from 'react-native';
import BigAvatar1 from '../../../assets/images/grande-avatar1.svg';
import BigAvatar2 from '../../../assets/images/grande-avatar2.svg';
import BigAvatar3 from '../../../assets/images/grande-avatar3.svg';
import BigAvatar4 from '../../../assets/images/grande-avatar4.svg';
import { useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
    outputRange: [0, -250], // Move much further up to ensure it goes off-screen
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
      pointerEvents="auto" 
      style={[
        styles.avatarContainer,
        { 
          transform: [
            { translateY: avatarTranslateY },
            { scale: avatarScale }
          ],
          opacity: avatarOpacity,
          zIndex: 2
        }
      ]}
    > 
      
      <BigAvatar1 style={styles.avatar} width={200} height={350} />
    </Animated.View>
    
    <Animated.ScrollView
      style={[styles.scrollView, { zIndex: 15 }]} // zIndex menor que o avatarContainer
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
    >
      <TouchableOpacity onPress={() => { console.log('clicou')}} style={styles.avatarButton}>
        <FontAwesome size={45} name="gear" color='#fff' />
      </TouchableOpacity>
        {/* <View style={styles.spacer} /> */}
        <View style={styles.statsContainerWrapper}>
          <View style={styles.titleContainer}>
          <Text style={styles.title}>Nome Usuário</Text>
          <Text style={styles.subtitle}>Assinante desde abril de 2024</Text>
          </View>
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
  <Text style={styles.statIconText}>📆</Text>
  <View style={styles.statInfo}>
    <Text style={styles.statLabel}>Dias Seguidos</Text>
    <Text style={styles.statValue}>25</Text>
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
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#56A6DC',
  },
  avatarContainer: {
    width: '100%',
    position: 'absolute',
    top: 0, // Aumentado significativamente para dar mais margem para subir
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  scrollView: {
    zIndex: 3,
  },
  avatarButton:{
    position: 'absolute',
    top: '2%',
    right: 20,
    zIndex: 999,

  },
  avatar:{
    marginTop: marginTopDoAvatar(),
    zIndex: 2
  },
  titleContainer:{
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 20
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#EAAE00',
  },
  statsContainerWrapper: {
    height: '100%',
    width: '100%',
    top: topDoContainerDosResultados(),
    minHeight: height * 0.7,
    backgroundColor: '#444343',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statsContainer: {
    width: '100%',
    paddingTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: tamanhoLevantaResultados(),
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

function topDoContainerDosResultados(): any {
    if (width >= 1280){
      return '25%';
    } else if (width <= 405){ //para celular bemmm pequeno
      return '22%'
    } else if (width >= 680){ // para tablets
      return '20%';
    } else {
      return '20%'; //qualquer outra coisa, celular grande
    }
  
}

function marginTopDoAvatar(): any {
  if (width >= 1280){ //monitores grandes
    return '3.5%';
  } else if (height <= 708){ //para celulares pequenos
    return '6.75%'
  } else if (width <= 405){ //para celular bemmm pequeno
    return '3.5%'
  } else if (width >= 680){ // para tablets
    return '3%';
  } else if (width == 1024) {
    return '0%';
  } else { //nos que não se encaixam em nenhum dos dois (celular grande)
    return '6%';
  }

}


function tamanhoLevantaResultados(): any {
  if (width >= 1280){ //monitores de desktop
    return '25%';
  } else if (width >= 680){ // para tablets
    return '50%';
  } else if (width <= 405){ //para celular bemmm pequeno
    return '55%'
  } else {
    return '95%'; //para qualquer outro celular
  }

}
