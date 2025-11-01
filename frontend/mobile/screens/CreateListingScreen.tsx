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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../constants/data';
import PreviewListingScreen, { ListingData } from './PreviewListingScreen';

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

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePublish = () => {
    // TODO: Implement publish logic
    console.log('Publishing:', { title, description, price, selectedCategory, selectedOption });
    // Close preview and create listing modal
    setShowPreview(false);
    onClose();
  };

  const listingData: ListingData = {
    title: title || 'Title',
    description,
    price,
    category: selectedCategory,
    selectedOption,
  };

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create a New Listing</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Add Photos Section */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>Add Photos</Text>
              <View style={styles.photosContainer}>
                {[1, 2, 3].map((i) => (
                  <TouchableOpacity key={i} style={[styles.photoPlaceholder, i < 3 && { marginRight: 12 }]}>
                    <Ionicons name="image-outline" size={24} color="#9ca3af" />
                  </TouchableOpacity>
                ))}
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
                <TouchableOpacity style={styles.tagButton}>
                  <Text style={styles.tagButtonText}>Select</Text>
                </TouchableOpacity>
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
            <TouchableOpacity style={styles.previewButton} onPress={handlePreview}>
              <Text style={styles.previewButtonText}>Preview</Text>
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
    paddingVertical: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 20,
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
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  tagButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  tagButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
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

