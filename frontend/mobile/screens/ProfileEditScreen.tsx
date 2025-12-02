import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';
import Constants from 'expo-constants';

interface ProfileEditScreenProps {
  onBack: () => void;
}

export default function ProfileEditScreen({ onBack }: ProfileEditScreenProps) {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setName(user.user_metadata?.display_name || '');
        setAbout(user.user_metadata?.bio || '');
        
        const response = await fetch(`${apiUrl}/api/users/${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          if (userData.user) {
            setUsername(userData.user.user_name || '');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Ionicons name="image" size={32} color="#9ca3af" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.nameSection}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name="star" size={16} color="#e5e7eb" style={styles.ratingStar} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TextInput
            style={styles.aboutInput}
            value={about}
            onChangeText={setAbout}
            placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquet nibh ipsum, nec varius mauris finibus ut. Pellentesque molestie ultrices ante."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>



        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Login Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput
              style={styles.textInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="XXX-XXX-XXXX"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.textInput, styles.disabledInput]}
              value={email}
              placeholder="josiebruin@ucla.edu"
              placeholderTextColor="#9ca3af"
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              placeholder="JosieBruin1919"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
      </ScrollView>
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
  menuButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImageContainer: {
    marginRight: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSection: {
    flex: 1,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    marginRight: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  aboutInput: {
    fontSize: 14,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 14,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabledInput: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
});