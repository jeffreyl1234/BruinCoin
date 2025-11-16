import React, { useState } from 'react';
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

const SUGGESTED_TASKS = [
  'Schedule a Meetup',
  "Outline your product's features",
  'Ask about making potential trades or group deals',
  "Suggest other selling items based on Josie's posts",
];

export default function ChatScreen({ chatId, contactName, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');

  const isInitialState = messages.length === 0;

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText.trim(),
        sender: 'me',
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
    }
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
          {isInitialState ? (
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
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.8,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 10,
  },
  contactName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  buyingTag: {
    backgroundColor: '#E7FBEF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  buyingText: {
    color: '#34C759',
    fontWeight: '600',
    fontSize: 13,
  },
  menuButton: {
    marginLeft: 4,
  },
  messagesArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  initialState: {
    paddingVertical: 32,
  },
  initialText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 32,
    textAlign: 'left',
  },
  suggestedTasks: {
    marginTop: 8,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  tasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  taskButton: {
    width: '48%',
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    justifyContent: 'center',
  },
  taskText: {
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'center',
  },
  messagesContainer: {
    paddingVertical: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F4F7',
  },
  messageText: {
    fontSize: 14,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1F2937',
  },
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
    color: '#1F2937',
    marginRight: 8,
  },
  attachButton: {
    marginRight: 6,
  },
  sendButton: {
    padding: 4,
  },
});