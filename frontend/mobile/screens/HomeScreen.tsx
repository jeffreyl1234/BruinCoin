import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, NEW_LISTINGS, RECOMMENDED_LISTINGS } from '../constants/data';

interface HomeScreenProps {
  onSeeAllNew: () => void;
  onSeeAllRecommended: () => void;
  onSearchPress: () => void;
}

export default function HomeScreen({ onSeeAllNew, onSeeAllRecommended, onSearchPress }: HomeScreenProps) {
  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ height: 67 }} />

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchContainer} onPress={onSearchPress}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#9ca3af"
          editable={false}
        />
      </TouchableOpacity>

      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Text style={styles.sortText}>sort</Text>
        </View>
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity key={category} style={styles.categoryButton}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* New Listings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New</Text>
          <TouchableOpacity onPress={onSeeAllNew}>
            <Text style={styles.seeAllText}>see all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.listingsScroll}
          contentContainerStyle={styles.listingsContainer}
        >
          {NEW_LISTINGS.map((listing) => (
            <View key={listing.id} style={styles.listingCard}>
              <View style={styles.imagePlaceholder} />
              <Text style={styles.listingTitle}>{listing.title}</Text>
              <View style={styles.priceContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.price}>{listing.price}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Recommended Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <TouchableOpacity onPress={onSeeAllRecommended}>
            <Text style={styles.seeAllText}>see all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.listingsScroll}
          contentContainerStyle={styles.listingsContainer}
        >
          {RECOMMENDED_LISTINGS.map((listing) => (
            <View key={listing.id} style={styles.listingCard}>
              <View style={styles.imagePlaceholder} />
              <Text style={styles.listingTitle}>{listing.title}</Text>
              <View style={styles.priceContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.price}>{listing.price}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* All Listings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Listings</Text>
        </View>
        <View style={styles.allListingsContainer}>
          <View style={styles.allListingCard} />
          <View style={[styles.allListingCard, { marginTop: 12 }]} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
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
  categoriesScroll: {
    marginLeft: 16,
  },
  categoriesContainer: {
    paddingRight: 16,
  },
  categoryButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
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
    backgroundColor: '#9ca3af',
    marginRight: 6,
  },
  price: {
    fontSize: 12,
    color: '#6b7280',
  },
  allListingsContainer: {
    paddingHorizontal: 16,
  },
  allListingCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
});

