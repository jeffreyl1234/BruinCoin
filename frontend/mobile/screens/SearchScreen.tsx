import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Slider from '@react-native-community/slider';

interface SearchScreenProps {
  onTradePress?: (tradeId: string) => void;
}

interface Trade {
  id: string;
  title: string;
  description: string;
  price: number | null;
  trade_options: string;
  category: string | null;
  image_urls: string[] | null;
  tags: string[] | null;
}

export default function SearchScreen({ onTradePress }: SearchScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filterSection, setFilterSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTradeType, setSelectedTradeType] = useState<string>('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCount, setFilterCount] = useState(0);
  
  const categories = ['Events', 'Goods', 'Beauty', 'Rideshare'];
  const tradeTypes = ['Buying', 'Selling', 'Trading'];
  const sortOptions = [
    { key: 'relevance', label: 'Relevance' },
    { key: 'newest', label: 'Newly Listed' },
    { key: 'price_high', label: 'Price: High to low' },
    { key: 'price_low', label: 'Price: Low to high' }
  ];


  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  // Update filter count
  useEffect(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedTradeType) count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
    if (sortBy !== 'relevance') count++;
    setFilterCount(count);
  }, [selectedCategory, selectedTradeType, priceRange, sortBy]);

  // Map trade types to API values
  const getApiTradeType = (type: string) => {
    switch (type) {
      case 'Buying': return 'Looking for';
      case 'Selling': return 'Sell';
      case 'Trading': return 'Trade';
      default: return '';
    }
  };

  const fetchSearchResults = useCallback(async (query: string) => {
    const apiTradeType = getApiTradeType(selectedTradeType);

    setLoading(true);
    try {
      let url = `${apiUrl}/api/trades?limit=50&accepted=false`;
      if (apiTradeType) {
        url += `&trade_options=${encodeURIComponent(apiTradeType)}`;
      }
      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (priceRange[0] > 0) {
        url += `&price_min=${priceRange[0]}`;
      }
      if (priceRange[1] < 1000) {
        url += `&price_max=${priceRange[1]}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        let results = data.trades || [];
        
        // Client-side search filtering by title, description, and tags
        if (query.trim()) {
          const searchTerms = query.toLowerCase().split(' ');
          results = results.filter((trade: Trade) => {
            const title = (trade.title || '').toLowerCase();
            const description = (trade.description || '').toLowerCase();
            const tags = (trade.tags || []).join(' ').toLowerCase();
            const searchText = `${title} ${description} ${tags}`;
            
            return searchTerms.some(term => searchText.includes(term));
          });
        }
        
        // Apply sorting
        if (sortBy === 'newest') {
          results.sort((a: Trade, b: Trade) => new Date(b.id).getTime() - new Date(a.id).getTime());
        } else if (sortBy === 'price_high') {
          results.sort((a: Trade, b: Trade) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === 'price_low') {
          results.sort((a: Trade, b: Trade) => (a.price || 0) - (b.price || 0));
        }
        
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, selectedTradeType, selectedCategory, priceRange, sortBy]);

  // Load all listings on mount
  useEffect(() => {
    fetchSearchResults('');
  }, []);

  // Re-fetch when filter changes
  useEffect(() => {
    fetchSearchResults(searchText);
  }, [selectedTradeType, selectedCategory, priceRange, sortBy, fetchSearchResults]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchResults(searchText);
    }, 300);

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

  const renderFilterPanel = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filterPanel}>
        {filterSection === null && (
          <>
            <TouchableOpacity 
              style={styles.filterRow}
              onPress={() => setFilterSection('category')}
            >
              <Text style={styles.filterRowText}>Category</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterRow}
              onPress={() => setFilterSection('price')}
            >
              <Text style={styles.filterRowText}>Price Range</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterRow}
              onPress={() => setFilterSection('type')}
            >
              <Text style={styles.filterRowText}>Type of Listing</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterRow}
              onPress={() => setFilterSection('sort')}
            >
              <Text style={styles.filterRowText}>Sort by</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </>
        )}

        {filterSection === 'category' && (
          <>
            <View style={styles.filterHeader}>
              <TouchableOpacity onPress={() => setFilterSection(null)}>
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.filterHeaderText}>Category</Text>
            </View>
            <View style={styles.chipContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.chip, selectedCategory === category && styles.chipActive]}
                  onPress={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                >
                  <Text style={[styles.chipText, selectedCategory === category && styles.chipTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {filterSection === 'price' && (
          <>
            <View style={styles.filterHeader}>
              <TouchableOpacity onPress={() => setFilterSection(null)}>
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.filterHeaderText}>Price Range</Text>
            </View>
            <View style={styles.priceRangeContainer}>
              <View style={styles.priceLabels}>
                <View style={styles.priceValueContainer}>
                  <Text style={styles.priceLabel}>Min</Text>
                  <Text style={styles.priceValue}>${priceRange[0]}</Text>
                </View>
                <View style={styles.priceValueContainer}>
                  <Text style={styles.priceLabel}>Max</Text>
                  <Text style={styles.priceValue}>${priceRange[1]}</Text>
                </View>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1000}
                value={priceRange[1]}
                onValueChange={(value) => setPriceRange([priceRange[0], Math.round(value)])}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5E5"
                thumbStyle={styles.sliderThumb}
              />
            </View>
          </>
        )}

        {filterSection === 'type' && (
          <>
            <View style={styles.filterHeader}>
              <TouchableOpacity onPress={() => setFilterSection(null)}>
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.filterHeaderText}>Type of Listing</Text>
            </View>
            <View style={styles.chipContainer}>
              {tradeTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, selectedTradeType === type && styles.chipActive]}
                  onPress={() => setSelectedTradeType(selectedTradeType === type ? '' : type)}
                >
                  <Text style={[styles.chipText, selectedTradeType === type && styles.chipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {filterSection === 'sort' && (
          <>
            <View style={styles.filterHeader}>
              <TouchableOpacity onPress={() => setFilterSection(null)}>
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.filterHeaderText}>Sort by</Text>
            </View>
            <View style={styles.sortContainer}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.sortOption}
                  onPress={() => setSortBy(option.key)}
                >
                  <Text style={styles.sortOptionText}>{option.label}</Text>
                  <View style={[styles.radioButton, sortBy === option.key && styles.radioButtonActive]} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={[styles.searchFilterContainer, showFilters && styles.searchFilterContainerExpanded]}>
          <View style={styles.topRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                setShowFilters(!showFilters);
                setFilterSection(null);
              }}
            >
              <Ionicons name="options" size={16} color="#666" />
              <Text style={styles.filterButtonText}>Filter</Text>
              {filterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{filterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {showFilters && (
            <View style={styles.connectedFilterPanel}>
              {renderFilterPanel()}
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Continue browsing</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : searchResults.length > 0 ? (
          <View style={styles.resultsGrid}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.resultCard}
                onPress={() => onTradePress?.(item.id)}
              >
                {item.image_urls && item.image_urls.length > 0 ? (
                  <Image 
                    source={{ uri: item.image_urls[0] }} 
                    style={styles.resultImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.resultImage} />
                )}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.resultMeta}>
                    <View style={styles.statusIndicator} />
                    <Text style={styles.resultStatus}>{formatPrice(item)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingRight: 4,
  },
  searchFilterContainerExpanded: {
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#F0F2F9',
    borderRadius: 20,
    paddingRight: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
  },
  connectedFilterPanel: {
    paddingTop: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
    marginLeft: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterPanel: {
    backgroundColor: 'transparent',
    padding: 20,
    paddingTop: 0,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  filterRowText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  filterHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  chipActive: {
    backgroundColor: '#334155',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  priceRangeContainer: {
    paddingVertical: 20,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priceValueContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 20,
  },
  sortContainer: {
    gap: 16,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sortOptionText: {
    fontSize: 16,
    color: '#000',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  resultCard: {
    width: cardWidth,
    marginBottom: 12,
  },
  resultImage: {
    width: '100%',
    height: cardWidth,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 8,
  },

  resultInfo: {
    paddingHorizontal: 0,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    marginRight: 6,
  },
  resultStatus: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

