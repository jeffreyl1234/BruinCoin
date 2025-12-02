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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';
import Constants from 'expo-constants';

type ImageItem = 
  | { type: 'image'; uri: string }
  | { type: 'icon'; emoji: string; backgroundColor: string };

export interface ListingData {
  title: string;
  description: string;
  price: string;
  category: string;
  selectedOption: string | null;
  images?: ImageItem[];
  tags?: string[];
}

interface PreviewListingScreenProps {
  visible: boolean;
  listingData: ListingData;
  onClose: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
}

interface UserProfile {
  user_name: string | null;
  profile_picture_url: string | null;
  rating: number | null;
  category_preferences?: string[] | null;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Concert tickets': '🎫',
  'Clothing': '👕',
  'Nails': '💅',
  'Ride Share': '🚗',
  'Meal Swipes': '🍲',
  'Photography': '📷',
  'Items': '📦',
  'Textbooks': '📚',
};

export default function PreviewListingScreen({
  visible,
  listingData,
  onClose,
  onPublish,
  isPublishing = false,
}: PreviewListingScreenProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!visible) return;
      
      setLoadingProfile(true);
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.error('Failed to get current user:', authError);
          setLoadingProfile(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/users/${authUser.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserProfile({
              user_name: data.user.user_name,
              profile_picture_url: data.user.profile_picture_url,
              rating: data.user.rating,
              category_preferences: data.user.category_preferences || [],
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [visible, apiUrl]);

  const formatDescription = (description: string) => {
    if (!description) return [];
    // Split by lines or create bullet points from text
    const lines = description.split('\n').filter(line => line.trim());
    return lines.length > 0 ? lines : [description];
  };

  const descriptionLines = formatDescription(listingData.description);

  return (
    <Modal visible={visible} animationType="none" presentationStyle="overFullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Unified Card Container */}
          <View style={styles.unifiedCard}>
            {/* Navigation Bar */}
            <View style={styles.navBar}>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.backButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={24} color="#6b7280" />
              </TouchableOpacity>
              <Text style={styles.navTitle}>Preview Listing</Text>
              <View style={styles.navSpacer} />
            </View>

            {/* Main Content */}
            <View style={styles.contentCard}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.titleLeft}>
                <Text style={styles.titleText}>{listingData.title || 'Title'}</Text>
                {/* Rating with stars */}
                <View style={styles.ratingRow}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons key={i} name="star" size={16} color="#FFD700" style={styles.star} />
                  ))}
                  <Text style={styles.ratingText}>5.0 (24 Reviews)</Text>
                </View>
                {/* Category Tag */}
                {listingData.category && (
                  <View style={styles.categoryTag}>
                    <Ionicons name="camera" size={14} color="#6b7280" />
                    <Text style={styles.categoryTagText}>{listingData.category.toLowerCase()}</Text>
                  </View>
                )}
              </View>
              {/* Price on right */}
              <View style={styles.priceContainer}>
                <View style={styles.priceDot} />
                <Text style={styles.priceText}>${listingData.price || '0'}</Text>
              </View>
            </View>

            {/* Images */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.imagesContainer}
              contentContainerStyle={styles.imagesContent}
            >
              {listingData.images && listingData.images.length > 0 ? (
                listingData.images.map((item, index) => (
                  item.type === 'icon' ? (
                    <View key={index} style={[styles.image, { backgroundColor: item.backgroundColor, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={styles.previewIconEmoji}>{item.emoji}</Text>
                    </View>
                  ) : (
                    <Image
                      key={index}
                      source={{ uri: item.uri }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  )
                ))
              ) : (
                <>
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#9ca3af" />
                  </View>
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#9ca3af" />
                  </View>
                </>
              )}
            </ScrollView>

            {/* Description Section */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              {descriptionLines.length > 0 ? (
                <View style={styles.bulletList}>
                  {descriptionLines.map((line, index) => (
                    <View key={index} style={styles.bulletItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{line}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDescription}>No description provided</Text>
              )}
            </View>

            {/* Seller Section */}
            <View style={styles.sellerSection}>
              <Text style={styles.sectionTitle}>Seller</Text>
              <View style={styles.sellerInfoRow}>
                <View style={styles.sellerInfo}>
                  <View style={styles.sellerAvatar}>
                    {userProfile?.profile_picture_url ? (
                      <Image 
                        source={{ uri: userProfile.profile_picture_url }} 
                        style={styles.sellerAvatarImage}
                      />
                    ) : (
                      <Ionicons name="person" size={24} color="#9ca3af" />
                    )}
                  </View>
                  <View style={styles.sellerDetails}>
                    <Text style={styles.sellerName}>
                      {loadingProfile ? 'Loading...' : (userProfile?.user_name || 'Anonymous Seller')}
                    </Text>
                    <View style={styles.sellerRatingContainer}>
                      {userProfile?.rating !== null && userProfile?.rating !== undefined ? (
                        <>
                          <Text style={styles.sellerRatingText}>
                            {userProfile.rating.toFixed(1)}
                          </Text>
                          <Ionicons name="star" size={14} color="#FFD700" />
                        </>
                      ) : (
                        <>
                          <Text style={styles.sellerRatingText}>0.0</Text>
                          <Ionicons name="star" size={14} color="#FFD700" />
                        </>
                      )}
                    </View>
                  </View>
                </View>
                {/* Interested to trade section */}
                {userProfile?.category_preferences && userProfile.category_preferences.length > 0 && (
                  <View style={styles.interestsContainer}>
                    <Text style={styles.interestsLabel}>Interested to trade:</Text>
                    <View style={styles.interestsTags}>
                      {userProfile.category_preferences.slice(0, 3).map((category, index) => (
                        <View key={index} style={styles.interestTag}>
                          <Text style={styles.interestEmoji}>{CATEGORY_EMOJIS[category] || '📦'}</Text>
                          <Text style={styles.interestText}>{category}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity 
              style={[styles.continueButton, isPublishing && styles.continueButtonDisabled]} 
              onPress={onPublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  unifiedCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  navTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  navSpacer: {
    width: 36,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    paddingTop: 0,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleLeft: {
    flex: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryTagText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  imagesContainer: {
    marginBottom: 20,
  },
  imagesContent: {
    paddingRight: 16,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  previewIconEmoji: {
    fontSize: 80,
  },
  imagePlaceholder: {
    width: 300,
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  noDescription: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  sellerSection: {
    marginBottom: 20,
  },
  sellerInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sellerAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  sellerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 4,
  },
  interestsContainer: {
    marginLeft: 16,
    flex: 1,
  },
  interestsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  interestsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  interestEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  interestText: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

