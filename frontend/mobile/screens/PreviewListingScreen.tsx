import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export interface ListingData {
  title: string;
  description: string;
  price: string;
  category: string;
  selectedOption: string | null;
}

interface PreviewListingScreenProps {
  visible: boolean;
  listingData: ListingData;
  onClose: () => void;
  onPublish?: () => void;
}

export default function PreviewListingScreen({
  visible,
  listingData,
  onClose,
  onPublish,
}: PreviewListingScreenProps) {
  const formatDescription = (description: string) => {
    if (!description) return [];
    // Split by lines or create bullet points from text
    const lines = description.split('\n').filter(line => line.trim());
    return lines.length > 0 ? lines : [description];
  };

  const descriptionLines = formatDescription(listingData.description);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>Preview Listing</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Navigation Bar with Search */}
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

          {/* Main Content Card */}
          <View style={styles.contentCard}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.titleText}>{listingData.title || 'Title'}</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{listingData.selectedOption || 'Looking for'}</Text>
              </View>
            </View>

            {/* Image Placeholders */}
            <View style={styles.imagesContainer}>
              <View style={styles.imagePlaceholder} />
              <View style={[styles.imagePlaceholder, { marginLeft: 12 }]} />
            </View>

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

            {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Make an offer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { marginLeft: 12 }]}>
                  <Text style={styles.actionButtonText}>Contact Seller</Text>
                </TouchableOpacity>
              </View>

            {/* Seller Section */}
            <View style={styles.sellerSection}>
              <Text style={styles.sectionTitle}>Seller</Text>
              <View style={styles.sellerInfo}>
                <View style={styles.sellerAvatar} />
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>First Last</Text>
                  <View style={styles.ratingContainer}>
                    {[...Array(5)].map((_, i) => (
                      <View key={i} style={i > 0 ? { marginLeft: 2 } : undefined}>
                        <Ionicons name="star" size={16} color="#3b82f6" />
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Publish Button */}
            <TouchableOpacity style={styles.publishButton} onPress={onPublish}>
              <Text style={styles.publishButtonText}>Publish</Text>
            </TouchableOpacity>
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
    marginBottom: 16,
  },
  titleText: {
    fontSize: 20,
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
    fontSize: 14,
    color: '#6b7280',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
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
    textDecorationLine: 'underline',
  },
  noDescription: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  sellerSection: {
    marginBottom: 20,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
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
  ratingContainer: {
    flexDirection: 'row',
  },
  publishButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});

