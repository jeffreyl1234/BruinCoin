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

interface Listing {
  id: string;
  title: string;
  price: string;
  status: string;
}

interface SeeAllScreenProps {
  visible: boolean;
  type: 'new' | 'recommended';
  listings: Listing[];
  onClose: () => void;
}

export default function SeeAllScreen({
  visible,
  type,
  listings,
  onClose,
}: SeeAllScreenProps) {
  const title = type === 'new' ? 'New' : 'Recommended';
  const headerTitle = `See All - ${title}`;
  const sectionTitle = type === 'new' ? 'New Listings' : 'Recommended';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>{headerTitle}</Text>
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

          {/* Section Title */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          </View>

          {/* Listings Grid */}
          <View style={styles.gridContainer}>
            {listings.map((listing) => (
              <TouchableOpacity key={listing.id} style={styles.gridCard}>
                <View style={styles.cardImagePlaceholder} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {listing.title}
                  </Text>
                  <View style={styles.cardStatusContainer}>
                    <View style={styles.cardStatusDot} />
                    <Text style={styles.cardStatusText}>{listing.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
    color: '#6b7280',
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
  sectionTitleContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#f3f4f6',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    minHeight: 40,
  },
  cardStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    marginRight: 6,
  },
  cardStatusText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

