import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Placeholder data - default display
const CATEGORIES = ['Events', 'Goods', 'Beauty', 'Ride'];

const NEW_LISTINGS = [
  { id: '1', title: 'Royce Headshots', price: '$10 / Trade', status: 'Trade' },
  { id: '2', title: 'Rideshare to LAX', price: 'Looking for', status: 'Looking for' },
  { id: '3', title: 'Gel-x Nails', price: 'Trade', status: 'Trade' },
];

const RECOMMENDED_LISTINGS = [
  { id: '4', title: 'Rideshare to LAX', price: 'Looking for', status: 'Looking for' },
  { id: '5', title: 'Rideshare to LAX', price: 'Looking for', status: 'Looking for' },
  { id: '6', title: 'Rideshare to LAX', price: 'Looking for', status: 'Looking for' },
];

// API base URL - change this to your Render URL when deployed
// Uncomment the code below and remove placeholder data when ready to use API
/*
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';

interface Trade {
  id: string;
  title?: string;
  description?: string;
  skill_offered?: string;
  price?: number;
  category?: string;
  accepted: boolean;
}

// Fetch trades from Express API
async function fetchTrades(filters?: { limit?: number; category?: string; offset?: number }): Promise<Trade[]> {
  try {
    const params = new URLSearchParams();
    params.append('limit', String(filters?.limit || 20));
    params.append('accepted', 'false');
    if (filters?.category) params.append('category', filters.category);
    if (filters?.offset) params.append('offset', String(filters.offset));
    
    const response = await fetch(`${API_BASE_URL}/api/trades?${params.toString()}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.trades || [];
  } catch (error) {
    console.error('Failed to fetch trades:', error);
    return [];
  }
}
*/

export default function App() {
  // Placeholder mode - using mock data
  // To switch to API mode: uncomment API code above and replace with API state management below
  /*
  const [newTrades, setNewTrades] = useState<Trade[]>([]);
  const [recommendedTrades, setRecommendedTrades] = useState<Trade[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [newData, recommendedData, allData] = await Promise.all([
        fetchTrades({ limit: 6, offset: 0 }),
        fetchTrades({ limit: 6 }),
        fetchTrades({ limit: 20 })
      ]);
      setNewTrades(newData);
      setRecommendedTrades(recommendedData);
      setAllTrades(allData);
      const uniqueCategories = Array.from(
        new Set(allData.map(t => t.category).filter(c => c))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ height: 67 }} />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#9ca3af"
          />
        </View>

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
            <TouchableOpacity>
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
            <TouchableOpacity>
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

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeIndicator} />
          <Ionicons name="home" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="search" size={28} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="add-circle" size={28} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="mail" size={28} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={28} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
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
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
    paddingBottom: 32,
    minHeight: 60,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
  },
});
