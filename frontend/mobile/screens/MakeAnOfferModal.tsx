import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabaseClient';

interface MakeOfferModalProps {
  visible: boolean;
  onClose: () => void;
  trade: {
    id: string;
    title: string;
    description: string;
    price: number | null;
    category: string | null;
    image_urls: string[] | null;
    trade_options: string;
    offerer_user_id: string;
  };
  sellerProfile: {
    user_name: string | null;
    rating: number | null;
    profile_picture_url: string | null;
  };
  currentConversationId: string;
  navigation?: any;
}

export default function MakeOfferModal({
  visible,
  onClose,
  trade,
  sellerProfile,
  currentConversationId,
  navigation,
}: MakeOfferModalProps) {
  const [offerType, setOfferType] = useState<'Buy' | 'Trade'>('Buy');
  const [offerAmount, setOfferAmount] = useState('0');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Request camera roll permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow access to your photos to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Pick images from camera roll
  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 4 - selectedImages.length, // Allow up to 4 total images
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 4));
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendOffer = async () => {
    try {
      setSending(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user logged in');
        return;
      }

      // Upload images to Supabase storage if in Trade mode
      let uploadedImageUrls: string[] = [];
      if (offerType === 'Trade' && selectedImages.length > 0) {
        for (const imageUri of selectedImages) {
          try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const fileName = `trade-offer-${user.id}-${Date.now()}-${Math.random()}.jpg`;
            
            const { data, error } = await supabase.storage
              .from('trade-images')
              .upload(fileName, blob, {
                contentType: 'image/jpeg',
              });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('trade-images')
              .getPublicUrl(fileName);
            
            uploadedImageUrls.push(publicUrl);
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        }
      }

      // Prepare the message with metadata
      const messageData = {
        conversation_id: currentConversationId,
        sender_id: user.id,
        text: note || (offerType === 'Buy' 
          ? `I'd like to offer $${offerAmount} for ${trade.title}`
          : `I'd like to trade ${itemName} for ${trade.title}`
        ),
        metadata: {
          type: offerType,
          amount: offerType === 'Buy' ? parseFloat(offerAmount) : null,
          itemName: offerType === 'Trade' ? itemName : null,
          itemDescription: offerType === 'Trade' ? description : null,
          itemImages: offerType === 'Trade' ? uploadedImageUrls : null,
          tradeTitle: trade.title,
          tradeImageUrl: trade.image_urls?.[0] || null,
        },
      };

      // Insert message into Supabase
      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      // Reset form
      setOfferAmount('0');
      setItemName('');
      setDescription('');
      setNote('');
      setSelectedImages([]);
      
      // Close modal
      onClose();

      // Optional: Navigate to chat screen
      if (navigation) {
        navigation.navigate('ChatScreen', {
          chatId: currentConversationId,
          contactName: sellerProfile.user_name || 'Seller',
          receiverId: trade.offerer_user_id,
        });
      }
    } catch (error) {
      console.error('Error sending offer:', error);
      Alert.alert('Error', 'Failed to send offer. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderStars = (rating: number | null) => {
    const stars = [];
    const ratingValue = rating || 0;
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(ratingValue) ? 'star' : 'star-outline'}
          size={12}
          color="#3b82f6"
        />
      );
    }
    return stars;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Make an offer</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Seller Info */}
          <View style={styles.sellerSection}>
            <View style={styles.sellerAvatar}>
              {sellerProfile?.profile_picture_url ? (
                <Image
                  source={{ uri: sellerProfile.profile_picture_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>
            <Text style={styles.sellerName}>
              {sellerProfile?.user_name || 'First Last'}
            </Text>
            <View style={styles.ratingContainer}>
              {renderStars(sellerProfile?.rating)}
            </View>
          </View>

          {/* Listing Card */}
          <View style={styles.listingCard}>
            <Image
              source={{ uri: trade.image_urls?.[0] || '' }}
              style={styles.listingImage}
            />
            <View style={styles.listingInfo}>
              <Text style={styles.categoryText}>{trade.category || 'Category'}</Text>
              <Text style={styles.listingTitle}>{trade.title}</Text>
              <Text style={styles.listingDescription} numberOfLines={1}>
                {trade.description || 'Short description'}
              </Text>
              <Text style={styles.listingPrice}>
                Listing price/trade item
              </Text>
            </View>
          </View>

          {/* Buy/Trade Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, offerType === 'Buy' && styles.toggleButtonActive]}
              onPress={() => setOfferType('Buy')}
            >
              <Text
                style={[styles.toggleText, offerType === 'Buy' && styles.toggleTextActive]}
              >
                Buy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, offerType === 'Trade' && styles.toggleButtonActive]}
              onPress={() => setOfferType('Trade')}
            >
              <Text
                style={[styles.toggleText, offerType === 'Trade' && styles.toggleTextActive]}
              >
                Trade
              </Text>
            </TouchableOpacity>
          </View>

          {/* Offer Input Section */}
          {offerType === 'Buy' ? (
            <View style={styles.offerInputContainer}>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  value={offerAmount}
                  onChangeText={setOfferAmount}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <TouchableOpacity style={styles.editIcon}>
                  <Ionicons name="pencil" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.tradeInputContainer}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Item name"
                  placeholderTextColor="#9ca3af"
                  value={itemName}
                  onChangeText={setItemName}
                />
                <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
                  <Text style={styles.uploadText}>Upload images</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.imageGrid}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.selectedImage} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                {selectedImages.length < 4 && (
                  <TouchableOpacity
                    style={styles.imagePlaceholder}
                    onPress={pickImages}
                  >
                    <Ionicons name="add" size={32} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Description"
                placeholderTextColor="#9ca3af"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
          )}

          {/* Note Section */}
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>Leave a note to the seller!</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquet nibh ipsum, nec varius mauris finibus ut. Pellentesque molestie ultrices ante."
              placeholderTextColor="#9ca3af"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        </ScrollView>

        {/* Send Offer Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.sendButton, sending && styles.sendButtonDisabled]} 
            onPress={handleSendOffer}
            disabled={sending}
          >
            <Text style={styles.sendButtonText}>
              {sending ? 'Sending...' : 'Send offer'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  sellerSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  sellerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#d1d5db',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 12,
    borderRadius: 12,
  },
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  listingDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#dbeafe',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#2563eb',
  },
  offerInputContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dollarSign: {
    fontSize: 48,
    fontWeight: '300',
    color: '#000',
  },
  priceInput: {
    fontSize: 72,
    fontWeight: '300',
    color: '#000',
    minWidth: 100,
    textAlign: 'center',
  },
  editIcon: {
    marginLeft: 8,
  },
  tradeInputContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  uploadButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  imageContainer: {
    width: '23%',
    aspectRatio: 1,
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  noteSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});