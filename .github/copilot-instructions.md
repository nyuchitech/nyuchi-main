# 🇿🇼 Nyuchi Africa Platform Frontend - GitHub Copilot Instructions

## 🌍 Project Overview

**Nyuchi Africa Platform Frontend** is a consolidated Remix application built with React Router 7 and Shopify Polaris React, embodying Ubuntu philosophy ("I am because we are") to uplift African entrepreneurship.

**Live Platform**: [platform.nyuchi.com](https://platform.nyuchi.com)

## 🎯 Core Tech Stack (Current Implementation)

- **Framework**: Remix with React Router 7 for SSR and file-based routing
- **UI Library**: Shopify Polaris React (v13.9.5) - Shopify Admin design patterns
- **Language**: TypeScript with .tsx files throughout
- **Build System**: Vite with React Router Dev
- **Deployment**: Vercel (configured with vercel.json)
- **Styling**: Polaris CSS + Zimbabwe flag color integration

## 🏗️ Architecture Patterns

### File-Based Routing Structure
```typescript
// app/routes.ts - Current routing configuration
export default [
  layout("routes/_layout.tsx", [
    index("routes/_index.tsx"),           // Platform dashboard (/)
    route("community", "routes/community.tsx"),  // Community features
    route("home", "routes/home.tsx"),     // Welcome page
  ]),
  // Auth routes outside main layout
  route("auth/*", "routes/auth.$.tsx"),
  route("auth/signin", "routes/auth.signin.tsx"),
  route("auth/signout", "routes/auth.signout.tsx"), 
  route("auth/error", "routes/auth.error.tsx"),
] satisfies RouteConfig;
```

### Layout Architecture (Shopify Admin Pattern)
```tsx
// app/routes/_layout.tsx - Main application frame
<Frame
  topBar={<TopBar />}
  navigation={
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            label: '🇿🇼 Ubuntu Dashboard',
            icon: HomeIcon,
            url: '/dashboard',
            selected: location.pathname === '/dashboard',
          },
          {
            label: 'Community Platform', 
            badge: 'Always Free', // Ubuntu principle
          }
        ]}
      />
    </Navigation>
  }
>
  <Outlet /> {/* Child routes render here */}
</Frame>
```

### Theme System (Zimbabwe Colors + Polaris)
```typescript
// app/theme/nyuchi-polaris-theme.ts
export const nyuchiColors = {
  primaryGreen: '#00A651',    // Zimbabwe flag green
  primaryYellow: '#FDD116',   // Zimbabwe flag gold  
  primaryRed: '#EF3340',      // Zimbabwe flag red
  ubuntuOrange: '#E95420',    // Community collaboration
} as const;
```

## 🎨 Polaris React Component Patterns

### Core Layout Components
```tsx
// Use Polaris components exclusively
import { 
  Frame, Navigation, TopBar, Page, Layout, Card, 
  BlockStack, InlineStack, Text, Button, Badge 
} from '@shopify/polaris';

// Standard page structure
<Page title="Community Dashboard" primaryAction={{content: 'New Project'}}>
  <Layout>
    <Layout.Section>
      <Card>
        <BlockStack gap="400">
          <Text variant="headingLg" as="h2">Ubuntu Community</Text>
          <Badge tone="success">Always Free</Badge>
        </BlockStack>
      </Card>
    </Layout.Section>
  </Layout>
</Page>
```

### Spacing & Design Tokens
- **Spacing**: Use Polaris tokens - `gap="400"`, `padding="400"`, `insetBlockStart="400"`
- **Typography**: `variant="headingLg"`, `variant="bodyMd"`, `variant="bodySm"`
- **Colors**: Zimbabwe flag colors integrated with Polaris surface tokens
- **Icons**: Only `@shopify/polaris-icons` (HomeIcon, PersonIcon, etc.)

## 🚀 Development Workflow

### Essential Commands
```bash
npm run dev              # Development server (localhost:5173)
npm run build            # Production build with React Router
npm run typecheck        # TypeScript validation
npm run typecheck:watch  # TypeScript validation in watch mode
npm run lint             # ESLint code linting
npm run lint:fix         # ESLint with auto-fix
npm run deploy           # Build + deployment message
npm run start            # Production preview server
npm run clean            # Clean build cache
npm run audit:check      # Check for moderate+ vulnerabilities
npm run ubuntu:validate  # Ubuntu philosophy validation
```

### Project Structure
```
app/
├── routes/                    # React Router 7 file-based routing
│   ├── _layout.tsx           # Main Frame/Navigation layout
│   ├── _index.tsx            # Dashboard (/) route
│   ├── community.tsx         # Community features (/community)  
│   ├── home.tsx             # Welcome page (/home)
│   └── auth/                # Authentication routes
├── theme/
│   ├── index.ts             # Theme exports
│   └── nyuchi-polaris-theme.ts  # Zimbabwe + Polaris theme config
├── components/              # Reusable Polaris components
├── root.tsx                 # App root with Polaris AppProvider
└── app.css                  # Polaris CSS + Zimbabwe variables
```


## 🔧 Key Implementation Patterns

### Route Creation
```typescript
// Add new routes to app/routes.ts
export default [
  layout("routes/_layout.tsx", [
    index("routes/_index.tsx"),
    route("new-feature", "routes/new-feature.tsx"), // Add here
  ]),
] satisfies RouteConfig;
```

### Component Structure
```tsx
// Follow this pattern for new pages
import { Page, Layout, Card, BlockStack, Text } from '@shopify/polaris';
import type { Route } from "../+types/new-feature";

export default function NewFeature() {
  return (
    <Page title="Feature Name" primaryAction={{content: 'Action'}}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">Content</Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### Theme Integration
```typescript
// Use Zimbabwe colors from theme
import { nyuchiColors } from '~/theme';

// Apply in Polaris components via CSS custom properties
const customStyles = {
  '--p-color-bg-fill-brand': nyuchiColors.primaryGreen,
};
```

## 🔄 Backend Integration

### Cloudflare Workers Architecture
```typescript
// Connect to Cloudflare Workers with D1/R2 backends
const API_BASE = import.meta.env.VITE_API_DISPATCHER_URL;

// Standard API integration pattern
export async function loader({ request }: LoaderFunctionArgs) {
  const response = await fetch(`${API_BASE}/api/community/members`, {
    headers: {
      'Authorization': `Bearer ${await getPassageToken()}`,
      'X-Ubuntu-Context': 'community-first'
    }
  });
  return response.json();
}

// Action for data mutations (connects to D1 database)
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const response = await fetch(`${API_BASE}/api/community/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData))
  });
  return response.json();
}
```

### Asset Management (R2 Storage)
```typescript
// File uploads to Cloudflare R2
export async function uploadToR2(file: File, bucket: string) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/api/assets/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${await getPassageToken()}`,
      'X-R2-Bucket': bucket // NY_COMMUNITY_ASSETS or NY_SUCCESS_STORIES_MEDIA
    }
  });
  
  return response.json(); // Returns R2 URL
}
```

## 🎯 Ubuntu Philosophy Integration

Always use the Nyuchi theme with:```typescript

