/**
 * 🇿🇼 Nyuchi Africa Platform - Passage ID Authentication
 * 
 * "I am because we are" - Ubuntu philosophy authentication
 * Embedded authentication experience with Passage ID
 */

import Passage from "@passageidentity/passage-node";
import jwt from "jsonwebtoken";
import { redirect } from "react-router";

// Initialize Passage with environment variables
const passage = new Passage({
  appId: process.env.PASSAGE_APP_ID!,
  apiKey: process.env.PASSAGE_API_KEY!,
});

// Decode and format the RSA public key
function getPublicKey(): string {
  const base64Key = process.env.PASSAGE_PUBLIC_KEY!;
  return Buffer.from(base64Key, 'base64').toString('utf-8');
}

// Client-side authentication helpers (browser only)
export async function getPassageUser() {
  if (typeof window !== 'undefined' && (window as any).passage) {
    try {
      return await (window as any).passage.getCurrentUser();
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }
  return null;
}

export async function getPassageToken(): Promise<string | null> {
  const user = await getPassageUser();
  return user?.authToken || null;
}

export async function isUserAuthenticated(): Promise<boolean> {
  const user = await getPassageUser();
  return !!user;
}

// Server-side JWT validation using RSA public key
export async function validateJwtToken(token: string): Promise<any | null> {
  try {
    const publicKey = getPublicKey();
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: `https://auth.passage.id/v1/apps/${process.env.PASSAGE_APP_ID}`,
      audience: process.env.PASSAGE_APP_ID,
    });
    return decoded;
  } catch (error) {
    console.error('JWT validation failed:', error);
    return null;
  }
}

// Server-side authentication for Remix loaders and actions
export async function authenticateRequest(request: Request): Promise<string | null> {
  try {
    // Get JWT from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;
    
    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.replace('Bearer ', '');
    if (!token) return null;
    
    // Method 1: Use Passage SDK validation (recommended)
    try {
      const userId = await passage.auth.validateJwt(token);
      return userId;
    } catch (passageError) {
      console.warn('Passage SDK validation failed, trying manual validation:', passageError);
    }
    
    // Method 2: Manual JWT validation with RSA public key (fallback)
    const decoded = await validateJwtToken(token);
    if (decoded && decoded.sub) {
      return decoded.sub; // 'sub' claim contains the user ID
    }
    
    return null;
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

// Get authenticated user data from request (for Remix loaders)
export async function getAuthenticatedUser(request: Request) {
  const userId = await authenticateRequest(request);
  if (!userId) return null;
  
  // Try to get user data from JWT first (faster)
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const userFromToken = await getUserFromToken(token);
    if (userFromToken) return userFromToken;
  }
  
  // Fallback to Passage API
  return await getPassageUserData(userId);
}

// Middleware for protected routes (Ubuntu principle: community routes are always free)
export async function requireAuth(request: Request) {
  const url = new URL(request.url);
  
  // Ubuntu principle: Community features are always accessible
  if (url.pathname.startsWith('/community')) {
    return null; // No auth required for community routes
  }
  
  // Business routes require authentication
  const userId = await authenticateRequest(request);
  if (!userId) {
    throw redirect('/auth/signin');
  }
  return userId;
}

// Extract user information from JWT claims
export async function getUserFromToken(token: string) {
  try {
    const decoded = await validateJwtToken(token);
    if (!decoded) return null;
    
    return {
      id: decoded.sub,
      email: decoded.email,
      phone: decoded.phone,
      app_id: decoded.aud,
      issued_at: new Date(decoded.iat * 1000),
      expires_at: new Date(decoded.exp * 1000),
      // Ubuntu context
      philosophy: 'I am because we are',
      community_member: true,
      african_entrepreneur: true,
    };
  } catch (error) {
    console.error('Failed to extract user from token:', error);
    return null;
  }
}

// User management functions (fetch from Passage API)
export async function getPassageUserData(userId: string) {
  try {
    const user = await passage.user.get(userId);
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      // Ubuntu context
      philosophy: 'I am because we are',
      community_member: true,
      african_entrepreneur: true,
    };
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
}

// Logout function
export async function signOut() {
  if (typeof window !== 'undefined' && (window as any).passage) {
    try {
      await (window as any).passage.signOut();
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }
}

// Ubuntu error handling
export interface UbuntuAuthError {
  code: string;
  message: string;
  ubuntu_message: string;
  philosophy: string;
  community_support: string;
}

export function createUbuntuAuthError(error: any): UbuntuAuthError {
  return {
    code: 'AUTH_ERROR',
    message: error.message || 'Authentication failed',
    ubuntu_message: 'Together we can overcome this challenge',
    philosophy: 'I am because we are',
    community_support: 'Visit /community for help and support from fellow entrepreneurs',
  };
}

/**
 * Generic auth handler for Passage ID authentication routes
 * Handles both GET and POST requests for authentication
 */
export async function handleAuth(request: Request) {
  const url = new URL(request.url);
  
  try {
    if (request.method === 'GET') {
      // Handle authentication callback or status check
      const authHeader = request.headers.get('Authorization');
      
      if (authHeader) {
        const user = await getAuthenticatedUser(request);
        if (user) {
          // Redirect authenticated users to dashboard
          return redirect('/');
        }
      }
      
      // Redirect unauthenticated users to sign in
      return redirect('/auth/signin');
    }
    
    if (request.method === 'POST') {
      // Handle authentication action (e.g., token exchange)
      const formData = await request.formData();
      const token = formData.get('token') as string;
      
      if (token) {
        const decoded = await validateJwtToken(token);
        if (decoded) {
          // Set authentication headers and redirect
          const headers = new Headers();
          headers.set('Authorization', `Bearer ${token}`);
          
          return new Response(null, {
            status: 302,
            headers: {
              ...Object.fromEntries(headers),
              'Location': '/',
              'X-Ubuntu-Message': 'Welcome to the Ubuntu community - I am because we are',
            },
          });
        }
      }
      
      // Invalid token or missing data
      return redirect('/auth/error');
    }
    
    // Unsupported method
    return new Response('Method not allowed', { status: 405 });
    
  } catch (error) {
    console.error('Ubuntu auth handler error:', error);
    const ubuntuError = createUbuntuAuthError(error);
    
    return new Response(JSON.stringify(ubuntuError), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Ubuntu-Philosophy': 'I am because we are',
      },
    });
  }
}