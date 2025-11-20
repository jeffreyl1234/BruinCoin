import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabaseClient';

const TRADE_OPTIONS = ['Buying', 'Selling', 'Trading'] as const;
const CATEGORY_OPTIONS = [
  'Concert tickets',
  'Clothing',
  'Tickets',
  'Nails',
  'Ride share',
  'Meal swipes',
  'Photography',
  'Items',
  'Textbooks',
] as const;

interface OnboardingFlowProps {
  onComplete: () => void;
  onExit: () => void;
}

const TOTAL_STEPS = 5;

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onExit }) => {
  const [step, setStep] = useState(0);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [tradePreferences, setTradePreferences] = useState<string[]>([]);
  const [categoryPreferences, setCategoryPreferences] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  const handleExit = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Failed to sign out during onboarding exit:', error);
    } finally {
      onExit();
    }
  }, [onExit]);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) {
          Alert.alert('Session expired', 'Please log in again to continue onboarding.', [
            { text: 'OK', onPress: handleExit },
          ]);
          return;
        }

        if (!isMounted) return;

        setUserId(user.id);
        setEmail(user.email ?? '');

        const metadataDisplayName =
          (typeof user.user_metadata?.display_name === 'string' && user.user_metadata.display_name.trim().length > 0)
            ? (user.user_metadata.display_name as string)
            : '';
        const fallbackName = user.email ? user.email.split('@')[0] : 'Bruin';
        setDisplayName(metadataDisplayName || fallbackName);

        if (typeof user.user_metadata?.bio === 'string') {
          setBio(user.user_metadata.bio);
        }

        if (Array.isArray(user.user_metadata?.interests)) {
          setInterestsInput((user.user_metadata.interests as string[]).join(', '));
        }

        if (Array.isArray(user.user_metadata?.trade_preferences)) {
          setTradePreferences(user.user_metadata.trade_preferences as string[]);
        }

        if (Array.isArray(user.user_metadata?.category_preferences)) {
          setCategoryPreferences(user.user_metadata.category_preferences as string[]);
        }

        if (typeof user.user_metadata?.profile_picture_url === 'string') {
          setProfileImageUri(user.user_metadata.profile_picture_url as string);
        }
      } catch (err) {
        console.error('Failed to load user for onboarding:', err);
        Alert.alert('Error', 'Could not load your profile. Please log in again.', [
          { text: 'OK', onPress: handleExit },
        ]);
      } finally {
        if (isMounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [handleExit]);

  const toggleSelection = useCallback((value: string, selectedValues: string[], setter: (next: string[]) => void) => {
    setter(
      selectedValues.includes(value)
        ? selectedValues.filter((option) => option !== value)
        : [...selectedValues, value]
    );
  }, []);

  const handleTradeToggle = useCallback(
    (option: string) => toggleSelection(option, tradePreferences, setTradePreferences),
    [toggleSelection, tradePreferences],
  );

  const handleCategoryToggle = useCallback(
    (option: string) => toggleSelection(option, categoryPreferences, setCategoryPreferences),
    [toggleSelection, categoryPreferences],
  );

  const pickProfileImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos to choose a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting profile image:', error);
      Alert.alert('Error', 'Failed to select a profile picture. Please try again.');
    }
  }, []);

  const uploadProfileImage = useCallback(
    async (imageUri: string, userUuid: string): Promise<string | null> => {
      try {
        setUploadingImage(true);
        const base64String = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (!base64String) {
          throw new Error('Unable to read the selected image.');
        }

        let mimeType = 'image/jpeg';
        const uriParts = imageUri.split('.');
        if (uriParts.length > 1) {
          const ext = uriParts.pop()?.toLowerCase().split('?')[0];
          if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'webp') mimeType = 'image/webp';
        }

        const dataUrl = `data:${mimeType};base64,${base64String}`;
        const response = await fetch(`${apiUrl}/api/upload/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            images: [dataUrl],
            userId: userUuid,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(errorData.error || 'Failed to upload profile picture.');
        }

        const data = await response.json();
        return data.urls && data.urls.length > 0 ? data.urls[0] : null;
      } catch (error: any) {
        console.error('Error uploading profile image:', error);
        throw error;
      } finally {
        setUploadingImage(false);
      }
    },
    [apiUrl],
  );

  const syncLookingForCategories = useCallback(
    async (userUuid: string, categories: string[]) => {
      if (!categories.length) return;

      try {
        const response = await fetch(`${apiUrl}/api/looking-for/${userUuid}`);
        const existingData = response.ok ? await response.json() : { items: [] };
        const existingNames = new Set<string>(
          Array.isArray(existingData.items)
            ? existingData.items
                .map((item: any) => (typeof item?.item_name === 'string' ? item.item_name.toLowerCase() : ''))
                .filter(Boolean)
            : [],
        );

        const uniqueCategories = Array.from(new Set(categories.map((category) => category.trim()).filter(Boolean)));

        for (const category of uniqueCategories) {
          if (existingNames.has(category.toLowerCase())) continue;

          await fetch(`${apiUrl}/api/looking-for`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userUuid,
              item_name: category,
            }),
          });
        }
      } catch (error) {
        console.warn('Failed to sync looking-for categories during onboarding:', error);
      }
    },
    [apiUrl],
  );

  const parsedInterests = useMemo(
    () =>
      Array.from(
        new Set(
          interestsInput
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value.length > 0),
        ),
      ),
    [interestsInput],
  );

  const handleSubmit = useCallback(async () => {
    if (!userId) {
      Alert.alert('Error', 'We could not confirm your account. Please log in again.');
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      let uploadedProfileUrl = profileImageUri || null;
      if (profileImageUri && !profileImageUri.startsWith('http')) {
        uploadedProfileUrl = await uploadProfileImage(profileImageUri, userId);
      }

      const metadataUpdate = {
        display_name: displayName.trim(),
        bio: bio.trim(),
        interests: parsedInterests,
        trade_preferences: tradePreferences,
        category_preferences: categoryPreferences,
        profile_picture_url: uploadedProfileUrl,
        onboarding_complete: true,
      };

      const { error: updateError } = await supabase.auth.updateUser({
        data: metadataUpdate,
      });

      if (updateError) {
        throw updateError;
      }

      try {
        await fetch(`${apiUrl}/api/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_name: displayName.trim(),
            bio: bio.trim(),
            profile_picture_url: uploadedProfileUrl ?? '',
            trade_preferences: tradePreferences,
            category_preferences: categoryPreferences,
            interests: parsedInterests,
          }),
        });
      } catch (profileUpdateError) {
        console.warn('Failed to sync onboarding data to users table:', profileUpdateError);
      }

      await syncLookingForCategories(userId, categoryPreferences);

      onComplete();
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      Alert.alert('Error', error.message || 'Failed to save your onboarding details.');
    } finally {
      setSubmitting(false);
    }
  }, [
    apiUrl,
    bio,
    categoryPreferences,
    displayName,
    onComplete,
    parsedInterests,
    profileImageUri,
    submitting,
    syncLookingForCategories,
    tradePreferences,
    uploadProfileImage,
    userId,
  ]);

  const handleNext = useCallback(() => {
    if (step === 0 && displayName.trim().length === 0) {
      Alert.alert('Hold on', 'Please add a display name to help others recognize you.');
      return;
    }

    if (step >= TOTAL_STEPS - 1) {
      handleSubmit();
      return;
    }

    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  }, [displayName, handleSubmit, step]);

  const handleBack = useCallback(() => {
    setStep((current) => Math.max(current - 1, 0));
  }, []);

  const stepTitle = useMemo(() => {
    switch (step) {
      case 0:
        return 'Create your account';
      case 1:
        return 'Add a profile picture';
      case 2:
        return 'Tell us about yourself';
      case 3:
        return 'Buying, selling, or trading?';
      case 4:
        return 'Pick your interests';
      default:
        return '';
    }
  }, [step]);

  const renderStepContent = useMemo(() => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.title}>{stepTitle}</Text>
            <Text style={styles.description}>
              We just need a name to get started. You can always change it later.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bruin email</Text>
              <View style={styles.staticField}>
                <Text style={styles.staticFieldText}>{email || 'Unknown'}</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Display name</Text>
              <TextInput
                style={styles.input}
                placeholder="What should people call you?"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.title}>{stepTitle}</Text>
            <Text style={styles.description}>
              A profile picture helps buyers and sellers trust who they are working with.
            </Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickProfileImage}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderCircle}>
                  <Text style={styles.placeholderInitial}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Tap to {profileImageUri ? 'replace' : 'add'} your photo. You can skip this for now.
            </Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.title}>{stepTitle}</Text>
            <Text style={styles.description}>
              Share a quick bio and a few keywords so your profile feels complete.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Tell the community about yourself..."
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Interests</Text>
              <TextInput
                style={styles.input}
                placeholder="Photography, vintage clothes, tutoring..."
                value={interestsInput}
                onChangeText={setInterestsInput}
                autoCapitalize="words"
              />
              <Text style={styles.helperText}>Separate multiple interests with commas.</Text>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.title}>{stepTitle}</Text>
            <Text style={styles.description}>
              Choose everything that matches how you plan to use BT;WN.
            </Text>
            <View style={styles.optionsContainer}>
              {TRADE_OPTIONS.map((option) => {
                const selected = tradePreferences.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionChip, selected && styles.optionChipSelected]}
                    onPress={() => handleTradeToggle(option)}
                  >
                    <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.helperText}>You can select multiple options.</Text>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.title}>{stepTitle}</Text>
            <Text style={styles.description}>
              Pick a few categories so we can tailor listings to you.
            </Text>
            <View style={styles.optionsContainer}>
              {CATEGORY_OPTIONS.map((option) => {
                const selected = categoryPreferences.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionChip, selected && styles.optionChipSelected]}
                    onPress={() => handleCategoryToggle(option)}
                  >
                    <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.helperText}>Pick at least one so we know what to show you first.</Text>
          </View>
        );
      default:
        return null;
    }
  }, [
    bio,
    categoryPreferences,
    displayName,
    email,
    handleCategoryToggle,
    handleTradeToggle,
    interestsInput,
    pickProfileImage,
    profileImageUri,
    step,
    stepTitle,
    tradePreferences,
  ]);

  if (loadingUser) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Setting things up…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.progressText}>Step {step + 1} of {TOTAL_STEPS}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          {step > 0 ? (
            <TouchableOpacity style={[styles.footerButton, styles.footerSecondary]} onPress={handleBack}>
              <Text style={styles.footerSecondaryText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.footerButtonPlaceholder} />
          )}

          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.footerPrimary,
              (submitting || uploadingImage) && styles.footerButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={submitting || uploadingImage}
          >
            {submitting || uploadingImage ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.footerPrimaryText}>
                {step >= TOTAL_STEPS - 1 ? 'Finish' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  stepContent: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 20,
    lineHeight: 22,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  staticField: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  staticFieldText: {
    fontSize: 16,
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  multilineInput: {
    minHeight: 120,
  },
  helperText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
  },
  imagePicker: {
    alignSelf: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCircle: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d1d5db',
  },
  placeholderInitial: {
    fontSize: 48,
    fontWeight: '700',
    color: '#374151',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionChip: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
    marginBottom: 10,
  },
  optionChipSelected: {
    backgroundColor: '#3b82f6',
  },
  optionChipText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  optionChipTextSelected: {
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: '#f8fafc',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  footerPrimary: {
    backgroundColor: '#2563eb',
  },
  footerPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  footerSecondary: {
    backgroundColor: '#e5e7eb',
  },
  footerSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  footerButtonDisabled: {
    opacity: 0.6,
  },
  footerButtonPlaceholder: {
    flex: 1,
  },
});

export default OnboardingFlow;