- Typography: Playfair Display (headings), Roboto (body)// Add to any new worker

- Custom component variants for buttons, cardsexport async function UbuntuMiddleware(request: Request, env: Env): Promise<void> {

- Semantic color tokens for consistent theming  (request as any).ubuntu = await buildUbuntuContext(userContext, env);

  (request as any).communityFirst = true;

### File Structure Standards  (request as any).africanContext = true;

```}

components/```

├── layout/          # Layout components (Header, Sidebar)

├── ui/             # Chakra UI enhanced components### Error Handling Pattern

├── forms/          # Form components with Chakra validationAll errors include Ubuntu-themed messaging:

└── features/       # Feature-specific components```typescript

```// workers/dispatcher/src/middleware/error-handler.ts

interface UbuntuError {

### Code Style Requirements  code: string;

1. **TypeScript** - All files must use TypeScript  ubuntu_message: string;        // Ubuntu-philosophy explanation

2. **Chakra UI Props** - Use native Chakra props instead of style props  philosophy: string;           // Always "I am because we are"

3. **Responsive** - Always consider mobile-first design  community_support: string;    // How community can help

4. **Accessible** - Use semantic HTML and ARIA patterns  african_context?: any;       // Africa-specific context

5. **Ubuntu Philosophy** - Community-focused, collaborative approach}

```

### Common Patterns

### Authentication Pattern

#### Dashboard Layout```typescript

```tsx// Community routes bypass auth, business routes require it

<Flex h="100vh">if (url.pathname.startsWith('/api/community/')) {

  <Box w="280px" bg="white" borderRight="1px solid" borderColor="gray.200" p={6}>  return undefined; // Continue without auth - Ubuntu principle

    {/* Sidebar with Chakra spacing */}}

  </Box>// Business tools require authentication but maintain Ubuntu context

  <Box flex={1}>```

    <Container maxW="7xl" py={8}>

      {/* Main content with Chakra container */}### AI Integration Pattern

    </Container>```typescript

// SSE streaming with Ubuntu alignment in apps/platform/src/app/api/stream/

</Flex>const ubuntuPersonality = `Ubuntu philosophy: "I am because we are"`;

```// All AI responses emphasize community benefit and African business context

```

#### Metric Cards

```tsx## 🏗️ Project Structure Navigation

<Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>

  <Card>### Key Configuration Files

    <CardBody>- `wrangler.toml`: Workers for Platforms dispatch configuration

      <Stat>- `package.json`: Workspace-aware scripts with Ubuntu metrics

        <StatLabel>Metric Name</StatLabel>- `workers/*/wrangler.toml`: Individual worker configurations

        <StatNumber>Value</StatNumber>

      </Stat>### Shared Packages (Not Fully Implemented)

    </CardBody>- `packages/shared-ui/`: ✅ Structure exists, build scripts skip implementation

  </Card>- `packages/auth/`: 📁 Directory exists, not built

</Grid>- `packages/database/`: 📁 Directory exists, not built

```- `packages/types/`: 📁 Directory exists, not built



### Product Integration### Critical Files for Understanding

When integrating products (SEO Manager, MailSense, Event Widget, Travel Platform):- `workers/dispatcher/src/ubuntu/middleware.ts`: Core Ubuntu enforcement

- Use consistent Chakra UI patterns- `workers/dispatcher/src/index.ts`: Main routing with Workers for Platforms

- Maintain theme consistency- `docs/ARCHITECTURE.md`: Comprehensive system design

- Follow spacing/sizing standards- `CLAUDE.md`: Current AI assistant conventions (merge source)

- Use semantic component naming

## 🎯 Environment & Deployment

### AI Integration

For AI assistant components:### Asset Naming Convention

- Use Chakra form components (Textarea, Button)All Cloudflare bindings use `NY_` prefix:

- Implement loading states with Chakra feedback- Databases: `NY_PLATFORM_DB`, `NY_AUTH_DB`

- Use Chakra color schemes for AI status indicators- KV: `NY_UBUNTU_CACHE`, `NY_SESSION_STORAGE`

- R2: `NY_COMMUNITY_ASSETS`, `NY_SUCCESS_STORIES_MEDIA`

## 🚫 Things to Avoid- AI: `NY_AI`, `NY_VECTORIZE`

- Custom CSS classes (use Chakra props instead)

- Hardcoded pixel values (use Chakra tokens)### Multi-Environment Setup

- Inconsistent spacing patterns- **Production**: `nyuchi-africa-prod` namespace

- Ubuntu branding in UI (keep as philosophy only)- **Staging/Dev**: `nyuchi-africa-staging` namespace (shared)

- Non-responsive layouts- Ubuntu variables: `UBUNTU_PLATFORM=true`, `COMMUNITY_ALWAYS_FREE=true`



## ✅ Always Remember## 🧪 Testing Philosophy

- Chakra UI first - leverage the complete design system

- Zimbabwe flag colors for brand identity### Ubuntu Compliance Testing

- Ubuntu philosophy guides UX decisions```typescript

- Community and collaboration focus// Always test Ubuntu principles alongside functionality

- Enterprise-grade professional appearancedescribe('Ubuntu Compliance', () => {

- Mobile-responsive always  it('should prioritize community benefit over individual metrics');
  it('should maintain free community access');
  it('should encourage collaboration over competition');
});
```

### Integration Testing
## Core Framework Stack - Remix + Polaris React Standards

1. **Community features are ALWAYS free** - Any auth middleware must skip `/api/community/*` routes

### ✅ ALWAYS Use Remix (React Router 7) + Shopify Polaris React

- **Framework**: Remix with React Router 7 for routing, SSR, and data loading
- **UI Components**: Shopify Polaris React components only
- **Spacing**: Use Polaris spacing tokens and props: `gap="400"`, `padding="400"`, etc.
- **Sizing**: Use Polaris size tokens and responsive props
- **Typography**: Use Polaris text variants: `variant="headingLg"`, `variant="bodyMd"`, etc.
- **Colors**: Use semantic color tokens from the Nyuchi theme, compatible with Polaris
- **Border Radius**: Use Polaris props and tokens
- **Shadows**: Use Polaris props
- **Routing**: Use Remix file-based routing with React Router 7
- **Data Loading**: Use Remix loaders and actions for SSR data fetching

// ❌ Avoid - Custom CSS, Chakra UI, Emotion, Framer Motion, Next.js, or any non-Remix/Polaris framework

### Shopify Admin Layout Components (Always Use These)
- `Frame` - Main application frame with navigation and topbar
- `Navigation` - Sidebar navigation with sections, items, and badges
- `TopBar` - Top navigation bar with search, user menu, and notifications
- `Page` - Page wrapper with breadcrumbs, title, subtitle, and actions
- `Layout` - Page content layout with primary and secondary sections
- `Card` - Content cards with sections, headers, and actions
- `DataTable`/`IndexTable` - Data display following Shopify Admin patterns
- `ResourceList` - List items with actions and bulk operations
- `Modal`, `Sheet` - Overlay components for forms and details
- `Toast` - Notifications and feedback messages

### Shopify Admin UI Patterns (Polaris Only)
- **Navigation**: Use Navigation.Section for grouping, badges for status
- **Page Actions**: Primary and secondary actions in Page component
- **Bulk Actions**: Use IndexTable with bulk selection patterns
- **Empty States**: Use EmptyState component with illustrations and actions
- **Loading States**: Use Skeleton, Spinner components during data loading
- **Error States**: Use Banner component for errors and warnings
- **Form Layout**: Use FormLayout, Card sections for organized forms

### Icons & Assets
- Use only Shopify Polaris icons (`@shopify/polaris-icons`)
- Follow Shopify Admin icon usage patterns (16px, 20px standard sizes)

### Shopify Admin Design Tokens
- Use Polaris design tokens for spacing, colors, typography
- Surface tokens: `surface`, `surface-subdued`, `surface-disabled`
- Interactive tokens: `interactive`, `interactive-hovered`, `interactive-pressed`

### File Structure Standards
components/
├── layout/          # Layout components (Header, Sidebar)
├── ui/             # Polaris UI enhanced components
├── forms/          # Form components with Polaris validation
└── features/       # Feature-specific components

### Code Style Requirements
1. **TypeScript** - All files must use TypeScript
2. **Polaris Props** - Use native Polaris props only
3. **Responsive** - Always consider mobile-first design
4. **Accessible** - Use semantic HTML and ARIA patterns
5. **Ubuntu Philosophy** - Community-focused, collaborative approach

### Common Patterns

### Authentication Pattern

#### Dashboard Layout

<Card>
  <BlockStack gap="400">
    {/* Sidebar with Polaris layout */}
    <Text variant="headingLg" as="h2">Title</Text>
    <Text variant="bodyMd" as="span">Content</Text>
    <Button variant="primary">Action</Button>
  </BlockStack>
