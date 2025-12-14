/**
 * Help Scout API Client
 * OAuth2 authentication with automatic token refresh
 */

interface HelpScoutTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface HelpScoutEnv {
  HELPSCOUT_CLIENT_ID: string;
  HELPSCOUT_CLIENT_SECRET: string;
  HELPSCOUT_API_BASE: string;
  CACHE: KVNamespace;
}

const TOKEN_KEY = 'helpscout:tokens';

/**
 * Get or refresh Help Scout access token
 */
export async function getAccessToken(env: HelpScoutEnv): Promise<string> {
  // Check cached token
  const cached = await env.CACHE.get(TOKEN_KEY);

  if (cached) {
    const tokens: HelpScoutTokens = JSON.parse(cached);

    // If token is still valid (with 5 min buffer), use it
    if (tokens.expiresAt > Date.now() + 5 * 60 * 1000) {
      return tokens.accessToken;
    }

    // Token expired, try to refresh
    if (tokens.refreshToken) {
      try {
        const newTokens = await refreshTokens(env, tokens.refreshToken);
        await cacheTokens(env, newTokens);
        return newTokens.accessToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Fall through to get new token
      }
    }
  }

  // Get new token using client credentials
  const tokens = await getClientCredentialsToken(env);
  await cacheTokens(env, tokens);
  return tokens.accessToken;
}

/**
 * Get token using Client Credentials flow
 */
async function getClientCredentialsToken(env: HelpScoutEnv): Promise<HelpScoutTokens> {
  const response = await fetch('https://api.helpscout.net/v2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: env.HELPSCOUT_CLIENT_ID,
      client_secret: env.HELPSCOUT_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Help Scout token: ${error}`);
  }

  const data = await response.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || '',
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Refresh tokens
 */
async function refreshTokens(env: HelpScoutEnv, refreshToken: string): Promise<HelpScoutTokens> {
  const response = await fetch('https://api.helpscout.net/v2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: env.HELPSCOUT_CLIENT_ID,
      client_secret: env.HELPSCOUT_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Cache tokens in KV
 */
async function cacheTokens(env: HelpScoutEnv, tokens: HelpScoutTokens): Promise<void> {
  // Cache for slightly less than expiry time
  const ttl = Math.floor((tokens.expiresAt - Date.now()) / 1000) - 60;

  await env.CACHE.put(TOKEN_KEY, JSON.stringify(tokens), {
    expirationTtl: Math.max(ttl, 60),
  });
}

/**
 * Make authenticated request to Help Scout API
 */
export async function helpScoutRequest<T>(
  env: HelpScoutEnv,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken(env);

  const response = await fetch(`${env.HELPSCOUT_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Help Scout API error (${response.status}): ${error}`);
  }

  // Handle 201 Created responses
  if (response.status === 201) {
    return {
      id: response.headers.get('Resource-ID'),
      location: response.headers.get('Location'),
      webLocation: response.headers.get('Web-Location'),
    } as T;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Convenience methods

export interface HelpScoutCustomer {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface HelpScoutThread {
  type: 'customer' | 'reply' | 'note';
  customer?: { email: string };
  user?: number;
  text: string;
  attachments?: Array<{
    fileName: string;
    mimeType: string;
    data: string; // base64
  }>;
}

export interface CreateConversationRequest {
  subject: string;
  customer: HelpScoutCustomer;
  mailboxId: number;
  type: 'email' | 'phone' | 'chat';
  status: 'active' | 'pending' | 'closed';
  threads: HelpScoutThread[];
  tags?: string[];
  customFields?: Array<{
    id: number;
    value: string;
  }>;
}

export interface CreateConversationResponse {
  id: string;
  location: string;
  webLocation: string;
}

/**
 * Create a new conversation in Help Scout
 */
export async function createConversation(
  env: HelpScoutEnv,
  data: CreateConversationRequest
): Promise<CreateConversationResponse> {
  return helpScoutRequest<CreateConversationResponse>(env, '/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get conversation by ID
 */
export async function getConversation(
  env: HelpScoutEnv,
  conversationId: string
): Promise<{ id: number; status: string; subject: string; threads: unknown[] }> {
  return helpScoutRequest(env, `/conversations/${conversationId}?embed=threads`);
}

/**
 * Add a reply to a conversation
 */
export async function addReply(
  env: HelpScoutEnv,
  conversationId: string,
  text: string,
  userId?: number
): Promise<void> {
  await helpScoutRequest(env, `/conversations/${conversationId}/reply`, {
    method: 'POST',
    body: JSON.stringify({
      text,
      user: userId,
    }),
  });
}

/**
 * Add a note to a conversation
 */
export async function addNote(
  env: HelpScoutEnv,
  conversationId: string,
  text: string,
  userId?: number
): Promise<void> {
  await helpScoutRequest(env, `/conversations/${conversationId}/notes`, {
    method: 'POST',
    body: JSON.stringify({
      text,
      user: userId,
    }),
  });
}

/**
 * Update conversation tags
 */
export async function updateTags(
  env: HelpScoutEnv,
  conversationId: string,
  tags: string[]
): Promise<void> {
  await helpScoutRequest(env, `/conversations/${conversationId}/tags`, {
    method: 'PUT',
    body: JSON.stringify({ tags }),
  });
}

/**
 * Get or create customer by email
 */
export async function getOrCreateCustomer(
  env: HelpScoutEnv,
  customer: HelpScoutCustomer
): Promise<{ id: number }> {
  // Search for existing customer
  const searchResult = await helpScoutRequest<{
    _embedded?: { customers?: Array<{ id: number }> };
  }>(env, `/customers?email=${encodeURIComponent(customer.email)}`);

  if (searchResult._embedded?.customers?.length) {
    return { id: searchResult._embedded.customers[0].id };
  }

  // Create new customer
  return helpScoutRequest(env, '/customers', {
    method: 'POST',
    body: JSON.stringify({
      emails: [{ type: 'work', value: customer.email }],
      firstName: customer.firstName,
      lastName: customer.lastName,
      phones: customer.phone ? [{ type: 'work', value: customer.phone }] : undefined,
    }),
  });
}

/**
 * List mailboxes
 */
export async function listMailboxes(
  env: HelpScoutEnv
): Promise<Array<{ id: number; name: string; email: string }>> {
  const result = await helpScoutRequest<{
    _embedded: { mailboxes: Array<{ id: number; name: string; email: string }> };
  }>(env, '/mailboxes');

  return result._embedded.mailboxes;
}
