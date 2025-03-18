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

  const handleOpenDrawer = () => {
    if (Platform.OS === 'web' && isDesktop) {
      onOpenDrawer?.(); // Usa a função customizada para web
    } else {
      navigation?.openDrawer(); // Usa a função do navigation para mobile
    }
  };

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
    >
      <SafeAreaView style={styles.container}>
        
        <View style={styles.topSection}>
    
          <TouchableOpacity
            onPress={handleOpenDrawer}
            style={styles.settingsButton}
            activeOpacity={0.7}
          >
            <FontAwesome size={28} name="gear" color='#fff' />
          </TouchableOpacity>
        </View>
        
       
        <View style={styles.avatarContainer}>
          <AvatarComponent width={200} height={270} />
        </View>
        

        <View style={styles.statsContainerWrapper}>
         
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{nome || "Usuário"}</Text>
            <Text style={styles.userSubscription}>Assinante desde abril de 2024</Text>
          </View>
          
          {/* Stats cards */}
          <View style={styles.statsContainer}>
          
            {[1, 2, 3, 4, 5].map((item, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIconText}>📨</Text>
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Onocash</Text>
                  <Text style={styles.statValue}>2800</Text>
                </View>
                <TouchableOpacity style={styles.statAction}>
                  <FontAwesome name="chevron-right" size={16} color="#56A6DC" />
                </TouchableOpacity>
              </View>
            ))}
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
  scrollView: {
    flex: 1,
    backgroundColor: '#56A6DC',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  topSection: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  avatarContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginBottom: 40,
    zIndex: 10,
  },
  statsContainerWrapper: {
    flex: 1,
    backgroundColor: '#2D2D2D',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingBottom: 40,
    marginTop: -20,
    zIndex: 20,
  },
  userInfoContainer: {
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  userSubscription: {
    fontSize: 16,
    color: '#EAAE00',
    fontWeight: '500',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(86, 166, 220, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statIconText: {
    fontSize: 24,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  statAction: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(86, 166, 220, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StatsScreen;