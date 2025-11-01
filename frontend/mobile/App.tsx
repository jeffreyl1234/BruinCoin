import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import MessagesLandingScreen from './screens/MessagesLandingScreen';
import ChatScreen from './screens/ChatScreen';
import CreateListingScreen from './screens/CreateListingScreen';
import SeeAllScreen from './screens/SeeAllScreen';
import BottomNavigation from './components/BottomNavigation';
import { NEW_LISTINGS, RECOMMENDED_LISTINGS } from './constants/data';

type Screen = 'home' | 'search' | 'profile' | 'messages';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showSeeAll, setShowSeeAll] = useState(false);
  const [seeAllType, setSeeAllType] = useState<'new' | 'recommended'>('new');
  const [showChat, setShowChat] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [currentContactName, setCurrentContactName] = useState<string>('Josie Bruin');

  const handleSeeAll = (type: 'new' | 'recommended') => {
    setSeeAllType(type);
    setShowSeeAll(true);
  };

  const handleChatPress = (chatId: string) => {
    setCurrentChatId(chatId);
    setShowChat(true);
  };

  const handleChatBack = () => {
    setShowChat(false);
    setCurrentChatId('');
  };

  const listings = seeAllType === 'new' ? NEW_LISTINGS : RECOMMENDED_LISTINGS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      {currentScreen === 'home' && (
        <HomeScreen 
          onSeeAllNew={() => handleSeeAll('new')}
          onSeeAllRecommended={() => handleSeeAll('recommended')}
          onSearchPress={() => setCurrentScreen('search')}
        />
      )}
      
      {currentScreen === 'search' && (
        <SearchScreen />
      )}
      
      {currentScreen === 'profile' && (
        <ProfileScreen onBack={() => setCurrentScreen('home')} />
      )}
      
      {currentScreen === 'messages' && !showChat && (
        <MessagesLandingScreen onChatPress={handleChatPress} />
      )}
      
      {showChat && (
        <ChatScreen
          chatId={currentChatId}
          contactName={currentContactName}
          onBack={handleChatBack}
        />
      )}

      <BottomNavigation 
        currentScreen={currentScreen}
        onHomePress={() => setCurrentScreen('home')}
        onSearchPress={() => setCurrentScreen('search')}
        onMessagesPress={() => setCurrentScreen('messages')}
        onProfilePress={() => setCurrentScreen('profile')}
        onAddPress={() => setShowCreateListing(true)} 
      />

      {/* Create Listing Modal */}
      {showCreateListing && (
        <CreateListingScreen onClose={() => setShowCreateListing(false)} />
      )}

      {/* See All Screen */}
      <SeeAllScreen
        visible={showSeeAll}
        type={seeAllType}
        listings={listings}
        onClose={() => setShowSeeAll(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
