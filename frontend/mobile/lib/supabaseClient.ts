import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase URL and key from app.json extra config
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
                    'https://oupfbcetmdonlwcxicka.supabase.co';

const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91cGZiY2V0bWRvbmx3Y3hpY2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDg1MDcsImV4cCI6MjA3NjI4NDUwN30.cvs-NiCJf_wnIGJUvi2i95njCrhfEkI2Avc_-_CNwF8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

