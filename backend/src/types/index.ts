// Basic types for BruinCoin API

export interface User {
  id: string;
  email: string;
  name: string;
  major?: string;
  year?: string;
  bio?: string;
  profile_picture?: string;
  rating: number;
  total_trades: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  type: 'request' | 'offer';
  category: 'academic' | 'transportation' | 'food' | 'items' | 'services';
  title: string;
  description: string;
  location: string;
  time_available?: string;
  images: string[];
  status: 'active' | 'completed' | 'cancelled';
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
