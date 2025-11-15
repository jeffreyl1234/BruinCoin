import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import MessagesLandingScreen from './screens/MessagesLandingScreen';
import ChatScreen from './screens/ChatScreen';
import CreateListingScreen from './screens/CreateListingScreen';
import SeeAllScreen from './screens/SeeAllScreen';
import ListingDetailScreen from './screens/ListingDetailScreen';
import BottomNavigation from './components/BottomNavigation';

type Screen = 'home' | 'search' | 'profile' | 'messages';
type AuthScreen = 'login' | 'register';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showSeeAll, setShowSeeAll] = useState(false);
  const [seeAllType, setSeeAllType] = useState<'new' | 'recommended'>('new');
  const [showChat, setShowChat] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [currentContactName, setCurrentContactName] = useState<string>('Josie Bruin');
  const [showListingDetail, setShowListingDetail] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);

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

  const handleTradePress = (tradeId: string) => {
    setSelectedTradeId(tradeId);
    setShowListingDetail(true);
  };

  const handleListingDetailClose = () => {
    setShowListingDetail(false);
    setSelectedTradeId(null);
  };

  // SeeAllScreen will fetch data from API, pass empty array for now
  const listings: any[] = [];

  // Show auth screens if not logged in
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="auto" />
        {authScreen === 'login' ? (
          <LoginScreen 
            onLogin={() => setIsLoggedIn(true)} 
            onSwitchToRegister={() => setAuthScreen('register')}
          />
        ) : (
          <RegisterScreen 
            onRegister={() => setIsLoggedIn(true)} 
            onSwitchToLogin={() => setAuthScreen('login')}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      {currentScreen === 'home' && (
        <HomeScreen 
          onSeeAllNew={() => handleSeeAll('new')}
          onSeeAllRecommended={() => handleSeeAll('recommended')}
          onSearchPress={() => setCurrentScreen('search')}
          onTradePress={handleTradePress}
        />
      )}
      
      {currentScreen === 'search' && (
        <SearchScreen onTradePress={handleTradePress} />
      )}
      
      {currentScreen === 'profile' && (
        <ProfileScreen
          onBack={() => setCurrentScreen('home')}
          onLogout={() => setIsLoggedIn(false)}
        />
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

      {/* Listing Detail Screen */}
      <ListingDetailScreen
        visible={showListingDetail}
        tradeId={selectedTradeId}
        onClose={handleListingDetailClose}
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
