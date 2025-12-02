import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OfferMessageProps {
  message: {
    text: string; // The note from the buyer
    metadata?: {
      type: 'Buy' | 'Trade';
      amount?: number;
      itemName?: string;
      itemDescription?: string;
      tradeTitle: string;
      tradeImageUrl: string;
    };
  };
  senderName: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export default function OfferMessage({
  message,
  senderName,
  timestamp,
  isCurrentUser,
}: OfferMessageProps) {
  const { metadata } = message;
  
  if (!metadata) {
    // Regular message fallback
    return (
      <View style={[styles.container, isCurrentUser && styles.containerRight]}>
        <View style={[styles.messageBubble, isCurrentUser && styles.messageBubbleRight]}>
          <Text style={styles.messageText}>{message.text}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isCurrentUser && styles.containerRight]}>
      {/* Message Bubble */}
      <View style={[styles.messageBubble, isCurrentUser && styles.messageBubbleRight]}>
        {/* Sender Name (if not current user) */}
        {!isCurrentUser && <Text style={styles.senderName}>{senderName}</Text>}
        
        {/* Note Text */}
        {message.text && (
          <Text style={styles.noteText}>{message.text}</Text>
        )}

        {/* Offer Card */}
        <View style={styles.offerCard}>
          <Image
            source={{ uri: metadata.tradeImageUrl }}
            style={styles.offerImage}
          />
          <View style={styles.offerDetails}>
            <Text style={styles.offerTitle}>{metadata.tradeTitle}</Text>
            <View style={styles.offerAmountContainer}>
              <Ionicons name="pricetag" size={12} color="#666" />
              <Text style={styles.offerAmount}>
                {metadata.type === 'Buy' 
                  ? `Offered $${metadata.amount?.toFixed(3) || '0'}`
                  : `Trade: ${metadata.itemName || 'Item'}`
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    alignItems: 'flex-start',
  },
  containerRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleRight: {
    backgroundColor: '#e0e7ff',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  offerImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e7eb',
  },
  offerDetails: {
    padding: 10,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  offerAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerAmount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
});