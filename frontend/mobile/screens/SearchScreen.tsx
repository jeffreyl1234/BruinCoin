import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

interface SearchScreenProps {
  onClose?: () => void;
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

export default function SearchScreen({ onClose }: SearchScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState(['Shoes', 'Jacket', 'Pants']);
  const [searchResults, setSearchResults] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  const removeRecentSearch = (search: string) => {
    setRecentSearches(recentSearches.filter(s => s !== search));
  };

  const fetchSearchResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/trades?search=${encodeURIComponent(query.trim())}&limit=50&accepted=false`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.trades || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim()) {
        fetchSearchResults(searchText);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchText, fetchSearchResults]);

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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Search Page</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Text"
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="menu" size={20} color="#1f2937" />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Search Results or Recent Searches */}
          {showResults ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Search Results {searchResults.length > 0 && `(${searchResults.length})`}
              </Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2563eb" />
                </View>
              ) : searchResults.length > 0 ? (
                <ScrollView 
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  style={styles.listingsScroll}
                  contentContainerStyle={styles.listingsContainer}
                >
                  {searchResults.map((listing) => (
                    <View key={listing.id} style={styles.listingCard}>
                      <View style={styles.imagePlaceholder} />
                      <Text style={styles.listingTitle} numberOfLines={2}>{listing.title}</Text>
                      <View style={styles.priceContainer}>
                        <View style={styles.statusDot} />
                        <Text style={styles.price}>{formatPrice(listing)}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>No listings found matching "{searchText}"</Text>
              )}
            </View>
          ) : (
            <>
              {/* Recent Searches Section */}
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>RECENT SEARCHES</Text>
                <View style={styles.recentSearchesContainer}>
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.recentSearchItem, index > 0 && { marginLeft: 8 }]}
                      onPress={() => setSearchText(search)}
                    >
                      <Text style={styles.recentSearchText}>{search}</Text>
                      <TouchableOpacity onPress={() => removeRecentSearch(search)}>
                        <Ionicons name="close" size={16} color="#9ca3af" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
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
  contentCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  recentSearchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  recentSearchText: {
    fontSize: 14,
    color: '#1f2937',
    marginRight: 6,
  },
  listingsScroll: {
    marginLeft: -16,
  },
  listingsContainer: {
    paddingLeft: 16,
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
});

