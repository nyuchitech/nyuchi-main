/**
 * 🇿🇼 Nyuchi Africa Platform - Cloudflare Workers API Client
 * 
 * "I am because we are" - Ubuntu philosophy API integration
 * Connects to D1 databases via Cloudflare Workers
 */

import { getPassageToken } from './auth';

// API Configuration
const API_CONFIG = {
  dispatcher: import.meta.env.VITE_API_DISPATCHER_URL || 'https://nyuchi-africa-dispatcher.nyuchitech.workers.dev',
  community: import.meta.env.VITE_API_COMMUNITY_URL || 'https://nyuchi-africa-community.nyuchitech.workers.dev',
  travel: import.meta.env.VITE_API_TRAVEL_URL || 'https://nyuchi-africa-travel.nyuchitech.workers.dev',
} as const;

// Ubuntu API Headers (applied to all requests)
const getUbuntuHeaders = async (includeAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Ubuntu-Philosophy': 'I am because we are',
    'X-Platform': 'Nyuchi Africa Frontend',
    'X-Community-First': 'true',
    'X-African-Context': 'true',
  };

  // Add authentication for protected routes
  if (includeAuth) {
    const token = await getPassageToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic API request handler
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit & { 
    worker?: keyof typeof API_CONFIG;
    requireAuth?: boolean;
    ubuntuContext?: string;
  } = {}
): Promise<T> {
  const { 
    worker = 'dispatcher', 
    requireAuth = false, 
    ubuntuContext = 'general',
    ...fetchOptions 
  } = options;

  const baseUrl = API_CONFIG[worker];
  const url = `${baseUrl}${endpoint}`;
  
  const headers = await getUbuntuHeaders(requireAuth);
  
  // Add Ubuntu context for specific operations
  if (ubuntuContext) {
    headers['X-Ubuntu-Context'] = ubuntuContext;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...headers,
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// D1 Database Operations via Workers
export const database = {
  // Community operations (always free - Ubuntu principle)
  community: {
    async getMembers() {
      return apiRequest('/api/community/members', {
        worker: 'community',
        ubuntuContext: 'community-members',
      });
    },

    async createPost(postData: {
      title: string;
      content: string;
      tags?: string[];
    }) {
      return apiRequest('/api/community/posts', {
        method: 'POST',
        body: JSON.stringify({
          ...postData,
          ubuntu_validated: true,
          community_benefit: true,
        }),
        worker: 'community',
        ubuntuContext: 'community-post-creation',
      });
    },

    async getSuccessStories() {
      return apiRequest('/api/community/success-stories', {
        worker: 'community',
        ubuntuContext: 'success-stories',
      });
    },
  },

  // Business operations (require authentication)
  business: {
    async getDashboard() {
      return apiRequest('/api/dashboard', {
        requireAuth: true,
        ubuntuContext: 'business-dashboard',
      });
    },

    async getUserProfile() {
      return apiRequest('/api/user/profile', {
        requireAuth: true,
        ubuntuContext: 'user-profile',
      });
    },

    async updateProfile(profileData: Record<string, any>) {
      return apiRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
        requireAuth: true,
        ubuntuContext: 'profile-update',
      });
    },
  },

  // Travel platform operations
  travel: {
    async getBookings() {
      return apiRequest('/api/bookings', {
        worker: 'travel',
        requireAuth: true,
        ubuntuContext: 'travel-bookings',
      });
    },

    async createBooking(bookingData: Record<string, any>) {
      return apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
        worker: 'travel',
        requireAuth: true,
        ubuntuContext: 'travel-booking-creation',
      });
    },
  },
};

// File upload to R2 Storage via Workers
export async function uploadToR2(
  file: File,
  bucket: 'community-assets' | 'success-stories' | 'user-uploads'
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  
  const headers = await getUbuntuHeaders(true);
  delete headers['Content-Type']; // Let browser set multipart boundary

  const response = await fetch(`${API_CONFIG.dispatcher}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

// Real-time data via Server-Sent Events
export function createEventStream(endpoint: string, options: {
  requireAuth?: boolean;
  ubuntuContext?: string;
} = {}) {
  const { requireAuth = false, ubuntuContext = 'real-time' } = options;
  
  return new Promise<EventSource>(async (resolve, reject) => {
    try {
      const headers = await getUbuntuHeaders(requireAuth);
      const url = new URL(`${API_CONFIG.dispatcher}${endpoint}`);
      
      // Add headers as query params for SSE
      Object.entries(headers).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      
      if (ubuntuContext) {
        url.searchParams.set('X-Ubuntu-Context', ubuntuContext);
      }

      const eventSource = new EventSource(url.toString());
      
      eventSource.onopen = () => resolve(eventSource);
      eventSource.onerror = (error) => reject(error);
    } catch (error) {
      reject(error);
    }
  });
}

// Ubuntu-specific error handling
export interface UbuntuApiError {
  code: string;
  message: string;
  ubuntu_message: string;
  philosophy: string;
  community_support: string;
  worker_source?: string;
}

export function handleApiError(error: any): UbuntuApiError {
  return {
    code: 'API_ERROR',
    message: error.message || 'Request failed',
    ubuntu_message: 'Together we can overcome technical challenges',
    philosophy: 'I am because we are',
    community_support: 'Visit /community for help from fellow entrepreneurs',
    worker_source: error.worker || 'unknown',
  };
}