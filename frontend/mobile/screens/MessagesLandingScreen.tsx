import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
  {
    id: "1",
    name: "Josie Bruin",
    lastMessage: "Hi I also wanted to rideshare on...",
    unreadCount: 9,
    hasAttachment: true,
  },
  {
    id: "2",
    name: "Josie Bruin",
    lastMessage: "Hi I also wanted to rideshare on...",
    unreadCount: 9,
  },
  {
    id: "3",
    name: "Josie Bruin",
    lastMessage: "Hi I also wanted to rideshare on...",
    unreadCount: 9,
  },
  {
    id: "4",
    name: "Josie Bruin",
    lastMessage: "Hi I also wanted to rideshare on...",
    unreadCount: 9,
  },
  {
    id: "5",
    name: "Josie Bruin",
    lastMessage: "Hi I also wanted to rideshare on...",
    unreadCount: 9,
  },
];

export default function MessagesLandingScreen({
  onChatPress,
}: MessagesLandingScreenProps) {
  const [searchText, setSearchText] = useState("");

  return (
    <SafeAreaView style={[styles.container, { paddingTop: 4 }]} edges={["top", "bottom"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chats</Text>
          <TouchableOpacity>
            <Ionicons name="create-outline" size={22} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter-outline" size={18} color="#1f2937" />
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
                <Ionicons name="person" size={30} color="#3b82f6" />
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatPreview} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
              </View>
              <View style={styles.chatRight}>
                {chat.hasAttachment && (
                  <Ionicons
                    name="attach-outline"
                    size={18}
                    color="#6b7280"
                    style={{ marginBottom: 4 }}
                  />
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
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  editText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    marginLeft: 6,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    position: "relative",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginLeft: 4,
  },
  filterBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  chatList: {
    paddingVertical: 8,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 3,
  },
  chatPreview: {
    fontSize: 13,
    color: "#6b7280",
  },
  chatRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  unreadBadge: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
});