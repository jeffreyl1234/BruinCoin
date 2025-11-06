import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavigationProps {
  currentScreen: 'home' | 'search' | 'profile' | 'messages';
  onHomePress: () => void;
  onSearchPress: () => void;
  onMessagesPress: () => void;
  onProfilePress: () => void;
  onAddPress: () => void;
}

export default function BottomNavigation({ 
  currentScreen, 
  onHomePress, 
  onSearchPress,
  onMessagesPress,
  onProfilePress, 
  onAddPress 
}: BottomNavigationProps) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={onHomePress}>
        {currentScreen === 'home' && <View style={styles.activeIndicator} />}
        <Ionicons 
          name="home" 
          size={28} 
          color={currentScreen === 'home' ? '#3b82f6' : '#6b7280'} 
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={onSearchPress}>
        {currentScreen === 'search' && <View style={styles.activeIndicator} />}
        <Ionicons 
          name="search" 
          size={28} 
          color={currentScreen === 'search' ? '#3b82f6' : '#6b7280'} 
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={onAddPress}>
        <Ionicons name="add-circle" size={28} color="#6b7280" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={onMessagesPress}>
        {currentScreen === 'messages' && <View style={styles.activeIndicator} />}
        <Ionicons 
          name="mail" 
          size={28} 
          color={currentScreen === 'messages' ? '#3b82f6' : '#6b7280'} 
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={onProfilePress}>
        {currentScreen === 'profile' && <View style={styles.activeIndicator} />}
        <Ionicons 
          name="person" 
          size={28} 
          color={currentScreen === 'profile' ? '#3b82f6' : '#6b7280'} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
    paddingBottom: 32,
    minHeight: 60,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
  },
});

