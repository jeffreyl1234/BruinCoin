import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabaseClient';

interface Trade {
  id: string;
  title: string;
  description: string;
  price: number | null;
  trade_options: string;
  category: string | null;
  image_urls: string[] | null;
  tags: string[] | null;
  offerer_user_id: string;
}

interface ListingDetailScreenProps {
  visible: boolean;
  tradeId: string | null;
  onClose: () => void;
  navigation: any;
}

export default function ListingDetailScreen({
  visible,
  tradeId,
  onClose,
  navigation
}: ListingDetailScreenProps) {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  useEffect(() => {
    if (visible && tradeId) {
      fetchTrade();
    } else {
      setTrade(null);
      setLoading(true);
    }
  }, [visible, tradeId]);

  const fetchTrade = async () => {
    if (!tradeId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/trades/${tradeId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.trade) {
        setTrade(data.trade);
      }
    } catch (error) {
      console.error('Failed to fetch trade:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = () => {
    if (!trade) return '';
    if (trade.trade_options === 'Sell' && trade.price !== null) {
      return `$${trade.price.toFixed(2)}`;
    } else if (trade.trade_options === 'Trade') {
      return 'Trade';
    } else if (trade.trade_options === 'Looking for') {
      return 'Looking for';
    }
    return '';
  };

    const handleContactSeller = async () => {
    try {
      // 🧠 Step 1: get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user logged in');
        return;
      }

      const currentUserId = user.id;
      const sellerId = trade?.offerer_user_id;
      if (!sellerId || sellerId === currentUserId) return;

      // 🧠 Step 2: check if conversation already exists
      const { data: existingConversation, error: existingError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${sellerId}),and(user1_id.eq.${sellerId},user2_id.eq.${currentUserId})`)
        .limit(1)
        .maybeSingle();

      if (existingError) throw existingError;

      let conversationId = existingConversation?.id;

      // 🧠 Step 3: if none exists, create one
      if (!conversationId) {
        const { data: newConvo, error: insertError } = await supabase
          .from('conversations')
          .insert([
            { user1_id: currentUserId, user2_id: sellerId }
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        conversationId = newConvo.id;
      }

      // 🧠 Step 4: close modal + navigate to chat
      onClose();
      navigation.navigate('ChatScreen', {
        chatId: conversationId,
        contactName: trade?.title || 'Seller',
        receiverId: sellerId,
      });
    } catch (err: any) {
      console.error('Error creating or fetching conversation:', err.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>Listing Details</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Navigation Bar */}
          <View style={styles.navBar}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
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
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : trade ? (
            <View style={styles.contentCard}>
              {/* Title Section */}
              <View style={styles.titleSection}>
                <Text style={styles.titleText}>{trade.title || 'Untitled'}</Text>
                <View style={styles.statusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{formatPrice()}</Text>
                </View>
              </View>

              {/* Category */}
              {trade.category && (
                <View style={styles.categoryContainer}>
                  <Text style={styles.categoryText}>{trade.category}</Text>
                </View>
              )}

              {/* Images */}
              <View style={styles.imagesContainer}>
                {trade.image_urls && trade.image_urls.length > 0 ? (
                  trade.image_urls.slice(0, 2).map((url, index) => (
                    <Image
                      key={index}
                      source={{ uri: url }}
                      style={[styles.image, index > 0 && { marginLeft: 12 }]}
                      resizeMode="cover"
                    />
                  ))
                ) : (
                  <>
                    <View style={styles.imagePlaceholder} />
                    <View style={[styles.imagePlaceholder, { marginLeft: 12 }]} />
                  </>
                )}
              </View>

              {/* Description Section */}
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  {trade.description || 'No description provided'}
                </Text>
              </View>

              {/* Tags */}
              {trade.tags && trade.tags.length > 0 && (
                <View style={styles.tagsSection}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {trade.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Trade Options */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Type</Text>
                <Text style={styles.infoText}>{trade.trade_options}</Text>
              </View>

              {/* Price (if selling) */}
              {trade.trade_options === 'Sell' && trade.price !== null && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Price</Text>
                  <Text style={styles.priceText}>${trade.price.toFixed(2)}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Make an offer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.contactButton]}
                  onPress={handleContactSeller}
                >
                  <Text style={[styles.actionButtonText, styles.contactButtonText]}>
                    Contact Seller
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load listing</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    color: '#9ca3af',
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
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    marginRight: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  image: {
    flex: 1,
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    flex: 1,
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#1f2937',
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButton: {
    marginLeft: 12,
    backgroundColor: '#2563eb',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  contactButtonText: {
    color: '#ffffff',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
});

