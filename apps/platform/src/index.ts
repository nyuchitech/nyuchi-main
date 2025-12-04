/**
 * 🇿🇼 Nyuchi Platform API
 * "I am because we are" - Main application entry point
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// Routes
import directoryRoutes from './routes/directory';
import contentRoutes from './routes/content';
import ubuntuRoutes from './routes/ubuntu';
import authRoutes from './routes/auth';
import stripeRoutes from './routes/stripe';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';
import communityRoutes from './routes/community';
import travelRoutes from './routes/travel';
import dashboardRoutes from './routes/dashboard';
import getInvolvedRoutes from './routes/get-involved';

/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
  // Secrets
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLIC_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  CLOUDFLARE_AI_GATEWAY_ENDPOINT: string;

  // Bindings
  CACHE: KVNamespace;
  UPLOADS: R2Bucket;
  AI: any;

  // Variables
  ENVIRONMENT: string;
}

/**
 * Create Hono app
 */
const app = new Hono<{ Bindings: Env }>();

/**
 * Global middleware
 */
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: [
      'https://platform.nyuchi.com',
      'https://nyuchi.com',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

/**
 * Health check
 */
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development',
    ubuntu: 'I am because we are',
  });
});

/**
 * Root endpoint
 */
app.get('/', (c) => {
  return c.json({
    name: 'Nyuchi Platform API',
    version: '1.0.0',
    ubuntu: 'I am because we are',
    docs: '/api/docs',
    endpoints: {
      community: '/api/community (public)',
      travel: '/api/travel (public)',
      getInvolved: '/api/get-involved (public)',
      dashboard: '/api/dashboard (authenticated)',
      auth: '/api/auth',
      directory: '/api/directory',
      content: '/api/content',
      ubuntu: '/api/ubuntu',
      stripe: '/api/stripe',
      admin: '/api/admin',
      ai: '/api/ai',
    },
  });
});

/**
 * Mount routes
 * Community, travel, and get-involved routes are public (no auth required) - Ubuntu philosophy
 */
app.route('/api/community', communityRoutes);
app.route('/api/travel', travelRoutes);
app.route('/api/get-involved', getInvolvedRoutes);
app.route('/api/dashboard', dashboardRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/directory', directoryRoutes);
app.route('/api/content', contentRoutes);
app.route('/api/ubuntu', ubuntuRoutes);
app.route('/api/stripe', stripeRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/ai', aiRoutes);

/**
 * 404 handler
 */
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested resource does not exist',
      ubuntu: 'I am because we are',
    },
    404
  );
});

/**
 * Error handler
 */
app.onError((err, c) => {
  console.error('Error:', err);

  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
      ubuntu: 'I am because we are',
    },
    500
  );
});

/**
 * Export for Cloudflare Workers
 */
export default app;
