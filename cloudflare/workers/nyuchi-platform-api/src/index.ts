/**
 * Nyuchi Platform API Gateway
 * Main entry point for all API requests
 *
 * Routes requests and integrates with:
 * - Cloudflare Workflows for durable processes
 * - Queues for background jobs
 * - Service bindings to uploads and notifications workers
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { ApiEnv } from '@nyuchi/workers-shared';

// Routes
import directoryRoutes from './routes/directory';
import contentRoutes from './routes/content';
import stripeRoutes from './routes/stripe';
import pipelineRoutes from './routes/pipeline';
import ubuntuRoutes from './routes/ubuntu';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';
import communityRoutes from './routes/community';
import travelRoutes from './routes/travel';
import dashboardRoutes from './routes/dashboard';
import getInvolvedRoutes from './routes/get-involved';
import workflowRoutes from './routes/workflows';

const app = new Hono<{ Bindings: ApiEnv }>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: [
      'https://platform.nyuchi.com',
      'https://nyuchi.com',
      'https://www.nyuchi.com',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development',
    ubuntu: 'I am because we are',
    version: '2.0.0',
    architecture: 'multi-worker',
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Nyuchi Platform API',
    version: '2.0.0',
    ubuntu: 'I am because we are',
    architecture: {
      type: 'multi-worker',
      workers: [
        'nyuchi-platform-api (this)',
        'nyuchi-platform-workflows',
        'nyuchi-platform-jobs',
        'nyuchi-platform-uploads',
        'nyuchi-platform-notifications',
      ],
    },
    endpoints: {
      community: '/api/community (public)',
      travel: '/api/travel (public)',
      getInvolved: '/api/get-involved (public)',
      dashboard: '/api/dashboard (authenticated)',
      pipeline: '/api/pipeline (role-based)',
      workflows: '/api/workflows (internal)',
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

// Mount routes
app.route('/api/community', communityRoutes);
app.route('/api/travel', travelRoutes);
app.route('/api/get-involved', getInvolvedRoutes);
app.route('/api/pipeline', pipelineRoutes);
app.route('/api/dashboard', dashboardRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/directory', directoryRoutes);
app.route('/api/content', contentRoutes);
app.route('/api/ubuntu', ubuntuRoutes);
app.route('/api/stripe', stripeRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/workflows', workflowRoutes);

// 404 handler
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

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);

  return c.json(
    {
      error: 'Internal Server Error',
      message: c.env.ENVIRONMENT === 'development' ? err.message : 'An error occurred',
      ubuntu: 'I am because we are',
    },
    500
  );
});

export default app;
