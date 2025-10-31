import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

// API base URL - change this to your Render URL when deployed
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';

interface Trade {
  id: string;
  title?: string;
  description?: string;
  skill_offered?: string;
  price?: number;
  category?: string;
  accepted: boolean;
}

// Fetch trades from Express API
async function fetchTrades(filters?: { limit?: number; category?: string; offset?: number }): Promise<Trade[]> {
  try {
    const params = new URLSearchParams();
    params.append('limit', String(filters?.limit || 20));
    params.append('accepted', 'false');
    if (filters?.category) params.append('category', filters.category);
    if (filters?.offset) params.append('offset', String(filters.offset));
    
    const response = await fetch(`${API_BASE_URL}/api/trades?${params.toString()}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.trades || [];
  } catch (error) {
    console.error('Failed to fetch trades:', error);
    return [];
  }
}

export default function App() {
  const [newTrades, setNewTrades] = useState<Trade[]>([]);
  const [recommendedTrades, setRecommendedTrades] = useState<Trade[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [newData, recommendedData, allData] = await Promise.all([
        fetchTrades({ limit: 6, offset: 0 }), // New trades
        fetchTrades({ limit: 6 }), // Recommended (featured)
        fetchTrades({ limit: 20 }) // All trades for categories
      ]);

      setNewTrades(newData);
      setRecommendedTrades(recommendedData);
      setAllTrades(allData);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(allData.map(t => t.category).filter(c => c))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format price display
  const formatPrice = (trade: Trade): string => {
    if (trade.price !== null && trade.price !== undefined) {
      return `$${trade.price.toFixed(2)}`;
    }
    if (trade.skill_offered) {
      return 'Trade';
    }
    return 'Looking for';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ height: 67 }} />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.sortText}>sort</Text>
          </View>
          <ScrollView 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.length > 0 ? (
              categories.map((category) => (
                <TouchableOpacity key={category} style={styles.categoryButton}>
                  <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No categories available</Text>
            )}
          </ScrollView>
        </View>

        {/* New Listings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>see all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.listingsScroll}
            contentContainerStyle={styles.listingsContainer}
          >
            {newTrades.length > 0 ? (
              newTrades.map((trade) => (
                <TouchableOpacity key={trade.id} style={styles.listingCard}>
                  <View style={styles.imagePlaceholder} />
                  <Text style={styles.listingTitle} numberOfLines={1}>
                    {trade.title || 'Untitled Listing'}
                  </Text>
                  <View style={styles.priceContainer}>
                    <View style={styles.statusDot} />
                    <Text style={styles.price}>{formatPrice(trade)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No new listings</Text>
            )}
          </ScrollView>
        </View>

        {/* Recommended Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>see all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.listingsScroll}
            contentContainerStyle={styles.listingsContainer}
          >
            {recommendedTrades.length > 0 ? (
              recommendedTrades.map((trade) => (
                <TouchableOpacity key={trade.id} style={styles.listingCard}>
                  <View style={styles.imagePlaceholder} />
                  <Text style={styles.listingTitle} numberOfLines={1}>
                    {trade.title || 'Untitled Listing'}
                  </Text>
                  <View style={styles.priceContainer}>
                    <View style={styles.statusDot} />
                    <Text style={styles.price}>{formatPrice(trade)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No recommended listings</Text>
            )}
          </ScrollView>
        </View>

        {/* All Listings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Listings</Text>
          </View>
          <View style={styles.allListingsContainer}>
            {allTrades.length > 0 ? (
              allTrades.slice(0, 5).map((trade) => (
                <TouchableOpacity key={trade.id} style={[styles.allListingCard, { marginTop: allTrades.indexOf(trade) > 0 ? 12 : 0 }]}>
                  <Text style={styles.listingTitle}>{trade.title || 'Untitled Listing'}</Text>
                  {trade.category && (
                    <Text style={styles.categoryText}>{trade.category}</Text>
                  )}
                  <Text style={styles.price}>{formatPrice(trade)}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.allListingCard}>
                <Text style={styles.emptyText}>No listings available</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeIndicator} />
          <Ionicons name="home" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="search" size={28} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="add-circle" size={28} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="mail" size={28} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={28} color="#6b7280" />
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sortText: {
    fontSize: 14,
    color: '#6b7280',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  categoriesScroll: {
    marginLeft: 16,
  },
  categoriesContainer: {
    paddingRight: 16,
  },
  categoryButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  listingsScroll: {
    marginLeft: 16,
  },
  listingsContainer: {
    paddingRight: 16,
  },
  listingCard: {
    width: 160,
    marginRight: 12,
  },
  imagePlaceholder: {
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    marginRight: 6,
  },
  price: {
    fontSize: 12,
    color: '#6b7280',
  },
  allListingsContainer: {
    paddingHorizontal: 16,
  },
  allListingCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
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
