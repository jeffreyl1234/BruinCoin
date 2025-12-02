import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';
import Constants from 'expo-constants';
import TradeCard from '../components/TradeCard';

interface Trade {
  id: string;
  title: string;
  description: string;
  price: number | null;
  trade_options: string;
  category: string | null;
  image_urls: string[] | null;
}

interface EditListingsScreenProps {
  onBack: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function EditListingsScreen({ onBack }: EditListingsScreenProps) {
  const [userListings, setUserListings] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`${apiUrl}/api/trades?offerer_user_id=${user.id}&limit=50&accepted=false`);
      if (response.ok) {
        const data = await response.json();
        setUserListings(data.trades || []);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (tradeId: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(tradeId);
              const response = await fetch(`${apiUrl}/api/trades/${tradeId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                setUserListings(prev => prev.filter(listing => listing.id !== tradeId));
              } else {
                Alert.alert('Error', 'Failed to delete listing');
              }
            } catch (error) {
              console.error('Failed to delete listing:', error);
              Alert.alert('Error', 'Failed to delete listing');
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Listings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <View style={styles.listingsGrid}>
              {userListings.map((listing) => (
                <View key={listing.id} style={styles.listingContainer}>
                  <TradeCard
                    trade={listing}
                    onPress={() => {}}
                    width={(screenWidth - 60) / 2}
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteListing(listing.id)}
                    disabled={deleting === listing.id}
                  >
                    {deleting === listing.id ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Ionicons name="close" size={16} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
              {userListings.length === 0 && (
                <Text style={styles.emptyText}>No listings to edit</Text>
              )}
            </View>
          )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listingContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 40,
    width: '100%',
  },
});