</Card>

#### Metric Cards

<InlineStack gap="400">
  <Badge status="success">Metric Name: Value</Badge>
</InlineStack>

### Product Integration
- Use consistent Polaris UI patterns
- Maintain theme consistency
- Follow spacing/sizing standards
- Use semantic component naming

## 🚫 Things to Avoid
- Custom CSS classes (use Polaris props instead)
- Hardcoded pixel values (use Polaris tokens)
- Inconsistent spacing patterns
- Ubuntu branding in UI (keep as philosophy only)
- Non-responsive layouts
- Any Chakra UI, Emotion, Framer Motion, Next.js, Material UI, or non-Polaris components

## 🔐 Authentication with Passage ID

### Embedded Authentication Setup
```tsx
// app/root.tsx - Include Passage ID script globally
export const links: Route.LinksFunction = () => [
  // ... other links
  {
    rel: "preload",
    href: "https://psg.so/web.js",
    as: "script",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider theme={nyuchiPolarisTheme}>
          {children}
        </AppProvider>
        <Scripts />
        <script src="https://psg.so/web.js"></script>
      </body>
    </html>
  );
}
```

### Authentication Component Pattern
```tsx
// app/routes/auth.signin.tsx - Embedded authentication page
import { Page, Layout, Card, BlockStack, Text } from '@shopify/polaris';

export default function SignIn() {
  return (
    <Page title="🇿🇼 Welcome to Nyuchi Platform">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text variant="headingXl" as="h1">Nyuchi Africa Platform</Text>
              <Text variant="bodyLg" tone="subdued">
                "I am because we are" - Ubuntu Philosophy
              </Text>
              {/* Embedded Passage ID component */}
              <div dangerouslySetInnerHTML={{
                __html: '<passage-auth app-id="Lnv7cRQrfjdrD34CsTozgUu9"></passage-auth>'
              }} />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### JWT Authentication Integration
```typescript
// app/lib/auth.ts - Complete Passage ID integration with JWT validation
import Passage from "@passageidentity/passage-node";
import jwt from "jsonwebtoken";

