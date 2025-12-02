import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { CATEGORIES } from '../constants/data';
import PreviewListingScreen, { ListingData } from './PreviewListingScreen';

// Match the ImageItem type from PreviewListingScreen
type ImageItem = 
  | { type: 'image'; uri: string }
  | { type: 'icon'; emoji: string; backgroundColor: string };
import { supabase } from '../lib/supabaseClient';
import Constants from 'expo-constants';
import IconPickerModal from './IconPickerModal';

interface CreateListingScreenProps {
  onClose: () => void;
}

export default function CreateListingScreen({ onClose }: CreateListingScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState('Events');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  const handlePreview = () => {
    setShowPreview(true);
  };

  const showImageOptionsModal = () => {
    setShowImageOptions(true);
  };

  const pickImageFromAlbum = async () => {
    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload photos!');
      setShowImageOptions(false);
      return;
    }

    // Launch image picker (it will overlay on top of modal)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.6, // Reduced quality to decrease file size
      allowsEditing: false,
    });

    // Close modal after image picker closes
    setShowImageOptions(false);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages: ImageItem[] = result.assets.map(asset => ({ type: 'image' as const, uri: asset.uri }));
      setSelectedImages([...selectedImages, ...newImages].slice(0, 10)); // Limit to 10 images
    }
  };

  const takePhoto = async () => {
    // Request camera permissions first
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera permissions to take photos!');
      setShowImageOptions(false);
      return;
    }

    // Launch camera (it will overlay on top of modal)
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsEditing: false,
    });

    // Close modal after camera closes
    setShowImageOptions(false);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages: ImageItem[] = result.assets.map(asset => ({ type: 'image' as const, uri: asset.uri }));
      setSelectedImages([...selectedImages, ...newImages].slice(0, 10)); // Limit to 10 images
    }
  };

  const handleIconSelect = async (emoji: string, backgroundColor: string) => {
    try {
      // Store icon as an object with emoji and background color
      const iconItem: ImageItem = { type: 'icon', emoji, backgroundColor };
      setSelectedImages([...selectedImages, iconItem].slice(0, 10));
    } catch (error) {
      console.error('Error creating icon:', error);
      Alert.alert('Error', 'Failed to create icon');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const uploadImagesToSupabase = async (imageItems: ImageItem[], userId: string): Promise<string[]> => {
    try {
      // Read all images as base64
      const base64Images: string[] = [];
      
      for (const item of imageItems) {
        try {
          if (item.type === 'icon') {
            // Create SVG from icon data
            const svgString = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="${item.backgroundColor}" rx="12"/><text x="100" y="120" font-size="80" text-anchor="middle" dominant-baseline="central">${item.emoji}</text></svg>`;
            
            // Convert SVG to base64 using FileSystem
            try {
              const tempUri = `${FileSystem.cacheDirectory}icon_${Date.now()}.svg`;
              await FileSystem.writeAsStringAsync(tempUri, svgString, {
                encoding: FileSystem.EncodingType.UTF8,
              });
              
              const base64Svg = await FileSystem.readAsStringAsync(tempUri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              
              // Clean up temp file
              await FileSystem.deleteAsync(tempUri, { idempotent: true });
              
              const base64DataUri = `data:image/svg+xml;base64,${base64Svg}`;
              base64Images.push(base64DataUri);
              continue;
            } catch (svgError) {
              console.error('Error encoding SVG:', svgError);
              continue;
            }
          }

          // Handle regular image URIs
          const uri = item.uri;
          
          // Check if it's already a data URI
          if (uri.startsWith('data:image/')) {
            const base64Match = uri.match(/data:image\/[^;]+;base64,(.+)/);
            if (base64Match) {
              base64Images.push(uri);
              continue;
            }
            console.warn('Unsupported data URI format, skipping:', uri.substring(0, 50));
            continue;
          }

          // Read file as base64
          let base64String: string;
          try {
            base64String = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
          } catch (readError: any) {
            console.error('Error reading file:', readError);
            continue;
          }
          
          if (!base64String || typeof base64String !== 'string' || base64String.length === 0) {
            console.error('Failed to read file as base64 or result is invalid');
            continue;
          }

          // Determine MIME type from file extension
          let mimeType = 'image/jpeg';
          const uriParts = uri.split('.');
          if (uriParts.length > 1) {
            const ext = uriParts[uriParts.length - 1].toLowerCase().split('?')[0];
            if (ext === 'png') mimeType = 'image/png';
            else if (ext === 'gif') mimeType = 'image/gif';
            else if (ext === 'webp') mimeType = 'image/webp';
          }

          // Format as data URL for API
          base64Images.push(`data:${mimeType};base64,${base64String}`);
        } catch (error: any) {
          console.error('Error processing image:', error);
        }
      }

      if (base64Images.length === 0) {
        return [];
      }

      // Upload via API
      const response = await fetch(`${apiUrl}/api/upload/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: base64Images,
          userId: userId,
        }),
      });

      if (!response.ok) {
        // Try to parse as JSON, but handle HTML/plain text errors
        let errorMessage = `Failed to upload images (${response.status})`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const text = await response.text();
            console.error('Non-JSON error response:', text.substring(0, 200));
            // If it's HTML, it's likely a 404 or 500 error page
            if (text.includes('<html>') || text.includes('<!DOCTYPE')) {
              errorMessage = `Server error: ${response.status}. The upload endpoint may not be available.`;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON success response:', text.substring(0, 200));
        throw new Error('Server returned invalid response format');
      }

      const data = await response.json();
      return data.urls || [];
    } catch (error: any) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const handlePublish = async () => {
    // Validate required fields
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!selectedOption) {
      Alert.alert('Error', 'Please select an option (Sell, Trade, or Looking for)');
      return;
    }
    if (selectedOption === 'Sell' && !price.trim()) {
      Alert.alert('Error', 'Please enter a price for selling');
      return;
    }

    setIsPublishing(true);
    try {
      // Get current user from Supabase auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        Alert.alert('Error', 'Please log in to create a listing');
        setIsPublishing(false);
        return;
      }

      // Ensure user exists in users table (create if doesn't exist)
      let userCheckResponse = await fetch(`${apiUrl}/api/users/${authUser.id}`);
      if (userCheckResponse.status === 404) {
        // User doesn't exist, create them
        const createUserResponse = await fetch(`${apiUrl}/api/users`, {
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
        
        if (!createUserResponse.ok) {
          const errorData = await createUserResponse.json();
          // If user already exists (duplicate email/id), that's okay - continue with listing creation
          if (errorData.error?.includes('already exists') || 
              errorData.error?.includes('23505') ||
              errorData.error?.includes('duplicate key')) {
            // User already exists, continue with listing creation
            console.log('User already exists, continuing with listing creation');
          } else {
            Alert.alert('Error', `Failed to create user profile: ${errorData.error || 'Unknown error'}`);
            setIsPublishing(false);
            return;
          }
        }
      } else if (!userCheckResponse.ok) {
        Alert.alert('Error', 'Failed to verify user account');
        setIsPublishing(false);
        return;
      }

      // Upload images if any are selected
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        setUploadingImages(true);
        try {
          imageUrls = await uploadImagesToSupabase(selectedImages, authUser.id);
        } catch (error) {
          console.error('Failed to upload images:', error);
          Alert.alert('Warning', 'Failed to upload some images. Continue without images?', [
            { text: 'Cancel', onPress: () => { setIsPublishing(false); setUploadingImages(false); return; } },
            { text: 'Continue', onPress: () => {} }
          ]);
        } finally {
          setUploadingImages(false);
        }
      }

      // Prepare trade data
      const tradeData: Record<string, unknown> = {
        offerer_user_id: authUser.id,
        title: title.trim(),
        description: description.trim(),
        trade_options: selectedOption,
        category: selectedCategory,
      };

      // Add images if uploaded
      if (imageUrls.length > 0) {
        tradeData.image_urls = imageUrls;
      }

      if (selectedTags.length > 0) {
        tradeData.tags = selectedTags;
      }

      // Add price if it's a Sell option
      if (selectedOption === 'Sell' && price.trim()) {
        const priceNum = parseFloat(price.trim());
        if (isNaN(priceNum) || priceNum <= 0) {
          Alert.alert('Error', 'Please enter a valid price');
          setIsPublishing(false);
          return;
        }
        tradeData.price = priceNum;
      }

      // Make API call to create trade
      const response = await fetch(`${apiUrl}/api/trades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        Alert.alert('Error', responseData.error || `Failed to create listing (Status: ${response.status})`);
        setIsPublishing(false);
        return;
      }

      // Success!
      Alert.alert('Success', 'Listing created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setShowPreview(false);
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setPrice('');
            setSelectedOption(null);
            setSelectedCategory('Events');
            setSelectedImages([]);
            setSelectedTags([]);
            setCustomTagInput('');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Failed to create listing:', error);
      Alert.alert('Error', error.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const listingData: ListingData = {
    title: title || 'Title',
    description,
    price,
    category: selectedCategory,
    selectedOption,
    images: selectedImages,
    tags: selectedTags,
  };

  return (
    <Modal visible={true} animationType="none" presentationStyle="overFullScreen">
      <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create a New Listing</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Add Photos Section */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>Add Photos</Text>
              <View style={styles.photosContainer}>
                {selectedImages.map((item, index) => (
                  <View key={index} style={[styles.photoContainer, index < selectedImages.length - 1 && { marginRight: 12 }]}>
                    {item.type === 'icon' ? (
                      <View style={[styles.photoImage, { backgroundColor: item.backgroundColor }]}>
                        <Text style={styles.iconEmoji}>{item.emoji}</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: item.uri }} style={styles.photoImage} />
                    )}
                    <TouchableOpacity 
                      style={styles.removePhotoButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                {selectedImages.length < 10 && (
                  <TouchableOpacity 
                    style={[styles.photoPlaceholder, selectedImages.length > 0 && { marginLeft: 12 }]}
                    onPress={showImageOptionsModal}
                  >
                    <Ionicons name="add" size={32} color="#9ca3af" />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Basic Info Section */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionHeading}>Basic Info</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Placeholder"
                  placeholderTextColor="#9ca3af"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsContainer}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => setSelectedCategory(category)}
                      style={[
                        styles.categoryPill,
                        selectedCategory === category && styles.categoryPillActive
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          selectedCategory === category && styles.categoryPillTextActive
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
               <Text style={styles.inputLabel}>Tags</Text>
                {/* Tag Input */}
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={styles.tagInput}
                    placeholder="e.g. furniture, bike, resume help"
                    placeholderTextColor="#9ca3af"
                    value={customTagInput}
                    onChangeText={setCustomTagInput}
                    maxLength={30}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      const trimmedTag = customTagInput.trim();
                      if (trimmedTag && !selectedTags.includes(trimmedTag)) {
                        setSelectedTags([...selectedTags, trimmedTag]);
                        setCustomTagInput('');
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addTagButton,
                      !customTagInput.trim() && styles.addTagButtonDisabled
                    ]}
                    onPress={() => {
                      const trimmedTag = customTagInput.trim();
                      if (trimmedTag && !selectedTags.includes(trimmedTag)) {
                        setSelectedTags([...selectedTags, trimmedTag]);
                        setCustomTagInput('');
                      }
                    }}
                    disabled={!customTagInput.trim()}
                  >
                    <Text style={[
                      styles.addTagButtonText,
                      !customTagInput.trim() && styles.addTagButtonTextDisabled
                    ]}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                  <View style={styles.selectedTagsContainer}>
                    {selectedTags.map((tag, index) => (
                      <View key={index} style={styles.selectedTag}>
                        <Text style={styles.selectedTagText}>{tag}</Text>
                        <TouchableOpacity
                          onPress={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                          style={styles.removeTagButton}
                        >
                          <Ionicons name="close" size={14} color="#1f2937" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Placeholder"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Pricing Section */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionHeading}>Pricing</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Options</Text>
                <View style={styles.optionsContainer}>
                  {['Sell', 'Trade', 'Looking for'].map((option, index) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => setSelectedOption(option)}
                      style={[
                        styles.optionPill,
                        index > 0 && { marginLeft: 8 },
                        selectedOption === option && styles.optionPillActive
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionPillText,
                          selectedOption === option && styles.optionPillTextActive
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Placeholder"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>

            {/* Preview Button */}
            <TouchableOpacity 
              style={[styles.previewButton, (isPublishing || uploadingImages) && styles.previewButtonDisabled]} 
              onPress={handlePreview}
              disabled={isPublishing || uploadingImages}
            >
              {uploadingImages ? (
                <ActivityIndicator color="#1f2937" />
              ) : (
                <Text style={styles.previewButtonText}>Preview</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Preview Listing Screen */}
      <PreviewListingScreen
        visible={showPreview}
        listingData={listingData}
        onClose={() => setShowPreview(false)}
        onPublish={handlePublish}
        isPublishing={isPublishing}
      />

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}
        >
          <View style={styles.imageOptionsModal}>
            <TouchableOpacity
              style={styles.imageOption}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={24} color="#1f2937" />
              <Text style={styles.imageOptionText}>Take a photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageOption}
              onPress={pickImageFromAlbum}
            >
              <Ionicons name="images" size={24} color="#1f2937" />
              <Text style={styles.imageOptionText}>Use a photo from album</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imageOption, styles.imageOptionLast]}
              onPress={() => {
                setShowImageOptions(false);
                setShowIconPicker(true);
              }}
            >
              <Ionicons name="happy" size={24} color="#1f2937" />
              <Text style={styles.imageOptionText}>Add an icon</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Icon Picker Modal */}
      <IconPickerModal
        visible={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelect={handleIconSelect}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  keyboardView: {
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  iconEmoji: {
    fontSize: 50,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
  },
  previewButtonDisabled: {
    opacity: 0.6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 120,
  },
  pillsContainer: {
    flexDirection: 'row',
  },
  categoryPill: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#e5e7eb',
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  categoryPillTextActive: {
    color: '#1f2937',
    fontWeight: '600',
  },
  tagInputContainer: {
  flexDirection: 'row',
  gap: 8,
  marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  addTagButton: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  addTagButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  addTagButtonTextDisabled: {
    color: '#9ca3af',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  selectedTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOptionsModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  imageOptionLast: {
    borderBottomWidth: 0,
  },
  imageOptionText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  removeTagButton: {
    padding: 2,
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionPill: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  optionPillActive: {
    backgroundColor: '#e5e7eb',
  },
  optionPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  optionPillTextActive: {
    color: '#1f2937',
    fontWeight: '600',
  },
  previewButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 30,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});

