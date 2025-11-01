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
  'Outline your product\'s features',
  'Ask about making potential trades or group deals',
  'Suggest other selling items based on Josie\'s posts',
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
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Individual Messaging Page</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.contentCard}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.contactName}>{contactName}</Text>
            <View style={styles.buyingTag}>
              <Text style={styles.buyingText}>Buying</Text>
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Messages Area */}
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

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Placeholder"
              placeholderTextColor="#9ca3af"
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={24} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons
                name="send"
                size={24}
                color={messageText.trim() ? '#2563eb' : '#9ca3af'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
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
  keyboardView: {
    flex: 1,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
  },
  contactName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  buyingTag: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  buyingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  menuButton: {
    marginLeft: 8,
  },
  messagesArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  initialState: {
    paddingVertical: 40,
  },
  initialText: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 32,
    textAlign: 'center',
  },
  suggestedTasks: {
    marginTop: 24,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  tasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  taskButton: {
    width: '48%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 80,
    justifyContent: 'center',
  },
  taskText: {
    fontSize: 14,
    color: '#1f2937',
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
    backgroundColor: '#2563eb',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 14,
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#1f2937',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    maxHeight: 100,
    marginRight: 8,
  },
  attachButton: {
    marginRight: 8,
  },
  sendButton: {
    padding: 4,
  },
});

