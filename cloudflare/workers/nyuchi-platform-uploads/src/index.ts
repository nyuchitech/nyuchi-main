/**
 * Nyuchi Platform Uploads Worker
 * R2 file upload handling with presigned URLs
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { UploadsEnv } from '@nyuchi/workers-shared';
import { createServiceClient, isValidUUID } from '@nyuchi/workers-shared';

interface Env extends UploadsEnv {
  R2_PUBLIC_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use('*', cors({
  origin: [
    'https://platform.nyuchi.com',
    'https://nyuchi.com',
    'http://localhost:3000',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Upload-Token'],
}));

// Allowed content types
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/webm',
]);

// Max file sizes by type (in bytes)
const MAX_SIZES: Record<string, number> = {
  'image/': 10 * 1024 * 1024,    // 10MB for images
  'video/': 100 * 1024 * 1024,   // 100MB for videos
  'application/pdf': 20 * 1024 * 1024, // 20MB for PDFs
};

function getMaxSize(contentType: string): number {
  for (const [prefix, size] of Object.entries(MAX_SIZES)) {
    if (contentType.startsWith(prefix)) {
      return size;
    }
  }
  return 5 * 1024 * 1024; // 5MB default
}

// Verify token from API worker
async function verifyUploadToken(env: Env, token: string): Promise<{ userId: string; bucket: string } | null> {
  const data = await env.CACHE.get(`upload-token:${token}`);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * POST /request-upload - Request upload URL
 * Called from API worker to generate upload token
 */
app.post('/request-upload', async (c) => {
  try {
    const { userId, bucket, filename, contentType, size } = await c.req.json();

    if (!userId || !bucket || !filename || !contentType) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate content type
    if (!ALLOWED_TYPES.has(contentType)) {
      return c.json({ error: 'File type not allowed' }, 400);
    }

    // Validate size
    const maxSize = getMaxSize(contentType);
    if (size && size > maxSize) {
      return c.json({ error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` }, 400);
    }

    // Generate upload token
    const token = crypto.randomUUID();
    const key = `${userId}/${Date.now()}-${filename}`;

    // Store token with 1 hour expiry
    await c.env.CACHE.put(
      `upload-token:${token}`,
      JSON.stringify({ userId, bucket, key, contentType }),
      { expirationTtl: 3600 }
    );

    return c.json({
      uploadUrl: `${c.env.R2_PUBLIC_URL}/upload/${token}`,
      token,
      key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Request upload error:', error);
    return c.json({ error: 'Failed to create upload URL' }, 500);
  }
});

/**
 * PUT /upload/:token - Direct file upload
 */
app.put('/upload/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const tokenData = await verifyUploadToken(c.env, token);

    if (!tokenData) {
      return c.json({ error: 'Invalid or expired upload token' }, 401);
    }

    const { userId, bucket, key, contentType } = tokenData as {
      userId: string;
      bucket: string;
      key: string;
      contentType: string;
    };

    // Get the appropriate bucket
    let r2Bucket: R2Bucket;
    switch (bucket) {
      case 'uploads':
        r2Bucket = c.env.UPLOADS;
        break;
      case 'community':
        r2Bucket = c.env.COMMUNITY_ASSETS;
        break;
      case 'media':
        r2Bucket = c.env.MEDIA;
        break;
      default:
        r2Bucket = c.env.UPLOADS;
    }

    // Get file body
    const body = await c.req.arrayBuffer();

    // Check size
    const maxSize = getMaxSize(contentType);
    if (body.byteLength > maxSize) {
      return c.json({ error: `File too large. Max: ${maxSize / 1024 / 1024}MB` }, 400);
    }

    // Upload to R2
    await r2Bucket.put(key, body, {
      httpMetadata: {
        contentType,
      },
      customMetadata: {
        userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Invalidate token
    await c.env.CACHE.delete(`upload-token:${token}`);

    // Build public URL
    const publicUrl = `${c.env.R2_PUBLIC_URL}/${bucket}/${key}`;

    return c.json({
      success: true,
      key,
      url: publicUrl,
      size: body.byteLength,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

/**
 * GET /:bucket/:key+ - Serve files
 */
app.get('/:bucket/:key{.+}', async (c) => {
  try {
    const bucket = c.req.param('bucket');
    const key = c.req.param('key');

    let r2Bucket: R2Bucket;
    switch (bucket) {
      case 'uploads':
        r2Bucket = c.env.UPLOADS;
        break;
      case 'community':
        r2Bucket = c.env.COMMUNITY_ASSETS;
        break;
      case 'media':
        r2Bucket = c.env.MEDIA;
        break;
      default:
        return c.json({ error: 'Invalid bucket' }, 400);
    }

    const object = await r2Bucket.get(key);

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    headers.set('ETag', object.httpEtag);

    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Serve error:', error);
    return c.json({ error: 'Failed to serve file' }, 500);
  }
});

/**
 * DELETE /:bucket/:key+ - Delete file (internal)
 */
app.delete('/:bucket/:key{.+}', async (c) => {
  try {
    // This endpoint should only be called internally
    const authHeader = c.req.header('X-Internal-Auth');
    if (authHeader !== c.env.SUPABASE_SERVICE_ROLE_KEY) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bucket = c.req.param('bucket');
    const key = c.req.param('key');

    let r2Bucket: R2Bucket;
    switch (bucket) {
      case 'uploads':
        r2Bucket = c.env.UPLOADS;
        break;
      case 'community':
        r2Bucket = c.env.COMMUNITY_ASSETS;
        break;
      case 'media':
        r2Bucket = c.env.MEDIA;
        break;
      default:
        return c.json({ error: 'Invalid bucket' }, 400);
    }

    await r2Bucket.delete(key);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

/**
 * GET /list/:bucket - List files (admin)
 */
app.get('/list/:bucket', async (c) => {
  try {
    const bucket = c.req.param('bucket');
    const prefix = c.req.query('prefix') || '';
    const limit = parseInt(c.req.query('limit') || '100');

    let r2Bucket: R2Bucket;
    switch (bucket) {
      case 'uploads':
        r2Bucket = c.env.UPLOADS;
        break;
      case 'community':
        r2Bucket = c.env.COMMUNITY_ASSETS;
        break;
      case 'media':
        r2Bucket = c.env.MEDIA;
        break;
      default:
        return c.json({ error: 'Invalid bucket' }, 400);
    }

    const list = await r2Bucket.list({ prefix, limit });

    return c.json({
      objects: list.objects.map((obj) => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
      })),
      truncated: list.truncated,
      cursor: list.cursor,
    });
  } catch (error) {
    console.error('List error:', error);
    return c.json({ error: 'Failed to list files' }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'nyuchi-platform-uploads',
    timestamp: new Date().toISOString(),
  });
});

export default app;
