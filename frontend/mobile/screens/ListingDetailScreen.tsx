import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';
import Constants from 'expo-constants';
import RateUserScreen from './RateUserScreen';
import MakeAnOfferModal from './MakeAnOfferModal';

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

interface SellerProfile {
  id: string;
  user_name: string | null;
  email: string;
  bio: string | null;
  rating: number | null;
  profile_picture_url: string | null;
  trade_preferences: string[] | null;
  category_preferences: string[] | null;
  interests: string[] | null;
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
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<{ id: string; name: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  useEffect(() => {
    if (visible && tradeId) {
      fetchTrade();
      fetchCurrentUser();
    } else {
      setTrade(null);
      setLoading(true);
      setShowRatingModal(false);
      setSellerInfo(null);
    }
  }, [visible, tradeId]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }
  };

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
        
        // Fetch seller info for rating and display
        if (data.trade.offerer_user_id) {
          fetchSellerProfile(data.trade.offerer_user_id);
          try {
            const sellerResponse = await fetch(`${apiUrl}/api/users/${data.trade.offerer_user_id}`);
            if (sellerResponse.ok) {
              const sellerData = await sellerResponse.json();
              if (sellerData.user) {
                const sellerName = sellerData.user.user_name || sellerData.user.email?.split('@')[0] || 'Seller';
                setSellerInfo({
                  id: data.trade.offerer_user_id,
                  name: sellerName,
                });
              }
            }
          } catch (error) {
            console.error('Failed to fetch seller info:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch trade:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProfile = async (userId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setSellerProfile(data.user);
        }
      }
    } catch (error) {
      console.error('Failed to fetch seller profile:', error);
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

  const handleMakeOffer = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const sellerId = trade?.offerer_user_id;
    if (!sellerId || sellerId === user.id) return;

    // Check if conversation exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${sellerId}),and(user1_id.eq.${sellerId},user2_id.eq.${user.id})`)
      .limit(1)
      .maybeSingle();

    let conversationId = existingConversation?.id;

    // If no conversation exists, create one
    if (!conversationId) {
      const { data: newConvo } = await supabase
        .from('conversations')
        .insert([{ user1_id: user.id, user2_id: sellerId }])
        .select()
        .single();

      conversationId = newConvo?.id;
    }

    setCurrentConversationId(conversationId);
    setShowOfferModal(true);
  } catch (error) {
    console.error('Error:', error);
  }
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
    <Modal visible={visible} animationType="none" presentationStyle="overFullScreen">
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : trade ? (
            <View>
              {/* Images Section */}
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

              {/* Content Card */}
              <View style={styles.contentCard}>
                {/* Title and Price */}
                <View style={styles.titleSection}>
                  <Text style={styles.titleText}>{trade.title || 'Untitled'}</Text>
                  <View style={styles.priceContainer}>
                    <View style={styles.priceDot} />
                    <Text style={styles.priceText}>{formatPrice()}</Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <View style={styles.bulletPoints}>
                    {trade.description ? (
                      trade.description.split('\n').map((line, index) => (
                        <View key={index} style={styles.bulletPoint}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.bulletText}>{line.trim()}</Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>No description provided</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Seller Section */}
                <View style={styles.sellerSection}>
                  <Text style={styles.sectionTitle}>Seller</Text>
                  <View style={styles.sellerInfo}>
                    <View style={styles.sellerAvatar}>
                      {sellerProfile?.profile_picture_url ? (
                        <Image 
                          source={{ uri: sellerProfile.profile_picture_url }} 
                          style={styles.sellerAvatarImage}
                        />
                      ) : (
                        <Ionicons name="person" size={24} color="#9ca3af" />
                      )}
                    </View>
                    <View style={styles.sellerDetails}>
                      <Text style={styles.sellerName}>
                        {sellerProfile?.user_name || 'Anonymous Seller'}
                      </Text>
                      <View style={styles.sellerRating}>
                        <Text style={styles.sellerRatingText}>
                          {sellerProfile?.rating?.toFixed(1) || '0.0'}
                        </Text>
                        <Ionicons name="star" size={14} color="#FFD700" />
                      </View>
                    </View>
                    <View style={styles.interestedSection}>
                      <Text style={styles.interestedTitle}>Interested to trade:</Text>
                      <View style={styles.interestTags}>
                        {sellerProfile?.interests && sellerProfile.interests.length > 0 ? (
                          sellerProfile.interests.slice(0, 3).map((interest, index) => (
                            <View key={index} style={styles.interestTag}>
                              <Text style={styles.interestText}>{interest}</Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.interestText}>No interests listed</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                {/* Rate Seller Button - Only show if viewing someone else's listing */}
                {sellerInfo && currentUserId && sellerInfo.id !== currentUserId && (
                  <TouchableOpacity
                    style={styles.rateButton}
                    onPress={() => setShowRatingModal(true)}
                  >
                    <Ionicons name="star-outline" size={20} color="#fbbf24" />
                    <Text style={[styles.rateButtonText, { marginLeft: 8 }]}>Rate Seller</Text>
                  </TouchableOpacity>
                )}

                {/* Action Buttons */}
                <View style={styles.bottomActions}>
                  <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller}>
                    <Text style={styles.contactButtonText}>Contact Seller</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.offerButton}
                    onPress={handleMakeOffer}
                  >
                    <Text style={styles.offerButtonText}>Make an Offer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load listing</Text>
            </View>
          )}
          </ScrollView>

          {/* Rating Modal */}
          {sellerInfo && (
            <RateUserScreen
              visible={showRatingModal}
              ratedUserId={sellerInfo.id}
              ratedUserName={sellerInfo.name}
              onClose={() => setShowRatingModal(false)}
              onRated={() => {
                // Refresh seller profile to show updated rating
                if (trade?.offerer_user_id) {
                  fetchSellerProfile(trade.offerer_user_id);
                }
              }}
            />
          )}
          {trade && sellerProfile && currentConversationId && (
            <MakeAnOfferModal
              visible={showOfferModal}
              onClose={() => {
                setShowOfferModal(false);
                setCurrentConversationId(null);
              }}
              trade={trade}
              sellerProfile={sellerProfile}
              currentConversationId={currentConversationId}
              navigation={navigation}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  image: {
    flex: 1,
    height: 280,
    borderRadius: 16,
  },
  imagePlaceholder: {
    flex: 1,
    height: 280,
    backgroundColor: '#e5e5e5',
    borderRadius: 16,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  titleSection: {
    marginBottom: 24,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    paddingRight: 80,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  priceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
    marginRight: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  descriptionSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  bulletPoints: {
    paddingLeft: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#999999',
    marginRight: 12,
    width: 16,
  },
  bulletText: {
    fontSize: 16,
    color: '#999999',
    flex: 1,
    lineHeight: 22,
  },
  sellerSection: {
    marginBottom: 32,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  sellerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  sellerDetails: {
    marginRight: 20,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerRatingText: {
    fontSize: 16,
    color: '#666666',
    marginRight: 4,
  },
  interestedSection: {
    flex: 1,
  },
  interestedTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  interestEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  interestText: {
    fontSize: 12,
    color: '#666666',
  },

  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  offerButton: {
    flex: 1,
    backgroundColor: '#2c3e50',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  offerButtonText: {
    fontSize: 16,
    fontWeight: '600',
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

