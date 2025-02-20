import React, { useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import BigAvatar1 from '../../../assets/images/grande-avatar1.svg';
import { CustomDrawerContent } from '@/src/components/CustomDrawerContent';
import useDeviceType from '@/useDeviceType';
import { MOBILE_WIDTH } from '@/PlataformWrapper';
const { height, width } = Dimensions.get('window');
const Drawer = createDrawerNavigator();

console.log(width, height);
// Stats Content Component
const StatsContent = ({ navigation }: any) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -250],
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
        style={[styles.scrollView, { zIndex: 15 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
          <TouchableOpacity 
        onPress={() => navigation.openDrawer()} 
        style={styles.avatarButton}
      >
        <FontAwesome size={45} name="gear" color='#fff' />
      </TouchableOpacity>

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
              <Text style={styles.statIconText}>📨</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Onocash</Text>
                <Text style={styles.statValue}>2800</Text>
              </View>
            </View>
            <View style={styles.statContainer}>
              <Text style={styles.statIconText}>📨</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Onocash</Text>
                <Text style={styles.statValue}>2800</Text>
              </View>
            </View>
            <View style={styles.statContainer}>
              <Text style={styles.statIconText}>📨</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Onocash</Text>
                <Text style={styles.statValue}>2800</Text>
              </View>
            </View>
            <View style={styles.statContainer}>
              <Text style={styles.statIconText}>📨</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Onocash</Text>
                <Text style={styles.statValue}>2800</Text>
              </View>
            </View>
            <View style={styles.statContainer}>
              <Text style={styles.statIconText}>📨</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Onocash</Text>
                <Text style={styles.statValue}>2800</Text>
              </View>
            </View>
            {/* Add other stat containers here */}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// Main Stats Screen with Drawer
const StatsScreen = () => {
  const { isDesktop, isMobileDevice } = useDeviceType();
  
  // Calculate drawer width based on device type and platform
  const getDrawerWidth = () => {
    if (Platform.OS === 'web' && isDesktop) {
      return Math.min(320, MOBILE_WIDTH * 0.7);
    }
    return width * 0.8;
  };

  function drawerRight (){
    const { width } = Dimensions.get('window');
    if(width >= 1400 && width < 1499){
      return '240%' as string
    } else if (width >= 1500 && width < 1599){
      return '240%' as string
    } else if (width >= 1600 && width < 1699){
      return '240%' as string 
    } else if (width >= 1700 && width < 1899){
      return '240%' as string
    } else if (width >= 1900){
      return '240%' as string
    } else {
      return '240%' as string
    }
  } 

  // Calculate the correct right position for the drawer
  const getDrawerPosition = () => {
    if (Platform.OS === 'web' && isDesktop) {
      const simulatorPosition = drawerRight();
      return simulatorPosition;
    }
    return 0;
  };

  return (
    <View style={styles.navigatorContainer}>
      <Drawer.Navigator
        screenOptions={{
          drawerPosition: 'right',
          drawerType: 'slide',
          overlayColor: 'rgba(0,0,0,0.7)',
          drawerStyle: {
            backgroundColor: '#fff',
           //width: getDrawerWidth(),
            ...(Platform.OS === 'web' && isDesktop && {
              height: '100%',
              width: 320,
              position: 'absolute',
              right:  getDrawerPosition(),
              top: 0,
            }),
          },
          headerShown: false,
          swipeEdgeWidth: Platform.OS === 'web' && isDesktop ? 
            MOBILE_WIDTH : undefined,
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen 
          name="StatsContent" 
          component={StatsContent}
          options={{
            drawerLabel: 'Stats',
          }}
        />
      </Drawer.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  navigatorContainer: {
    flex: 1,
    position: 'relative',
    ...(Platform.OS === 'web' && {
      overflow: 'hidden', // Prevent drawer from breaking mobile simulator bounds
    }),
  },
  container: {
    flex: 1,
    backgroundColor: '#56A6DC',
  },
  avatarContainer: {
    width: '100%',
    position: 'absolute',
    top: 0,
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
  avatar: {
    marginTop: marginTopDoAvatar(),
    zIndex: 2
  },
  titleContainer: {
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

function topDoContainerDosResultados(): any {
  if (width >= 1280){
    return '25%';
  } else if (width >= 1300){
    return '50%';
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
} else if (width >= 1300 ){
  return '0.5%';
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

export default StatsScreen;