const passage = new Passage({
  appId: process.env.PASSAGE_APP_ID!,
  apiKey: process.env.PASSAGE_API_KEY!,
});

// RSA Public Key for JWT validation
function getPublicKey(): string {
  const base64Key = process.env.PASSAGE_PUBLIC_KEY!;
  return Buffer.from(base64Key, 'base64').toString('utf-8');
}

// Manual JWT validation with RSA public key
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

// Server-side authentication for Remix loaders/actions
export async function authenticateRequest(request: Request): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;
    
    const token = authHeader.replace('Bearer ', '');
    if (!token) return null;
    
    // Try Passage SDK first, fallback to manual JWT validation
    try {
      const userId = await passage.auth.validateJwt(token);
      return userId;
    } catch (passageError) {
      const decoded = await validateJwtToken(token);
      return decoded?.sub || null;
    }
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

// Get user data from JWT or Passage API
export async function getAuthenticatedUser(request: Request) {
  const userId = await authenticateRequest(request);
  if (!userId) return null;
  
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const decoded = await validateJwtToken(token);
    if (decoded) {
      return {
        id: decoded.sub,
        email: decoded.email,
        phone: decoded.phone,
        philosophy: 'I am because we are',
      };
    }
  }
  
  return await getPassageUserData(userId);
}
```

### Community vs Protected Routes
```typescript
// Community routes bypass auth (Ubuntu principle)
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Community features are always free and accessible
  if (url.pathname.startsWith('/community')) {
    return await fetchCommunityData(); // No auth required
  }
  
  // Business features require authentication
  const userID = await requireAuth(request);
  return await fetchUserData(userID);
}
```

### Backend Authentication Middleware (Cloudflare Workers)
```typescript
// For Cloudflare Workers backend - adapt the Passage middleware pattern
import Passage from "@passageidentity/passage-node";

