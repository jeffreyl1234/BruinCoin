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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
  const [loading, setLoading] = useState(true);

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
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            user_name: authUser.user_metadata?.user_name || null,
            bio: null,
            rating: null,
          });
        }
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
                <View style={styles.profileImage}>
                  <View style={styles.profileImageInner} />
                </View>
              </View>
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName}>{getDisplayName()}</Text>
                  <TouchableOpacity style={styles.messageButton}>
                    <Ionicons name="mail-outline" size={24} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
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
              </View>
            </View>

            {/* About Section */}
            {user?.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            )}

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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    borderWidth: 3,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e5e7eb',
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

