/**
 * Cloudflare D1 Database Integration Examples
 * 
 * Complete patterns for connecting Remix frontend to Cloudflare Workers with D1
 */

// ========================================
// ENVIRONMENT VARIABLES REQUIRED
// ========================================

/*
# Frontend (.env.local)
VITE_API_DISPATCHER_URL=https://nyuchi-africa-dispatcher.nyuchitech.workers.dev
VITE_PASSAGE_APP_ID=Lnv7cRQrfjdrD34CsTozgUu9
PASSAGE_API_KEY=your_passage_api_key
PASSAGE_PUBLIC_KEY=LS0tLS1CRUdJTi...  # Base64 RSA public key

# Cloudflare Workers (wrangler.toml)
[env.production.vars]
PASSAGE_APP_ID = "Lnv7cRQrfjdrD34CsTozgUu9"
UBUNTU_PLATFORM = "true"
COMMUNITY_ALWAYS_FREE = "true"

[[env.production.d1_databases]]
binding = "NY_PLATFORM_DB"
database_name = "nyuchi-platform-prod"
database_id = "your-d1-database-id"

[[env.production.r2_buckets]]
binding = "NY_COMMUNITY_ASSETS"
bucket_name = "nyuchi-community-assets"
*/

// ========================================
// 1. COMPLETE CLOUDFLARE WORKER EXAMPLE
// ========================================

export const cloudflareWorkerExample = `
// workers/dispatcher/src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  NY_PLATFORM_DB: D1Database;
  NY_COMMUNITY_ASSETS: R2Bucket;
  PASSAGE_APP_ID: string;
  UBUNTU_PLATFORM: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors({
  origin: ['https://platform.nyuchi.com', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Ubuntu-Context', 'X-Tenant-ID'],
}));

// Community Routes (Always Free - Ubuntu Principle)
app.get('/api/community/members', async (c) => {
  const members = await c.env.NY_PLATFORM_DB
    .prepare(\`
      SELECT id, name, joined_date, ubuntu_contributions, location 
      FROM community_members 
      WHERE active = 1 
      ORDER BY ubuntu_contributions DESC
    \`)
    .all();

  return c.json({
    members: members.results,
    total: members.results.length,
    ubuntu_message: 'Together we achieve more - I am because we are',
    philosophy: 'Community knowledge belongs to everyone',
  });
});

app.post('/api/community/posts', async (c) => {
  const body = await c.req.json();
  
  const result = await c.env.NY_PLATFORM_DB
    .prepare(\`
      INSERT INTO community_posts (title, content, author_name, ubuntu_principle, created_at) 
      VALUES (?, ?, ?, ?, ?)
    \`)
    .bind(
      body.title,
      body.content,
      body.author_name || 'Ubuntu Community Member',
      'I am because we are',
      new Date().toISOString()
    )
    .run();

  return c.json({
    success: true,
    id: result.meta.last_row_id,
    ubuntu_message: 'Your story strengthens our entire community',
  });
});

// Business Routes (Require Authentication)
app.use('/api/business/*', async (c, next) => {
  // Authentication middleware for business routes
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  // Validate JWT with Passage (simplified)
  const token = authHeader.replace('Bearer ', '');
  try {
    // Add your JWT validation logic here
    const decoded = await validatePassageJWT(token, c.env.PASSAGE_APP_ID);
    c.set('userID', decoded.sub);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

app.get('/api/business/dashboard', async (c) => {
  const userID = c.get('userID');
  
  const [metrics, profile] = await Promise.all([
    c.env.NY_PLATFORM_DB
      .prepare('SELECT * FROM business_metrics WHERE user_id = ?')
      .bind(userID)
      .first(),
    
    c.env.NY_PLATFORM_DB
      .prepare('SELECT * FROM business_profiles WHERE user_id = ?')
      .bind(userID)
      .first()
  ]);

  return c.json({
    metrics: metrics || { revenue: 0, customers: 0, projects: 0 },
    profile: profile,
    ubuntu_context: 'Individual success strengthens community prosperity',
  });
});

app.put('/api/business/profile', async (c) => {
  const userID = c.get('userID');
  const body = await c.req.json();
  
  const result = await c.env.NY_PLATFORM_DB
    .prepare(\`
      INSERT OR REPLACE INTO business_profiles 
      (user_id, name, business_type, location, updated_at) 
      VALUES (?, ?, ?, ?, ?)
    \`)
    .bind(userID, body.name, body.business_type, body.location, new Date().toISOString())
    .run();

  return c.json({
    success: true,
    updated: result.changes > 0,
    ubuntu_message: 'Your growth contributes to our collective strength',
  });
});

// File Upload to R2
app.post('/api/assets/upload', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  const bucket = formData.get('bucket') || 'community';
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }

  const key = \`\${bucket}/\${Date.now()}-\${file.name}\`;
  
  await c.env.NY_COMMUNITY_ASSETS.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: {
      uploadedBy: c.get('userID') || 'community',
      ubuntu: 'true',
    }
  });

  const url = \`https://community-assets.nyuchi.com/\${key}\`;
  
  return c.json({
    success: true,
    url,
    key,
    ubuntu_message: 'Shared resources strengthen our community',
  });
});

export default app;
`;