const passageConfig = {
  appID: "Lnv7cRQrfjdrD34CsTozgUu9"
};

export const passageAuthMiddleware = async (request: Request, env: Env) => {
  const passage = new Passage(passageConfig);
  
  try {
    const userID = await passage.authenticateRequest(request);
    if (userID) {
      // User authenticated - add to request context
      (request as any).userID = userID;
      (request as any).authenticated = true;
      return userID;
    }
  } catch (error) {
    console.error('Authentication failed:', error);
    // Return 401 for unauthenticated requests to protected routes
    return new Response('Could not authenticate user!', { status: 401 });
  }
  
  return null;
};

// Usage in Cloudflare Workers
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    
    // Community routes bypass auth (Ubuntu principle)
    if (url.pathname.startsWith('/api/community/')) {
      return handleCommunityRequest(request, env);
    }
    
    // Protected routes require authentication
    const authResult = await passageAuthMiddleware(request, env);
    if (authResult instanceof Response) {
      return authResult; // Return 401 response
    }
    
    // Continue with authenticated request
    return handleProtectedRequest(request, env);
  }
};
```

## 🗄️ D1 Database Integration Patterns

### Complete Worker Implementation (Hono Framework)
```typescript
// workers/dispatcher/src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  NY_PLATFORM_DB: D1Database;
  NY_COMMUNITY_ASSETS: R2Bucket;
  PASSAGE_APP_ID: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Community endpoints (always accessible - Ubuntu principle)
