import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SettingsScreenProps {
  onBack: () => void;
  onEditProfile: () => void;
  onLogout: () => void;
}

export default function SettingsScreen({ onBack, onEditProfile, onLogout }: SettingsScreenProps) {
  const handleSupport = () => {
    Linking.openURL('mailto:projectbtwn@gmail.com?subject=Support Request');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings and activity</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={onEditProfile}>
          <View style={[styles.menuIcon, { backgroundColor: '#8fa4d3' }]}>
            <Ionicons name="person" size={20} color="#ffffff" />
          </View>
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSupport}>
          <View style={[styles.menuIcon, { backgroundColor: '#8fa4d3' }]}>
            <Ionicons name="headset" size={20} color="#ffffff" />
          </View>
          <Text style={styles.menuText}>Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
          <View style={[styles.menuIcon, { backgroundColor: '#8fa4d3' }]}>
            <Ionicons name="log-out" size={20} color="#ffffff" />
          </View>
          <Text style={styles.menuText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 36,
  },
  menuContainer: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
});