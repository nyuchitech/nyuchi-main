/**
 * Shared environment bindings for Nyuchi Platform Workers
 */

// Queue message types
export interface QueueMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  retryCount?: number;
}

// Workflow event types
export interface WorkflowPayload {
  userId: string;
  [key: string]: unknown;
}

/**
 * Base environment bindings shared across all workers
 */
export interface BaseEnv {
  // Secrets
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Variables
  ENVIRONMENT: 'development' | 'production';
}

/**
 * API Worker environment
 */
export interface ApiEnv extends BaseEnv {
  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLIC_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;

  // AI
  CLOUDFLARE_AI_GATEWAY_ENDPOINT: string;
  AI_GATEWAY_TOKEN: string;

  // Bindings
  CACHE: KVNamespace;
  AI: Ai;

  // Service bindings to other workers
  WORKFLOWS: Fetcher;
  UPLOADS: Fetcher;
  NOTIFICATIONS: Fetcher;

  // Queues (producers)
  JOBS_QUEUE: Queue<QueueMessage>;
  NOTIFICATIONS_QUEUE: Queue<QueueMessage>;
}

/**
 * Workflows Worker environment
 */
export interface WorkflowsEnv extends BaseEnv {
  // Stripe for payment verification
  STRIPE_SECRET_KEY: string;

  // Queue producers
  JOBS_QUEUE: Queue<QueueMessage>;
  NOTIFICATIONS_QUEUE: Queue<QueueMessage>;
}

/**
 * Jobs Worker environment (queue consumer)
 */
export interface JobsEnv extends BaseEnv {
  // KV for caching/deduplication
  CACHE: KVNamespace;
}

/**
 * Uploads Worker environment
 */
export interface UploadsEnv extends BaseEnv {
  // R2 buckets
  UPLOADS: R2Bucket;
  COMMUNITY_ASSETS: R2Bucket;
  MEDIA: R2Bucket;

  // KV for signed URL tracking
  CACHE: KVNamespace;
}

/**
 * Notifications Worker environment
 */
export interface NotificationsEnv extends BaseEnv {
  // Email service
  RESEND_API_KEY: string;

  // KV for rate limiting
  CACHE: KVNamespace;
}
