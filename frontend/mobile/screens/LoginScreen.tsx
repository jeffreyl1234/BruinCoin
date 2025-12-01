import { StyleSheet, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

interface LoginScreenProps {
  onLogin: (result: { username?: string }) => void;
  onBack?: () => void;
}

// Validate ucla.edu email
const isValidUclaEmail = (email: string): boolean => {
  return (
    email.toLowerCase().endsWith('@ucla.edu') ||
    email.toLowerCase().endsWith('@g.ucla.edu')
  );
};

export default function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate email format
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate ucla.edu email
    if (!isValidUclaEmail(email)) {
      Alert.alert('Error', 'Please use a @ucla.edu email address');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        Alert.alert('Login Error', error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Verify user exists in public.users table
        const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';
        const userCheckResponse = await fetch(`${apiUrl}/api/users/${data.user.id}`);
        
        if (userCheckResponse.status === 404) {
          // User doesn't exist in public.users - sign them out and prevent login
          await supabase.auth.signOut();
          Alert.alert(
            'Account Not Found',
            'Your account was not found in our system. Please register to create an account.',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }
        
        if (!userCheckResponse.ok) {
          // Error checking user - sign them out for safety
          await supabase.auth.signOut();
          Alert.alert(
            'Error',
            'Unable to verify your account. Please try again or contact support.',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }

        // User exists in public.users - get username for welcome back screen
        const userDataResponse = await fetch(`${apiUrl}/api/users/${data.user.id}`);
        let username = '';
        if (userDataResponse.ok) {
          const userData = await userDataResponse.json();
          if (userData.user?.user_name) {
            username = userData.user.user_name;
          }
        }

        onLogin({ username });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Log in</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>
          
          <TextInput
            style={styles.input}
            placeholder="UCLA Email Address"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Log in'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  passwordContainer: {
    marginBottom: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
