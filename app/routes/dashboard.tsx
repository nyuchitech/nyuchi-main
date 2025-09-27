/**
 * D1 Database Integration Patterns for Nyuchi Platform
 * 
 * This file demonstrates how to connect to D1 databases via Cloudflare Workers
 * using the Ubuntu philosophy: Community features are always free and accessible
 */

// ========================================
// 1. LOADER PATTERN: Fetching D1 Data
// ========================================

/*
export async function loader({ request }: Route.LoaderArgs) {
  try {
    // Community routes bypass authentication (Ubuntu principle)
    const url = new URL(request.url);
    if (url.pathname.startsWith('/community')) {
      // Direct access to community data via Workers API
      const response = await fetch(`${import.meta.env.VITE_API_DISPATCHER_URL}/api/community/members`, {
        headers: { 'X-Ubuntu-Context': 'community-first' }
      });
      return response.json();
    }
    
    // Business features require authentication
    await requireAuth(request);
    const user = await getAuthenticatedUser(request);
    
    // Authenticated D1 operations via Workers
    const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const [dashboardData, communityStats] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_DISPATCHER_URL}/api/business/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Ubuntu-Context': 'authenticated-user',
          'X-Tenant-ID': 'nyuchi-africa'
        }
      }).then(res => res.json()),
      
      // Community data always accessible even for business users
      fetch(`${import.meta.env.VITE_API_DISPATCHER_URL}/api/community/stats`, {
        headers: { 'X-Ubuntu-Context': 'community-first' }
      }).then(res => res.json())
    ]);

    return {
      user,
      dashboard: dashboardData,
      community: communityStats,
      ubuntu_context: { philosophy: 'I am because we are' }
    };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}
*/

// ========================================
// 2. ACTION PATTERN: Mutating D1 Data  
// ========================================

/*
export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const intent = formData.get('intent') as string;
    
    switch (intent) {
      case 'create_community_post': {
        // Community posts don't require auth (Ubuntu principle)
        const postData = {
          title: formData.get('title') as string,
          content: formData.get('content') as string,
          ubuntu_principle: 'I am because we are'
        };
        
        const response = await fetch(`${import.meta.env.VITE_API_DISPATCHER_URL}/api/community/posts`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Ubuntu-Context': 'community-first'
          },
          body: JSON.stringify(postData)
        });
        
        return response.json();
      }
      
      case 'update_business_profile': {
        // Business operations require authentication
        await requireAuth(request);
        const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');
        
        const profileData = {
          name: formData.get('name') as string,
          business_type: formData.get('business_type') as string,
          location: formData.get('location') as string
        };
        
        const response = await fetch(`${import.meta.env.VITE_API_DISPATCHER_URL}/api/business/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'X-Ubuntu-Context': 'authenticated-user',
            'X-Tenant-ID': 'nyuchi-africa'
          },
          body: JSON.stringify(profileData)
        });
        
        return response.json();
      }
      
      default:
        return { error: 'Invalid action' };
    }
  } catch (error) {
    return { error: handleApiError(error) };
  }
}
*/

// ========================================
// 3. CLOUDFLARE WORKERS BACKEND PATTERNS
// ========================================

/*
// In your Cloudflare Worker (workers/dispatcher/src/index.ts):

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Community endpoints bypass authentication (Ubuntu principle)
    if (url.pathname.startsWith('/api/community/')) {
      return handleCommunityRequest(request, env);
    }
    
    // Business endpoints require authentication
    const authResult = await passageAuthMiddleware(request, env);
    if (!authResult.success) {
      return new Response('Authentication required', { status: 401 });
    }
    
    return handleBusinessRequest(request, env);
  }
};

// Community D1 operations (always accessible)
async function handleCommunityRequest(request: Request, env: Env) {
  const url = new URL(request.url);
  
  switch (true) {
    case url.pathname === '/api/community/members':
      const members = await env.NY_PLATFORM_DB
        .prepare('SELECT name, joined_date, ubuntu_contributions FROM community_members WHERE active = 1')
        .all();
      
      return new Response(JSON.stringify({
        members: members.results,
        ubuntu_message: 'Together we achieve more',
        philosophy: 'I am because we are'
      }));
      
    case url.pathname === '/api/community/posts':
      if (request.method === 'POST') {
        const postData = await request.json();
        const result = await env.NY_PLATFORM_DB
          .prepare('INSERT INTO community_posts (title, content, ubuntu_principle, created_at) VALUES (?, ?, ?, ?)')
          .bind(postData.title, postData.content, postData.ubuntu_principle, new Date().toISOString())
          .run();
          
        return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }));
      }
      break;
  }
}

// Business D1 operations (require authentication)
async function handleBusinessRequest(request: Request, env: Env) {
  const userID = request.userID; // Set by authentication middleware
  const url = new URL(request.url);
  
  switch (true) {
    case url.pathname === '/api/business/dashboard':
      const dashboard = await env.NY_PLATFORM_DB
        .prepare('SELECT revenue, customers, projects FROM business_metrics WHERE user_id = ?')
        .bind(userID)
        .first();
        
      return new Response(JSON.stringify(dashboard));
      
    case url.pathname === '/api/business/profile':
      if (request.method === 'PUT') {
        const profileData = await request.json();
        const result = await env.NY_PLATFORM_DB
          .prepare('UPDATE business_profiles SET name = ?, business_type = ?, location = ? WHERE user_id = ?')
          .bind(profileData.name, profileData.business_type, profileData.location, userID)
          .run();
          
        return new Response(JSON.stringify({ success: true, updated: result.changes }));
      }
      break;
  }
}
*/

// ========================================
// 4. D1 SCHEMA EXAMPLES
// ========================================

/*
-- Community Tables (Always accessible)
CREATE TABLE community_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  ubuntu_contributions INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT 1
);

CREATE TABLE community_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  ubuntu_principle TEXT DEFAULT 'I am because we are',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  likes INTEGER DEFAULT 0
);

-- Business Tables (Require authentication)
CREATE TABLE business_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE, -- Passage ID user ID
  name TEXT NOT NULL,
  business_type TEXT,
  location TEXT,
  tenant_id TEXT DEFAULT 'nyuchi-africa',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE business_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  revenue DECIMAL(10,2) DEFAULT 0.00,
  customers INTEGER DEFAULT 0,
  projects INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
*/

// ========================================
// 5. R2 FILE UPLOAD PATTERNS
// ========================================

/*
// Upload to R2 via Workers API
async function uploadFile(file: File, bucket: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  
  const response = await fetch(`${import.meta.env.VITE_API_DISPATCHER_URL}/api/assets/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getPassageToken()}`,
      'X-Ubuntu-Context': 'file-upload'
    },
    body: formData
  });
  
  return response.json(); // Returns R2 URL
}

// In Cloudflare Worker:
async function handleFileUpload(request: Request, env: Env) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const bucket = formData.get('bucket') as string;
  
  const key = `uploads/${Date.now()}-${file.name}`;
  
  await env.NY_COMMUNITY_ASSETS.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    }
  });
  
  const url = `https://community-assets.nyuchi.com/${key}`;
  return new Response(JSON.stringify({ url, key }));
}
*/

// This file serves as documentation - import patterns will vary based on React Router version
export default function D1IntegrationGuide() {
  return null; // Documentation only
}