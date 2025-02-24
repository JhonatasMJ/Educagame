import React, { useRef, useEffect, useState } from 'react';
import { Animated, PanResponder, View, Dimensions, Platform, StyleSheet, TouchableOpacity, Easing } from 'react-native';
import { MOBILE_WIDTH } from '@/PlataformWrapper';
import useDeviceType from '@/useDeviceType';

interface CustomWebDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  drawerWidth?: number;
}

const CustomWebDrawer = ({ 
  isOpen, 
  onClose, 
  children,
  drawerWidth = 320
}: CustomWebDrawerProps) => {
  const { isDesktop } = useDeviceType();
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  const [drawerHeight, setDrawerHeight] = useState(dimensions.height);
  
  // Animation value for drawer position
  const slideAnim = useRef(new Animated.Value(drawerWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  
  // Calculate central position of mobile simulator
  const getSimulatorPosition = () => {
    const windowWidth = Dimensions.get('window').width;
    const simulatorLeftPosition = (windowWidth - MOBILE_WIDTH) / 2;
    return simulatorLeftPosition;
  };

  // Pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        return Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderMove: (_, { dx }) => {
        if (dx > 0) { // Only allow dragging to the right
          const newPosition = Math.min(drawerWidth, dx);
          slideAnim.setValue(newPosition);
          backdropOpacity.setValue(1 - (newPosition / drawerWidth));
        }
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        const shouldClose = dx > drawerWidth / 2 || vx > 0.5;
        if (shouldClose) {
          closeDrawer();
        } else {
          openDrawer();
        }
      },
    })
  ).current;

  const openDrawer = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: drawerWidth,
        useNativeDriver: true,
        tension: 65, // Add spring tension for smoother animation
        friction: 11  // Add friction for better control
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200, // Reduce duration to match drawer closing speed
        useNativeDriver: true,
        easing: Easing.out(Easing.ease) // Add easing for smoother fade
      }),
    ]).start(() => onClose());
  };

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      const newDimensions = Dimensions.get('window');
      setDimensions(newDimensions);
      if (Platform.OS === 'web') {
        setDrawerHeight(window.innerHeight);
      } else {
        setDrawerHeight(newDimensions.height);
      }
    };

    if (Platform.OS === 'web') {
      window.addEventListener('resize', updateDimensions);
    }

    const dimensionsSubscription = Dimensions.addEventListener('change', updateDimensions);

    updateDimensions();

    return () => {
      if (Platform.OS === 'web') {
        window.removeEventListener('resize', updateDimensions);
      }
      dimensionsSubscription.remove();
    };
  }, []);

  // Handle open/close state changes
  useEffect(() => {
    if (isOpen) {
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [isOpen]);

  return (
    <>
   {isOpen && (
  <Animated.View
    style={[
      styles.fullBackdrop,
      {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        opacity: backdropOpacity
      }
    ]}
  >
    <TouchableOpacity
      activeOpacity={1}
      onPress={closeDrawer}
      style={StyleSheet.absoluteFillObject}
    />
  </Animated.View>
)}
      <Animated.View
  {...panResponder.panHandlers}
  style={[
    styles.drawer,
    {
      width: drawerWidth,
      transform: [{
        translateX: slideAnim
      }],
      right: 0, // Change left to right
      position: 'absolute',
      height: '100%',
      top: 0,
    }
  ]}
>
        <View style={styles.drawerHandle} />
        {children}
      </Animated.View>
    </>
  );
};
const styles = StyleSheet.create({
  fullBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9997,
  },
  drawer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    zIndex: 9999,
    pointerEvents: 'auto',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9998,
    pointerEvents: 'auto',
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  }
});

export default CustomWebDrawer;