app.get('/api/community/members', async (c) => {
  const members = await c.env.NY_PLATFORM_DB
    .prepare(`SELECT id, name, location, ubuntu_contributions FROM community_members WHERE active = 1`)
    .all();

  return c.json({
    members: members.results,
    ubuntu_message: 'Together we achieve more - I am because we are',
  });
});

app.post('/api/community/posts', async (c) => {
  const { title, content, author_name } = await c.req.json();
  
  const result = await c.env.NY_PLATFORM_DB
    .prepare(`INSERT INTO community_posts (title, content, author_name, ubuntu_principle) VALUES (?, ?, ?, ?)`)
    .bind(title, content, author_name, 'I am because we are')
    .run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

// Business endpoints (require authentication)
app.use('/api/business/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'Authentication required' }, 401);
  
  const userID = await validatePassageJWT(authHeader.replace('Bearer ', ''));
  if (!userID) return c.json({ error: 'Invalid token' }, 401);
  
  c.set('userID', userID);
  await next();
});

app.get('/api/business/dashboard', async (c) => {
  const userID = c.get('userID');
  const metrics = await c.env.NY_PLATFORM_DB
    .prepare('SELECT * FROM business_metrics WHERE user_id = ?')
    .bind(userID)
    .first();

  return c.json({ metrics: metrics || { revenue: 0, customers: 0 } });
});

export default app;
```

### D1 Database Schema
```sql
-- Community Tables (Always accessible)
CREATE TABLE community_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  location TEXT,
  ubuntu_contributions INTEGER DEFAULT 0,
  joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT 1
);

CREATE TABLE community_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT,
  ubuntu_principle TEXT DEFAULT 'I am because we are',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  likes INTEGER DEFAULT 0
);

-- Business Tables (Require authentication)
CREATE TABLE business_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE, -- Passage ID
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
  month_year TEXT, -- 'YYYY-MM'
  ubuntu_impact_score INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Frontend API Integration
```typescript
// app/lib/api.ts usage examples
import { database, files } from '~/lib/api';

// Community route loader (no auth required)
export async function loader() {
  const [members, posts] = await Promise.all([
    database.community.getMembers(),
    database.community.getPosts(),
  ]);
  return { members, posts };
}

// Business route loader (requires auth)
export async function loader({ request }) {
  await requireAuth(request);
  const dashboard = await database.business.getDashboard();
  return { dashboard };
}

// File upload action
export async function action({ request }) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const result = await files.upload(file, 'community-stories');
  return { url: result.url };
}
```

## 🚀 Server-Sent Events (SSE) & Direct Database Integration

### SSE for Real-time Ubuntu AI Streaming
```typescript
// app/routes/api.ai.stream.tsx - Ubuntu AI SSE endpoint
export async function action({ request }: ActionFunctionArgs) {
  await requireAuth(request); // AI streaming requires auth for resource management
  const user = await getAuthenticatedUser(request);
  
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Stream from existing Ubuntu AI worker
      const aiResponse = await fetch(`${UBUNTU_AI_WORKER_URL}/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Ubuntu-Context': 'remix-ssr-streaming',
          'X-African-Context': 'true',
        },
        body: JSON.stringify({ message, ubuntu_philosophy: 'I am because we are' }),
      });

      // Forward streaming response with Ubuntu enhancements
      const reader = aiResponse.body?.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Enhance AI responses with Ubuntu context
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          ...parsedResponse,
          ubuntu_enhanced: true,
          community_benefit: 'This guidance serves both your success and collective prosperity'
        })}\n\n`));
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Ubuntu-Philosophy': 'I am because we are',
    },
  });
}
```

