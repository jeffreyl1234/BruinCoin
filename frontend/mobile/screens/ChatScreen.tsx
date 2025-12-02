import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';
import { useRoute } from '@react-navigation/native';
import OfferMessage from './OfferMessage';

interface Message {
  id: string;
  text: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  metadata?: {
    type: 'Buy' | 'Trade';
    amount?: number;
    itemName?: string;
    itemDescription?: string;
    tradeTitle: string;
    tradeImageUrl: string;
  };
}

interface ChatScreenProps {
  chatId: string;
  contactName: string;
  onBack: () => void;
}

export default function ChatScreen({ chatId, contactName, onBack }: ChatScreenProps) {
  const [displayName, setDisplayName] = useState(contactName);

  useEffect(() => {
    const fetchOtherUserName = async () => {
      try {
        // 1️⃣ Extract conversation ID (remove the "chat_with_" prefix)
        const formattedChatId = chatId.replace('chat_with_', '');

        // 2️⃣ Fetch the conversation row
        const { data: convo, error: convoError } = await supabase
          .from('conversations')
          .select('user1_id, user2_id')
          .eq('id', formattedChatId)
          .single();

        if (convoError || !convo) {
          console.error('Error fetching conversation:', convoError?.message);
          return;
        }

        // 3️⃣ Get current user ID
        const { data: userData } = await supabase.auth.getUser();
        const currentUserId = userData.user?.id;

        // 4️⃣ Determine who the other user is
        const otherUserId = convo.user1_id === currentUserId ? convo.user2_id : convo.user1_id;

        // 5️⃣ Fetch the other user's username (works with either 'profiles' or 'users' table)
        let username: string | null = null;

        // Try profiles table first
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_name')
          .eq('id', otherUserId)
          .maybeSingle();

        if (!profileError && profileData?.user_name) {
          username = profileData.user_name;
        } else {
          // fallback: check 'users' table if you store names there
          const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('user_name')
            .eq('id', otherUserId)
            .maybeSingle();

          if (!userError && userRecord?.user_name) {
            username = userRecord.user_name;
          }
        }

        if (username) {
          setDisplayName(username);
        } else {
          console.warn('Could not find username for other user.');
        }
      } catch (err) {
        console.error('Error in fetchOtherUserName:', err);
      }
    };

    if (!contactName) fetchOtherUserName();
  }, [chatId, contactName]);
  
  const receiverId = chatId.replace('chat_with_', '');

  const SUGGESTED_TASKS = [
    'Schedule a Meetup',
    "Outline your product's features",
    'Ask about making potential trades or group deals',
    "Suggest other selling items based on Josie's posts",
  ];

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the current user's ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!chatId || !userId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true); 

        const formattedChatId = chatId.replace('chat_with_', '');
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', formattedChatId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error.message);
        } else if (data) {
          console.log('Fetched messages:', data); // Debug: Check if metadata is present
          setMessages(data);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, userId]);

  // Listen for new messages
  useEffect(() => {
    if (!chatId || !userId) return;

    const formattedChatId = chatId.replace('chat_with_', '');
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${formattedChatId}`,
        },
        (payload) => {
          console.log('New message received:', payload.new); // Debug
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, userId]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !userId || !receiverId) return;

    const conversationId = chatId.replace('chat_with_', '');
    if (!conversationId) {
      console.error('No conversation ID found.');
      return;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        text: messageText.trim(),
      })
      .select();

    if (error) {
      console.error('Error sending message:', error.message);
      return;
    }

    setMessageText('');
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).toLowerCase();
  };

  // Render individual message
  const renderMessage = (message: Message) => {
    const isCurrentUser = message.sender_id === userId;

    // Check if this is an offer message
    if (message.metadata && message.metadata.tradeTitle) {
      return (
        <OfferMessage
          key={message.id}
          message={message}
          senderName={isCurrentUser ? 'You' : (displayName || contactName)}
          timestamp={formatTime(message.created_at)}
          isCurrentUser={isCurrentUser}
        />
      );
    }

    // Regular text message
    return (
      <View
        key={message.id}
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isCurrentUser ? styles.myMessageText : styles.otherMessageText,
          ]}
        >
          {message.text}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 59 : 0}
      >
        <View style={{ flex: 1 }}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={26} color="#1C1C1E" />
            </TouchableOpacity>
            <Text style={styles.contactName}>{displayName || contactName}</Text>
            <View style={styles.buyingTag}>
              <Text style={styles.buyingText}>Buying</Text>
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* MESSAGES */}
          <ScrollView
            style={styles.messagesArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {messages.length === 0 ? (
              <View style={styles.initialState}>
                <Text style={styles.initialText}>
                  This is the beginning of your conversation with {displayName || contactName}.
                </Text>

                <View style={styles.suggestedTasks}>
                  <Text style={styles.suggestedTitle}>Suggested tasks:</Text>
                  <View style={styles.tasksGrid}>
                    {SUGGESTED_TASKS.map((task, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.taskButton}
                        onPress={() => setMessageText(task)}
                      >
                        <Text style={styles.taskText}>{task}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.messagesContainer}>
                {messages.map((message) => renderMessage(message))}
              </View>
            )}
          </ScrollView>

          {/* INPUT BAR */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Message..."
              placeholderTextColor="#9CA3AF"
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons
                name="send"
                size={22}
                color={messageText.trim() ? '#007AFF' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: 0.8,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { marginRight: 10 },
  contactName: { flex: 1, fontSize: 18, fontWeight: '600' },
  buyingTag: {
    backgroundColor: '#E7FBEF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  buyingText: { color: '#34C759', fontWeight: '600', fontSize: 13 },
  menuButton: { marginLeft: 4 },
  messagesArea: { flex: 1, paddingHorizontal: 16 },
  initialState: { paddingVertical: 32 },
  initialText: { fontSize: 14, color: '#1F2937', marginBottom: 32 },
  suggestedTasks: { marginTop: 8 },
  suggestedTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  tasksGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  taskButton: {
    width: '48%',
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    justifyContent: 'center',
  },
  taskText: { fontSize: 14, textAlign: 'center' },
  messagesContainer: { paddingVertical: 16, gap: 12 },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: '#F2F4F7' },
  messageText: { fontSize: 14 },
  myMessageText: { color: '#FFFFFF' },
  otherMessageText: { color: '#1F2937' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 0.8,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: { padding: 4 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});