# 🇿🇼 Nyuchi Africa Platform Frontend

> **Ubuntu Philosophy**: *"I am because we are"* - Building technology that uplifts African entrepreneurship through community collaboration.

## 🌍 Live Platform

**Production URL**: [platform.nyuchi.com](https://platform.nyuchi.com)

### Route Structure
- `/` - Platform Dashboard (main page)
- `/community` - Community Features & Collaboration
- `/home` - Welcome & Getting Started
- `/auth/signin` - Secure authentication with Passage ID
- `/auth/signout` - Sign out with Ubuntu farewell
- `/auth/error` - Friendly error handling with community support

## �� Tech Stack

- **Framework**: Remix with React Router 7 (SSR, file-based routing)
- **UI Library**: Shopify Polaris React (Shopify Admin design patterns)
- **Language**: TypeScript (.tsx files throughout)
- **Styling**: Polaris CSS + Zimbabwe flag color themes
- **Build**: Vite with optimized production builds

## 🎨 Design Philosophy

### Zimbabwe Flag Colors
- **Primary Green**: `#00A651` 🟢 - Growth, prosperity, agriculture
- **Golden Yellow**: `#FDD116` 🟡 - Mineral wealth, bright future
- **Deep Red**: `#EF3340` 🔴 - Heritage, strength, sacrifice
- **Ubuntu Orange**: `#E95420` 🟠 - Community, collaboration

### Shopify Admin UI Patterns
```tsx
<Frame topBar={<TopBar />} navigation={<Navigation />}>
  <Page title="Community Dashboard" primaryAction={{content: 'New Project'}}>
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text variant="headingLg">Ubuntu Community</Text>
            <Badge tone="success">Active</Badge>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  </Page>
</Frame>
```

## 🛠️ Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Getting Started
```bash
# Clone the repository
git clone https://github.com/nyuchitech/platform-frontend.git
cd platform-frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Opens http://localhost:5173
```

### Available Scripts
```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Production server
npm run typecheck  # TypeScript validation
npm run lint       # Code linting
npm run deploy     # Build for deployment
npm run preview    # Preview production build
```

## 🌐 Deployment

### Automatic Deployment
- **CI/CD**: GitHub Actions workflow
- **Target**: platform.nyuchi.com  
- **Trigger**: Push to `main` branch

### Manual Deployment
```bash
npm run deploy
```

## 🔗 Backend Integration

Connects to existing Cloudflare Workers:
- **Dispatcher**: Main routing & Ubuntu middleware
- **Community**: Always-free community platform
- **Travel**: Business travel platform
- **Auth**: Authentication & user management

### API Endpoints
```typescript
// Production
VITE_API_DISPATCHER_URL=https://nyuchi-africa-dispatcher.nyuchitech.workers.dev
VITE_API_COMMUNITY_URL=https://nyuchi-africa-community.nyuchitech.workers.dev

// Development  
VITE_API_DISPATCHER_URL=http://localhost:8787
```

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` for development:
```bash
cp .env.example .env.local
```

Key variables:
- `VITE_APP_URL` - Application base URL
- `VITE_UBUNTU_PHILOSOPHY` - Ubuntu philosophy text
- `VITE_COMMUNITY_ALWAYS_FREE` - Ensures community features stay free
- `VITE_THEME_PRIMARY_COLOR` - Zimbabwe green theme

## 🧪 Testing

### Ubuntu Compliance Testing
```bash
# Validates Ubuntu philosophy integration
npm run test:ubuntu

# Checks Zimbabwe theme colors
npm run test:theme

# Validates community-first routing
npm run test:routing
```

## 📁 Project Structure

```
platform-frontend/
├── app/
│   ├── routes/               # Remix file-based routing
│   │   ├── _layout.tsx       # Main layout with Frame/Navigation
│   │   ├── _index.tsx        # Platform dashboard (/)
│   │   ├── community.tsx     # Community features (/community)
│   │   └── home.tsx          # Welcome page (/home)
│   ├── components/           # Polaris React components
│   ├── theme/               # Zimbabwe + Ubuntu theme system
│   │   ├── index.ts         # Theme exports
│   │   └── nyuchi-polaris-theme.ts # Polaris theme config
│   ├── root.tsx             # App root with Polaris AppProvider
│   └── app.css              # Polaris CSS + custom variables
├── .github/workflows/       # CI/CD automation
├── public/                  # Static assets
└── package.json             # Dependencies & scripts
```

## 🤝 Contributing

### Ubuntu Philosophy Guidelines
1. **Community First**: Features benefiting the community get priority
2. **"I am because we are"**: Individual success through collective success  
3. **African Context**: Solutions designed for African business environments
4. **Professional Quality**: Enterprise-grade user experience

### Code Standards
- TypeScript with `.tsx` files only
- Shopify Polaris React components exclusively
- Zimbabwe flag colors in theming
- Ubuntu philosophy in UX decisions

## 🎯 Roadmap

- [x] ✅ Consolidated frontend architecture  
- [x] ✅ Shopify Admin design implementation
- [x] ✅ Zimbabwe flag color theming
- [x] ✅ Flattened routing structure
- [x] ✅ CI/CD pipeline setup
- [ ] 🚧 Backend API integration
- [ ] 🚧 Authentication flow
- [ ] 🚧 Community features expansion
- [ ] 🚧 Performance optimization
- [ ] 🚧 Mobile responsiveness enhancement

## 📄 License

MIT License - Built with Ubuntu philosophy for African entrepreneurship

---

**🇿🇼 Nyuchi Africa Platform** | **🟠 Ubuntu Philosophy** | **⚡ Powered by Remix + Polaris React**
