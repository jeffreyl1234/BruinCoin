import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface IconPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string, backgroundColor: string) => void;
}

const EMOJI_OPTIONS = [
  '😜',
  '💙',
  '🍰',
  '🍗',
  '🐵',
  '💐',
  '🚗',
];

const BACKGROUND_COLORS = [
  '#E0F2FE', // Light blue
  '#FEF3C7', // Light yellow
  '#FCE7F3', // Light pink
  '#D1FAE5', // Light green
];

export default function IconPickerModal({ visible, onClose, onSelect }: IconPickerModalProps) {
  const [selectedEmoji, setSelectedEmoji] = useState('🚗');
  const [selectedBackground, setSelectedBackground] = useState('#E0F2FE');

  const handleSelect = () => {
    onSelect(selectedEmoji, selectedBackground);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Icon</Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Icon Preview */}
          <View style={styles.previewContainer}>
            <View style={[styles.previewBox, { backgroundColor: selectedBackground }]}>
              <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
            </View>
          </View>

          {/* Emoji Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emoji</Text>
            <View style={styles.emojiGrid}>
              <TouchableOpacity style={styles.emojiButton}>
                <Ionicons name="add" size={24} color="#9ca3af" />
              </TouchableOpacity>
              {EMOJI_OPTIONS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === emoji && styles.emojiButtonSelected,
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Background Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Background</Text>
            <View style={styles.colorGrid}>
              {BACKGROUND_COLORS.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedBackground === color && styles.colorButtonSelected,
                  ]}
                  onPress={() => setSelectedBackground(color)}
                >
                  {selectedBackground === color && (
                    <Ionicons name="checkmark" size={20} color="#1f2937" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleSelect}>
            <Text style={styles.confirmButtonText}>Add Icon</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 4,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  previewBox: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: {
    fontSize: 80,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emojiButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginBottom: 12,
  },
  emojiButtonSelected: {
    backgroundColor: '#e5e7eb',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  emojiText: {
    fontSize: 28,
  },
  colorGrid: {
    flexDirection: 'row',
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#1f2937',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  confirmButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

