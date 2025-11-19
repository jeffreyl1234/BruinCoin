import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabaseClient';
import Constants from 'expo-constants';

interface ProfileScreenProps {
  onBack?: () => void;
  onLogout?: () => void;
}

interface User {
  id: string;
  user_name: string | null;
  email: string;
  bio: string | null;
  rating: number | null;
  profile_picture_url: string | null;
}

interface Trade {
  id: string;
  title: string;
  description: string;
  price: number | null;
  trade_options: string;
  category: string | null;
  image_urls: string[] | null;
}

export default function ProfileScreen({ onBack, onLogout }: ProfileScreenProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userListings, setUserListings] = useState<Trade[]>([]);
  const [userLookingFors, setUserLookingFors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [editingBio, setEditingBio] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user from Supabase auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error('Failed to get current user:', authError);
        setLoading(false);
        return;
      }

      // Fetch user profile from API
      const userResponse = await fetch(`${apiUrl}/api/users/${authUser.id}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.user) {
          setUser(userData.user);
          setEditingName(userData.user.user_name || '');
          setEditingBio(userData.user.bio || '');
          setProfileImageUri(userData.user.profile_picture_url || null);
        }
      } else if (userResponse.status === 404) {
        // User doesn't exist in users table, create one
        const createResponse = await fetch(`${apiUrl}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: authUser.id,
            email: authUser.email || '',
            user_name: authUser.user_metadata?.user_name || null,
          }),
        });
        
        if (createResponse.ok) {
          const createData = await createResponse.json();
          if (createData.user) {
            setUser(createData.user);
          }
        } else {
          // Fallback to auth user data if creation fails
          const fallbackUser = {
            id: authUser.id,
            email: authUser.email || '',
            user_name: authUser.user_metadata?.user_name || null,
            bio: null,
            rating: null,
            profile_picture_url: null,
          };
          setUser(fallbackUser);
          setEditingName(fallbackUser.user_name || '');
          setEditingBio(fallbackUser.bio || '');
          setProfileImageUri(fallbackUser.profile_picture_url || null);
        }
      }

      // Fetch user looking fors
      const lookingFors = await fetch(`${apiUrl}/api/looking-for/${authUser.id}`);
      if (lookingFors.ok) {
        const lookingForsData = await lookingFors.json();
        setUserLookingFors(lookingForsData.items ?? []);
      } else {
        console.error('Failed to fetch looking-for items:', lookingFors.status, lookingFors.statusText);
      }

      // Fetch user's listings
      const listingsResponse = await fetch(`${apiUrl}/api/trades?offerer_user_id=${authUser.id}&limit=20&accepted=false`);
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        if (listingsData.trades) {
          setUserListings(listingsData.trades);
        }
      } else {
        console.error('Failed to fetch listings:', listingsResponse.status, listingsResponse.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (trade: Trade) => {
    if (trade.trade_options === 'Sell' && trade.price !== null) {
      return `$${trade.price.toFixed(2)}`;
    } else if (trade.trade_options === 'Trade') {
      return 'Trade';
    } else if (trade.trade_options === 'Looking for') {
      return 'Looking for';
    }
    return '';
  };

  const getUsername = () => {
    if (user?.user_name) return user.user_name;
    if (user?.email) {
      const emailPart = user.email.split('@')[0];
      // Remove dots and format nicely
      return emailPart.replace(/\./g, '');
    }
    return 'User';
  };

  const getDisplayName = () => {
    if (user?.user_name) return user.user_name;
    if (user?.email) {
      const emailPart = user.email.split('@')[0];
      // Capitalize first letter of each word
      return emailPart.split('.').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ') || emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    return 'User';
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          if (onLogout) onLogout();
        },
      },
    ]);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditingName(user?.user_name || '');
    setEditingBio(user?.bio || '');
    setProfileImageUri(user?.profile_picture_url || null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingName(user?.user_name || '');
    setEditingBio(user?.bio || '');
    setProfileImageUri(user?.profile_picture_url || null);
  };

  const pickProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to select a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfileImage = async (imageUri: string, userId: string): Promise<string | null> => {
    try {
      // Read file as base64
      const base64String = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64String || base64String.length === 0) {
        throw new Error('Failed to read image file');
      }

      // Determine MIME type
      let mimeType = 'image/jpeg';
      const uriParts = imageUri.split('.');
      if (uriParts.length > 1) {
        const ext = uriParts[uriParts.length - 1].toLowerCase().split('?')[0];
        if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'gif') mimeType = 'image/gif';
        else if (ext === 'webp') mimeType = 'image/webp';
      }

      // Format as data URL
      const dataUrl = `data:${mimeType};base64,${base64String}`;

      // Upload via API
      const response = await fetch(`${apiUrl}/api/upload/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: [dataUrl],
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      return data.urls && data.urls.length > 0 ? data.urls[0] : null;
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Get current user from Supabase auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        Alert.alert('Error', 'Failed to get current user');
        setSaving(false);
        return;
      }

      let profilePictureUrl = profileImageUri;

      // Upload new profile image if a local URI is set (not already a URL)
      if (profileImageUri && !profileImageUri.startsWith('http')) {
        try {
          const uploadedUrl = await uploadProfileImage(profileImageUri, authUser.id);
          if (uploadedUrl) {
            profilePictureUrl = uploadedUrl;
          } else {
            Alert.alert('Warning', 'Failed to upload profile picture. Continue without updating it?', [
              { text: 'Cancel', onPress: () => { setSaving(false); return; } },
              { text: 'Continue', onPress: () => {} }
            ]);
            if (!uploadedUrl) {
              profilePictureUrl = user.profile_picture_url; // Keep existing
            }
          }
        } catch (error: any) {
          Alert.alert('Error', error.message || 'Failed to upload profile picture');
          setSaving(false);
          return;
        }
      }

      // Update user profile
      const updateData: Record<string, string> = {};
      if (editingName.trim() !== (user.user_name || '')) {
        updateData.user_name = editingName.trim();
      }
      if (editingBio.trim() !== (user.bio || '')) {
        updateData.bio = editingBio.trim();
      }
      if (profilePictureUrl !== user.profile_picture_url) {
        updateData.profile_picture_url = profilePictureUrl || '';
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setSaving(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/users/${authUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Update failed' }));
        Alert.alert('Error', errorData.error || 'Failed to update profile');
        setSaving(false);
        return;
      }

      const responseData = await response.json();
      if (responseData.user) {
        setUser(responseData.user);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Seller Profile Page</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#9ca3af"
              editable={false}
            />
          </View>
          <View style={styles.usernameTag}>
            <Text style={styles.usernameText}>{getUsername()}</Text>
          </View>
          {!isEditing ? (
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color="#3b82f6" />
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <Ionicons name="close" size={20} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <>
            {/* Profile Information */}
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <TouchableOpacity 
                  onPress={isEditing ? pickProfileImage : undefined}
                  disabled={!isEditing}
                  style={styles.profileImageTouchable}
                >
                  <View style={styles.profileImage}>
                    {profileImageUri ? (
                      <Image 
                        source={{ uri: profileImageUri }} 
                        style={styles.profileImageInner}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.profileImageInner} />
                    )}
                    {isEditing && (
                      <View style={styles.profileImageOverlay}>
                        <Ionicons name="camera" size={24} color="#ffffff" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  {isEditing ? (
                    <TextInput
                      style={styles.nameInput}
                      value={editingName}
                      onChangeText={setEditingName}
                      placeholder="Enter your name"
                      placeholderTextColor="#9ca3af"
                    />
                  ) : (
                    <Text style={styles.profileName}>{getDisplayName()}</Text>
                  )}
                  {!isEditing && (
                    <TouchableOpacity style={styles.messageButton}>
                      <Ionicons name="mail-outline" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                  )}
                </View>
                {!isEditing && (
                  <View style={styles.ratingContainer}>
                    {[...Array(5)].map((_, i) => {
                      const rating = user?.rating || 0;
                      const filled = i < Math.floor(rating);
                      return (
                        <View key={i} style={i > 0 ? { marginLeft: 2 } : undefined}>
                          <Ionicons 
                            name="star" 
                            size={20} 
                            color={filled ? "#3b82f6" : "#e5e7eb"} 
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              {isEditing ? (
                <TextInput
                  style={styles.bioInput}
                  value={editingBio}
                  onChangeText={setEditingBio}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              ) : (
                <Text style={styles.bioText}>{user?.bio || 'No bio yet'}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Looking for</Text>
              {userLookingFors && userLookingFors.length > 0 ? (
                <View style={styles.tagsContainer}>
                  {userLookingFors.map((item, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No items set</Text>
              )}
            </View>

            {/* Listings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Listings</Text>
              {userListings.length > 0 ? (
                <View style={styles.listingsGrid}>
                  {userListings.map((listing) => (
                    <View key={listing.id} style={styles.listingCard}>
                      <View style={styles.listingImage} />
                      <Text style={styles.listingTitle} numberOfLines={2}>{listing.title}</Text>
                      <View style={styles.listingStatusContainer}>
                        <View style={styles.listingStatusDot} />
                        <Text style={styles.listingStatusText}>{formatPrice(listing)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No listings yet</Text>
              )}
            </View>
          </>
        )}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  topBar: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  backButton: {
    marginRight: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  usernameTag: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  usernameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  editButton: {
    marginLeft: 8,
    padding: 4,
  },
  editActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  cancelButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 4,
    paddingHorizontal: 8,
  },
  profileSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImageTouchable: {
    width: 100,
    height: 100,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    borderWidth: 3,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImageInner: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#e5e7eb',
  },
  profileImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  nameInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#3b82f6',
    paddingBottom: 4,
  },
  messageButton: {
    padding: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  section: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  bulletList: {
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#1f2937',
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  bioText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  bioInput: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listingCard: {
    width: '47%',
    marginBottom: 16,
  },
  listingImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  listingStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    marginRight: 6,
  },
  listingStatusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  logoutContainer: {
  alignItems: 'center',
  marginTop: 24,
  marginBottom: 40,
},
logoutButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fee2e2',
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 24,
},
logoutText: {
  color: '#ef4444',
  fontSize: 16,
  fontWeight: '600',
},
});

