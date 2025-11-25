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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';
import { useRoute } from '@react-navigation/native';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
}

interface ChatScreenProps {
  chatId: string;
  contactName: string;
  onBack: () => void;
}

export default function ChatScreen({ chatId, contactName, onBack }: ChatScreenProps) {
  const receiverId = chatId.replace('chat_with_', '');

  const SUGGESTED_TASKS = [
    'Schedule a Meetup',
    "Outline your product's features",
    'Ask about making potential trades or group deals',
    "Suggest other selling items based on Josie’s posts",
  ];

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

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
      const formattedChatId = chatId.replace('chat_with_', '');
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', formattedChatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error.message);
      } else if (data) {
        const loadedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender_id === userId ? 'me' : 'other',
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      }
    };

    fetchMessages();
  }, [chatId, userId]);

  // Listen for new messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            text: payload.new.text,
            sender: payload.new.sender_id === userId ? 'me' : 'other',
            timestamp: new Date(payload.new.created_at),
          };
          setMessages((prev: Message[]) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, userId]);

  const extractUuid = (id: string) => {
    const match = id.match(/[0-9a-fA-F-]{36}/);
    return match ? match[0] : id;
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !userId || !receiverId) return;

    // 🧠 Step 1: Check if a conversation already exists between these users
    const { data: existingConversation, error: convoError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${userId},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${userId})`)
      .limit(1)
      .maybeSingle();

    let conversationId = existingConversation?.id;

    // 🧠 Step 2: If it doesn't exist, create it
    if (!conversationId) {
      const { data: newConvo, error: insertError } = await supabase
        .from('conversations')
        .insert([
          {
            user1_id: userId,
            user2_id: receiverId,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating conversation:', insertError.message);
        return;
      }

      conversationId = newConvo.id;
    }

    // 🧠 Step 3: Insert the message linked to that conversation
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.contactName}>{contactName}</Text>
          <View style={styles.buyingTag}>
            <Text style={styles.buyingText}>Buying</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.messagesArea} showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <View style={styles.initialState}>
              <Text style={styles.initialText}>
                This is the beginning of your conversation with {contactName}.
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
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.sender === 'me' ? styles.myMessage : styles.otherMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.sender === 'me' ? styles.myMessageText : styles.otherMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Placeholder"
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
    paddingVertical: 10,
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
});