### Direct D1 Database Connections for SSR
```typescript
// app/lib/database.server.ts - Direct database access
import type { D1Database } from '@cloudflare/workers-types';

class UbuntuDatabase {
  constructor(private platformDb: D1Database) {}

  // Community operations (always accessible - Ubuntu principle)
  async getCommunityMembers(): Promise<any[]> {
    const result = await this.platformDb
      .prepare(`SELECT id, name, location, ubuntu_contributions FROM community_members WHERE active = 1`)
      .all();
    return result.results || [];
  }

  // Business operations (require authentication)
  async getUserProfile(userId: string): Promise<any> {
    const result = await this.platformDb
      .prepare(`SELECT * FROM business_profiles WHERE user_id = ?`)
      .bind(userId)
      .first();
    return result;
  }
}

// Usage in Remix loaders
export async function loader({ request }: LoaderFunctionArgs) {
  const env = getCloudflareEnv(request); // D1 bindings from Cloudflare Pages
  const db = new UbuntuDatabase(env.NY_PLATFORM_DB);
  
  // Direct database access for SSR - no API calls needed
  const [communityData, userProfile] = await Promise.all([
    db.getCommunityMembers(), // Always accessible
    db.getUserProfile(userId), // If authenticated
  ]);
  
  return { communityData, userProfile };
}
```

### Real-time Community Activity Stream
```typescript
// app/routes/api.community.activity-stream.tsx - Community SSE (always free)
export async function loader({ request }: LoaderFunctionArgs) {
  // No authentication required - Ubuntu principle: Community data always accessible
  
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Send periodic community updates
      const interval = setInterval(async () => {
        const db = createUbuntuDatabase(getCloudflareEnv(request));
        const activity = await db.getRealtimeCommunityActivity();
        
        const activityData = {
          type: 'community_activity',
          data: activity,
          ubuntu_pulse: 'Community growing stronger together',
          philosophy: 'I am because we are',
          timestamp: new Date().toISOString(),
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(activityData)}\n\n`));
      }, 30000); // Update every 30 seconds
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'X-Ubuntu-Philosophy': 'I am because we are',
      'X-Community-Always-Free': 'true',
    },
  });
}
```

### Client-Side SSE Integration
```typescript
// React hook for Ubuntu SSE connections
export function useUbuntuSSE(endpoint: string) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    const eventSource = new EventSource(endpoint);
    
    eventSource.onopen = () => setStatus('connected');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.ubuntu_message) console.log('Ubuntu update:', data.ubuntu_message);
      setData(data);
    };
    eventSource.onerror = () => setStatus('error');
    
    return () => eventSource.close();
  }, [endpoint]);

  return { data, status };
}

// Usage in components
export default function RealtimeDashboard() {
  const data = useLoaderData<typeof loader>(); // SSR data from direct DB
  const { data: liveActivity } = useUbuntuSSE('/api/community/activity-stream'); // Real-time updates
  
  return (
    <Page title="🇿🇼 Ubuntu Real-time Dashboard">
      {/* SSR community data */}
      <Text>Community Members: {data.communityData.length}</Text>
      
      {/* Live activity from SSE */}
      <Badge status={liveActivity ? 'success' : 'info'}>
        {liveActivity?.ubuntu_pulse || 'Ubuntu pulse connecting...'}
      </Badge>
    </Page>
  );
}
```

## 🎯 Ubuntu Philosophy Integration

Every component should reflect community-first design:
```typescript
// Community features remain always accessible  
if (pathname.startsWith('/community')) {
  return <CommunityLayout>{children}</CommunityLayout>; // No auth barriers
}

// Ubuntu principle in UX - collective benefit over individual metrics
const ubuntuMessage = "Together we achieve more - I am because we are";

// All SSE messages include Ubuntu context
interface UbuntuSSEMessage {
  type: string;
  philosophy: 'I am because we are';
  ubuntu_message: string;
  community_support?: string;
  data?: any;
}
```

## 🌐 Environment Configuration

### Key Environment Variables
```bash
# Cloudflare Workers Backend
VITE_API_DISPATCHER_URL=https://nyuchi-africa-dispatcher.nyuchitech.workers.dev

