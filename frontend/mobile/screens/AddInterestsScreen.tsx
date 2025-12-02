import { StyleSheet, Text, TextInput, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface AddInterestsScreenProps {
  onBack: () => void;
  onNext: (interests: string[]) => void;
  onSkip: () => void;
}

export default function AddInterestsScreen({ onBack, onNext, onSkip }: AddInterestsScreenProps) {
  const [interestsInput, setInterestsInput] = useState('');

  const handleNext = () => {
    // Parse interests from comma-separated input
    const interests = interestsInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    onNext(interests);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Text style={styles.title}>Add your interests</Text>
          <Text style={styles.subtitle}>
            What are you interested in? Separate multiple interests with commas.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g., Ride Share, Nails, Photography, Concert tickets..."
            placeholderTextColor="#9ca3af"
            value={interestsInput}
            onChangeText={setInterestsInput}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  skipButton: {
    padding: 4,
  },
  skipText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    marginBottom: 32,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#111827',
    minHeight: 120,
  },
  nextButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

