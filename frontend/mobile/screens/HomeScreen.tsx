import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { CATEGORIES } from '../constants/data';
import TradeCard from '../components/TradeCard';

interface HomeScreenProps {
  onSeeAllNew: () => void;
  onSeeAllRecommended: () => void;
  onSeeAllAll: () => void;
  onSearchPress: () => void;
  onTradePress: (tradeId: string) => void;
}

interface Trade {
  id: string;
  title: string;
  description: string;
  price: number | null;
  trade_options: string;
  category: string | null;
  image_urls: string[] | null;
  created_at: string;
}

export default function HomeScreen({ onSeeAllNew, onSeeAllRecommended, onSeeAllAll, onSearchPress, onTradePress }: HomeScreenProps) {
  const [newTrades, setNewTrades] = useState<Trade[]>([]);
  const [recommendedTrades, setRecommendedTrades] = useState<Trade[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  // Get API URL from config (use IP address for physical devices, localhost for simulator)
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      
      // Fetch all trades first
      const allTradesResponse = await fetch(`${apiUrl}/api/trades?limit=50&offset=0&accepted=false`);
      
      if (!allTradesResponse.ok) {
        throw new Error(`HTTP error! status: ${allTradesResponse.status}`);
      }
      
      const allTradesData = await allTradesResponse.json();
      const allTrades = allTradesData.trades || [];
      
      // Filter new trades (created in last week)
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newTrades = allTrades.filter((trade: Trade) => {
        if (!trade.created_at) return false;
        const createdAt = new Date(trade.created_at);
        return createdAt >= oneWeekAgo;
      }).slice(0, 4);
      
      // Use same trades for recommended (first 4)
      const recommendedTrades = allTrades.slice(0, 4);

      setNewTrades(newTrades);
      setRecommendedTrades(recommendedTrades);
      setAllTrades(allTrades);
    } catch (error) {
      setNewTrades([]);
      setRecommendedTrades([]);
      setAllTrades([]);
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

  const getDotColor = (tradeOptions: string) => {
    switch (tradeOptions) {
      case 'Sell': return '#ef4444';
      case 'Looking for': return '#22c55e';
      case 'Trade': return '#eab308';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* New Listings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New</Text>
          <TouchableOpacity onPress={onSeeAllNew}>
            <Text style={styles.seeAllText}>see all</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
          </View>
        ) : (
          <ScrollView 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.listingsScroll}
            contentContainerStyle={styles.listingsContainer}
          >
            {newTrades.length > 0 ? (
              newTrades.map((trade) => (
                <TouchableOpacity 
                  key={trade.id} 
                  style={styles.listingCard}
                  onPress={() => onTradePress(trade.id)}
                  activeOpacity={0.7}
                >
                  {trade.image_urls && trade.image_urls.length > 0 ? (
                    <Image 
                      source={{ uri: trade.image_urls[0] }} 
                      style={styles.imagePlaceholder}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder} />
                  )}
                  <Text style={styles.listingTitle} numberOfLines={2}>{trade.title || 'Untitled'}</Text>
                  <View style={styles.priceContainer}>
                    <View style={[styles.statusDot, { backgroundColor: getDotColor(trade.trade_options) }]} />
                    <Text style={styles.price}>{formatPrice(trade)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No new listings</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Recommended Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <TouchableOpacity onPress={onSeeAllRecommended}>
            <Text style={styles.seeAllText}>see all</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
          </View>
        ) : (
          <ScrollView 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.listingsScroll}
            contentContainerStyle={styles.listingsContainer}
          >
            {recommendedTrades.length > 0 ? (
              recommendedTrades.map((trade) => (
                <TouchableOpacity 
                  key={trade.id} 
                  style={styles.listingCard}
                  onPress={() => onTradePress(trade.id)}
                  activeOpacity={0.7}
                >
                  {trade.image_urls && trade.image_urls.length > 0 ? (
                    <Image 
                      source={{ uri: trade.image_urls[0] }} 
                      style={styles.imagePlaceholder}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder} />
                  )}
                  <Text style={styles.listingTitle} numberOfLines={2}>{trade.title || 'Untitled'}</Text>
                  <View style={styles.priceContainer}>
                    <View style={[styles.statusDot, { backgroundColor: getDotColor(trade.trade_options) }]} />
                    <Text style={styles.price}>{formatPrice(trade)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No recommended listings</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* All Listings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Listings</Text>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
          </View>
        ) : (
          <View style={styles.allListingsGrid}>
            {allTrades.length > 0 ? (
              allTrades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  onPress={onTradePress}
                  width={cardWidth}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No listings available</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 40,
  },
  logo: {
    width: 160,
    height: 60,
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
    marginRight: 6,
  },
  price: {
    fontSize: 12,
    color: '#6b7280',
  },
  allListingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    gap: 16,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
});