# Passage ID Authentication
VITE_PASSAGE_APP_ID=Lnv7cRQrfjdrD34CsTozgUu9
PASSAGE_APP_ID=Lnv7cRQrfjdrD34CsTozgUu9
PASSAGE_API_KEY=your_passage_api_key
PASSAGE_PUBLIC_KEY=LS0tLS1CRUdJTi...  # Base64 encoded RSA public key for JWT validation

# Ubuntu Philosophy & Theming
VITE_UBUNTU_PHILOSOPHY="I am because we are"
VITE_COMMUNITY_ALWAYS_FREE=true
VITE_THEME_PRIMARY_COLOR="#00A651"  # Zimbabwe flag green

# Cloudflare Asset Configuration
VITE_R2_COMMUNITY_BUCKET_URL=https://community-assets.nyuchi.com
VITE_R2_MEDIA_BUCKET_URL=https://media.nyuchi.com
```

### Remix Loader Integration Pattern
```typescript
// Example authenticated Remix loader
import type { LoaderFunctionArgs } from "react-router";
import { getAuthenticatedUser, requireAuth } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Community routes are always accessible (Ubuntu principle)
  if (url.pathname.startsWith('/community')) {
    const apiUrl = import.meta.env.VITE_API_DISPATCHER_URL;
    const response = await fetch(`${apiUrl}/api/community/members`, {
      headers: { 'X-Ubuntu-Context': 'community-first' }
    });
    return response.json();
  }
  
  // Protected routes require authentication
  await requireAuth(request); // Throws redirect if not authenticated
  const user = await getAuthenticatedUser(request);
  
  // Make authenticated API call
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const response = await fetch(`${apiUrl}/api/user/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Ubuntu-Context': 'authenticated-user',
      'X-User-ID': user?.id || '',
    }
  });
  
  return { user, data: await response.json() };
}
```

## �️ Cloudflare Infrastructure Integration

### Asset Naming Convention
All Cloudflare bindings use `NY_` prefix:
- **Databases**: `NY_PLATFORM_DB`, `NY_AUTH_DB`
- **KV**: `NY_UBUNTU_CACHE`, `NY_SESSION_STORAGE`
- **R2**: `NY_COMMUNITY_ASSETS`, `NY_SUCCESS_STORIES_MEDIA`
- **AI**: `NY_AI`, `NY_VECTORIZE`

### D1 Database Pattern
```typescript
// Backend workers connect to D1 databases
// Frontend makes API calls with Ubuntu context
export async function createCommunityPost(data: PostData) {
  const response = await fetch(`${API_BASE}/api/community/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getPassageToken()}`,
      'X-Ubuntu-Context': 'community-first'
    },
    body: JSON.stringify({
      ...data,
      tenant_id: 'nyuchi-africa', // Multi-tenant isolation
      ubuntu_validated: true
    })
  });
  return response.json();
}
```

### Error Handling Pattern
All errors include Ubuntu-themed messaging:
```typescript
interface UbuntuError {
  code: string;
  ubuntu_message: string;        // Ubuntu-philosophy explanation
  philosophy: string;           // Always "I am because we are"
  community_support: string;    // How community can help
  african_context?: any;       // Africa-specific context
}
```

## �🔄 Migration Context (Important)

This codebase represents a **consolidated frontend migration**:
- ✅ **Current**: Single Remix app with Polaris React (this repository)
- ❌ **Legacy**: Multi-worker Cloudflare setup (referenced in old docs but not this codebase)
- 🎯 **Focus**: Pure frontend with backend API integration via environment variables

## ✅ Always Remember - Core Principles
- **Shopify Admin Patterns**: Frame → Navigation → TopBar → Page → Layout → Card hierarchy
- **Polaris React Only**: No custom CSS, no other UI frameworks
- **Ubuntu Philosophy**: Community-focused UX without Ubuntu branding in UI
- **Zimbabwe Integration**: Flag colors through Polaris design tokens only
- **TypeScript Strict**: All files use `.tsx` with proper typing
- **File-Based Routing**: React Router 7 patterns in `app/routes/`
- **Community Always Free**: No authentication barriers for `/community` routes
- **Embedded Auth**: Use `<passage-auth>` component with Polaris Card wrapper
- **Cloudflare Integration**: API calls to Workers with D1/R2 backend storage
- **Asset Management**: Upload files to R2 buckets via Workers API endpoints