import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import BigAvatar1 from "../../../assets/images/grande-avatar1.svg"
import BigAvatar2 from "../../../assets/images/grande-avatar2.svg"
import BigAvatar3 from "../../../assets/images/grande-avatar3.svg"
import BigAvatar4 from "../../../assets/images/grande-avatar4.svg"
import { CustomDrawerContent } from '@/src/components/CustomDrawerContent';
import useDeviceType from '@/useDeviceType';
import { MOBILE_WIDTH } from '@/PlataformWrapper';
import CustomWebDrawer from '@/src/components/CustomWebDrawer';
import { useAuth } from '@/src/context/AuthContext';
const { height, width } = Dimensions.get('window');
const Drawer = createDrawerNavigator();



const avatarComponents = {
  avatar1: BigAvatar1,
  avatar2: BigAvatar2,
  avatar3: BigAvatar3,
  avatar4: BigAvatar4,
}


const StatsContent = ({ navigation, onOpenDrawer }: any) => {
  const { isDesktop } = useDeviceType();
  const { userData, authUser } = useAuth();
  const nome = `${userData?.nome} ${userData?.sobrenome}`;
  
  const [avatarSource] = useState(userData?.avatarSource || "avatar1")
  
  const AvatarComponent = avatarComponents[avatarSource as keyof typeof avatarComponents] || BigAvatar1

  console.log(userData, authUser?.email)

  const handleOpenDrawer = () => {
    if (Platform.OS === 'web' && isDesktop) {
      onOpenDrawer?.(); // Usa a função customizada para web
    } else {
      navigation?.openDrawer(); // Usa a função do navigation para mobile
    }
  };


  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.avatarContainer}>
          <AvatarComponent style={styles.avatar} width={200} />
          <TouchableOpacity
            onPress={handleOpenDrawer}
            style={styles.avatarButton}
          >
            <FontAwesome size={45} name="gear" color='#fff' />
          </TouchableOpacity>
        </View>
        <View style={styles.statsContainerWrapper} className='rounded-3xl  bg-zinc-700'>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{nome}</Text>
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
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

// Drawer que participa da tela como um componente a parte
const StatsScreen = () => {
  const { isDesktop } = useDeviceType();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // In StatsScreen component:
if (Platform.OS === 'web' && isDesktop) {
  return (
    <View style={[styles.navigatorContainer, { overflow: 'hidden' }]}>
      <StatsContent 
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />
      <CustomWebDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        drawerWidth={Math.min(320, MOBILE_WIDTH * 0.8)} // Limit drawer width
      >
        <CustomDrawerContent 
          closeDrawer={() => setIsDrawerOpen(false)}
        />
      </CustomWebDrawer>
    </View>
  );
}


  return (
    <View style={styles.navigatorContainer}>
      <Drawer.Navigator
        screenOptions={{
          drawerPosition: 'right',
          drawerType: 'slide',
          overlayColor: 'rgba(0,0,0,0.7)',
          drawerStyle: {
            backgroundColor: '#fff',
            width: width * 0.8,
          },
          headerShown: false,
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
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  scrollView: {
    zIndex: 3,
  },
  avatarButton: {
    position: 'absolute',
    top: '8.25%',
    right: 20,
    zIndex: 999,
  },
  avatar: {
    zIndex: 2, 
    top: '6.25%', 
    position: 'relative'
  },
  titleContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 22,
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
    minHeight: height * 0.45,
    width: '100%',
    zIndex: 5,
  },
  statsContainer: {
    width: '100%',
    minHeight: height * 0.65,
    paddingTop: 25,
    paddingBottom: 150,
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