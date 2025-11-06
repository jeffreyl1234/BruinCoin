import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
  hasAttachment?: boolean;
}

interface MessagesLandingScreenProps {
  onChatPress: (chatId: string) => void;
}

const MOCK_CHATS: Chat[] = [
  { id: '1', name: 'Josie Bruin', lastMessage: 'Hi I also wanted to rideshare on...', unreadCount: 9, hasAttachment: true },
  { id: '2', name: 'Josie Bruin', lastMessage: 'Hi I also wanted to rideshare on...', unreadCount: 9 },
  { id: '3', name: 'Josie Bruin', lastMessage: 'Hi I also wanted to rideshare on...', unreadCount: 9 },
  { id: '4', name: 'Josie Bruin', lastMessage: 'Hi I also wanted to rideshare on...', unreadCount: 9 },
  { id: '5', name: 'Josie Bruin', lastMessage: 'Hi I also wanted to rideshare on...', unreadCount: 9 },
];

export default function MessagesLandingScreen({ onChatPress }: MessagesLandingScreenProps) {
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Messaging Landing Page</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
          <TouchableOpacity>
            <Ionicons name="create-outline" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Contacts"
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="menu" size={20} color="#1f2937" />
            <Text style={styles.filterText}>Filter</Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Chat List */}
        <View style={styles.chatList}>
          {MOCK_CHATS.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCard}
              onPress={() => onChatPress(chat.id)}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color="#3b82f6" />
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatPreview} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
              </View>
              <View style={styles.chatRight}>
                {chat.hasAttachment && (
                  <Ionicons name="attach" size={20} color="#1f2937" style={styles.attachmentIcon} />
                )}
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  editLink: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'relative',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 6,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chatList: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  chatPreview: {
    fontSize: 14,
    color: '#1f2937',
  },
  chatRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  attachmentIcon: {
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