// ========================================
// 2. D1 DATABASE SCHEMA
// ========================================

export const d1Schema = `
-- Community Tables (Always accessible)
CREATE TABLE IF NOT EXISTS community_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  location TEXT,
  joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  ubuntu_contributions INTEGER DEFAULT 0,
  bio TEXT,
  skills TEXT, -- JSON array of skills
  active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS community_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT,
  ubuntu_principle TEXT DEFAULT 'I am because we are',
  tags TEXT, -- JSON array of tags
  likes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_discussions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic TEXT NOT NULL,
  description TEXT,
  starter_name TEXT,
  participant_count INTEGER DEFAULT 1,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  ubuntu_focus TEXT, -- Community benefit focus
  status TEXT DEFAULT 'active' -- active, resolved, archived
);

-- Business Tables (Require authentication)
CREATE TABLE IF NOT EXISTS business_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE, -- Passage ID
  name TEXT NOT NULL,
  business_name TEXT,
  business_type TEXT,
  location TEXT,
  email TEXT,
  phone TEXT,
  description TEXT,
  website TEXT,
  tenant_id TEXT DEFAULT 'nyuchi-africa',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  revenue DECIMAL(12,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'ZAR',
  customers INTEGER DEFAULT 0,
  projects INTEGER DEFAULT 0,
  employees INTEGER DEFAULT 1,
  month_year TEXT, -- Format: 'YYYY-MM'
  ubuntu_impact_score INTEGER DEFAULT 0, -- Community benefit metric
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS success_stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  business_impact TEXT,
  community_impact TEXT,
  media_urls TEXT, -- JSON array of R2 URLs
  featured BOOLEAN DEFAULT 0,
  ubuntu_principle_demonstrated TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_members_active ON community_members(active);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_user_id_month ON business_metrics(user_id, month_year);
`;

// ========================================  
// 3. REMIX FRONTEND API CLIENT USAGE
// ========================================

export const remixUsageExamples = `
// In a Remix route file (app/routes/community.tsx)
import { database, files, handleApiError } from '~/lib/api';

export async function loader() {
  try {
    // Community data is always accessible (no auth required)
    const [members, posts, discussions] = await Promise.all([
      database.community.getMembers(),
      database.community.getPosts(),
      database.community.getDiscussions(),
    ]);

    return {
      members,
      posts,  
      discussions,
      ubuntu_message: 'Welcome to our Ubuntu community - together we are stronger'
    };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}

export async function action({ request }) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  try {
    switch (intent) {
      case 'create_post': {
        const result = await database.community.createPost({
          title: formData.get('title'),
          content: formData.get('content'),
          author_name: formData.get('author_name'),
        });
        
        return { success: true, post: result };
      }
      
      case 'upload_story_media': {
        const file = formData.get('file') as File;
        const result = await files.upload(file, 'community-stories');
        
        return { success: true, media_url: result.url };
      }
      
      default:
        return { error: 'Invalid action' };
    }
  } catch (error) {
    return { error: handleApiError(error) };
  }
}

// For authenticated business routes (app/routes/business.dashboard.tsx)
export async function loader({ request }) {
  try {
    // This route requires authentication
    await requireAuth(request);
    
    const [dashboard, profile] = await Promise.all([
      database.business.getDashboard(),
      database.business.getProfile(),
    ]);

    return { dashboard, profile };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}
`;

// This is a documentation file - not meant to be executed
export default function CloudflareDatabaseGuide() {
  return null;
}