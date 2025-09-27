/**
 * Real-time Dashboard with Direct D1 Integration
 * 
 * This route demonstrates Server-Side Rendering (SSR) with direct D1 database connections
 * and real-time updates via Server-Sent Events, following Ubuntu philosophy.
 */

import { Page, Layout, Card, BlockStack, Text, Button, DataTable, Badge } from '@shopify/polaris';
import { PersonIcon, HeartIcon, ChartVerticalIcon } from '@shopify/polaris-icons';
import { useState, useEffect } from 'react';
import type { Route } from './+types/realtime-dashboard';
import { requireAuth, getAuthenticatedUser } from '~/lib/auth';
import { createUbuntuDatabase } from '~/lib/database.server';

export function meta() {
  return [
    { title: "🇿🇼 Real-time Ubuntu Dashboard - Nyuchi Africa Platform" },
    { name: "description", content: "Live community activity with Ubuntu philosophy - I am because we are" },
  ];
}

// SSR Loader with direct D1 database connection
export async function loader({ request }: Route.LoaderArgs) {
  try {
    // Get database connection (would be from Cloudflare environment in production)
    const env = getCloudflareEnv(request);
    const db = createUbuntuDatabase(env);

    // Check if user is authenticated for business features
    let userProfile = null;
    let businessMetrics = null;
    
    try {
      await requireAuth(request);
      const user = await getAuthenticatedUser(request);
      
      if (user) {
        // Get authenticated user's business data via direct DB connection
        [userProfile, businessMetrics] = await Promise.all([
          db.getUserProfile(user.id),
          db.getBusinessMetrics(user.id),
        ]);
      }
    } catch (authError) {
      // No auth required for community features - Ubuntu principle
      console.log('No auth - showing community features only');
    }

    // Always get community data (free access - Ubuntu principle)
    const [communityMembers, communityPosts, discussions, successStories] = await Promise.all([
      db.getCommunityMembers(),
      db.getCommunityPosts(5),
      db.getCommunityDiscussions(true),
      db.getSuccessStories(3),
    ]);

    return {
      // Community data (always available)
      community: {
        members: communityMembers,
        posts: communityPosts, 
        discussions: discussions,
        success_stories: successStories,
      },
      // Business data (if authenticated)
      user: userProfile,
      business: businessMetrics,
      // Ubuntu context
      ubuntu_context: {
        philosophy: 'I am because we are',
        community_first: true,
        african_context: true,
        realtime_enabled: true,
      },
    };

  } catch (error) {
    console.error('SSR Database Error:', error);
    
    return {
      error: {
        ubuntu_message: 'Ubuntu community database temporarily challenged - but our spirit remains strong',
        philosophy: 'I am because we are',
        community_support: 'Together we overcome technical difficulties',
        technical_details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Component with real-time updates
export default function RealtimeDashboard() {
  const data = useLoaderData<typeof loader>();
  const [realtimeActivity, setRealtimeActivity] = useState<any>(null);
  const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [aiStream, setAiStream] = useState<any[]>([]);

  // SSE connection for real-time community activity
  useEffect(() => {
    const eventSource = new EventSource('/api/community/activity-stream');
    
    eventSource.onopen = () => {
      setSseStatus('connected');
      console.log('Ubuntu community stream connected - I am because we are');
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'community_activity') {
          setRealtimeActivity(data.data);
        } else if (data.type === 'welcome') {
          console.log('Ubuntu welcome:', data.ubuntu_message);
        } else if (data.type === 'error') {
          console.error('Ubuntu SSE error:', data.ubuntu_message);
          setSseStatus('error');
        }
      } catch (e) {
        console.log('SSE heartbeat or non-JSON message received');
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('Ubuntu SSE connection error:', error);
      setSseStatus('error');
    };
    
    return () => {
      eventSource.close();
    };
  }, []);

  // Handle error state
  if ('error' in data) {
    return (
      <Page title="Ubuntu Dashboard - Temporary Challenge">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Ubuntu Community Support</Text>
                <Text variant="bodyMd" as="p">{data.error.ubuntu_message}</Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  {data.error.philosophy}
                </Text>
                <Button onClick={() => window.location.reload()}>
                  Try Again - Ubuntu Never Gives Up
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const { community, user, business, ubuntu_context } = data;

  return (
    <Page 
      title="🇿🇼 Ubuntu Real-time Dashboard" 
      subtitle={ubuntu_context.philosophy}
      primaryAction={{
        content: 'Share Ubuntu Story',
        onAction: () => console.log('Open story sharing'),
      }}
      secondaryActions={[
        {
          content: 'Join Discussion',
          onAction: () => console.log('Join community discussion'),
        }
      ]}
    >
      <Layout>
        {/* Real-time Community Activity */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text variant="headingLg" as="h2">Live Ubuntu Community Activity</Text>
                <Badge 
                  status={sseStatus === 'connected' ? 'success' : sseStatus === 'error' ? 'critical' : 'info'}
                >
                  {sseStatus === 'connected' ? 'Live' : sseStatus === 'error' ? 'Reconnecting' : 'Connecting'}
                </Badge>
              </div>
              
              {realtimeActivity && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <Card padding="300">
                    <BlockStack gap="200">
                      <Text variant="headingSm" as="h3">Recent Posts</Text>
                      <Text variant="headingXl" as="p">{realtimeActivity.recent_posts}</Text>
                      <Text variant="bodySm" as="p" tone="subdued">Last hour</Text>
                    </BlockStack>
                  </Card>
                  
                  <Card padding="300">
                    <BlockStack gap="200">
                      <Text variant="headingSm" as="h3">Active Discussions</Text>
                      <Text variant="headingXl" as="p">{realtimeActivity.active_discussions}</Text>
                      <Text variant="bodySm" as="p" tone="subdued">Right now</Text>
                    </BlockStack>
                  </Card>
                  
                  <Card padding="300">
                    <BlockStack gap="200">
                      <Text variant="headingSm" as="h3">New Members</Text>
                      <Text variant="headingXl" as="p">{realtimeActivity.new_members}</Text>
                      <Text variant="bodySm" as="p" tone="subdued">Today</Text>
                    </BlockStack>
                  </Card>
                </div>
              )}
              
              <Text variant="bodyMd" as="p" tone="subdued">
                {realtimeActivity?.ubuntu_pulse || 'Ubuntu community pulse loading...'}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Community Members (Direct DB data) */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">
                Ubuntu Community Members ({community.members.length})
              </Text>
              
              {community.members.length > 0 ? (
                <DataTable
                  columnContentTypes={['text', 'text', 'numeric', 'text']}
                  headings={['Name', 'Location', 'Ubuntu Contributions', 'Status']}
                  rows={community.members.slice(0, 5).map((member: any) => [
                    member.name,
                    member.location || 'Global Ubuntu',
                    member.ubuntu_contributions || 0,
                    <Badge key={member.id} status="success">Active</Badge>
                  ])}
                />
              ) : (
                <Text variant="bodyMd" as="p">
                  Community growing - be among the first Ubuntu members!
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Business Metrics (if authenticated) */}
        {user && business && (
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Your Ubuntu Business Journey</Text>
                <Text variant="bodyMd" as="p">Welcome back, {user.name}</Text>
                
                {business.length > 0 && (
                  <DataTable
                    columnContentTypes={['text', 'numeric']}
                    headings={['Metric', 'Value']}
                    rows={[
                      ['Revenue', `${business[0].currency} ${business[0].revenue || 0}`],
                      ['Customers', business[0].customers || 0],
                      ['Projects', business[0].projects || 0],
                      ['Ubuntu Impact', business[0].ubuntu_impact_score || 0],
                    ]}
                  />
                )}
                
                <Text variant="bodySm" as="p" tone="subdued">
                  Your success strengthens our entire Ubuntu community
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Community Success Stories (Direct DB) */}
        <Layout.Section variant={user ? "oneThird" : "fullWidth"}>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Ubuntu Success Stories</Text>
              
              {community.success_stories.map((story: any) => (
                <Card key={story.id} padding="300">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">{story.title}</Text>
                    <Text variant="bodyMd" as="p">
                      {story.story.substring(0, 100)}...
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Ubuntu Principle: {story.ubuntu_principle_demonstrated}
                    </Text>
                  </BlockStack>
                </Card>
              ))}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// Mock Cloudflare environment for development
function getCloudflareEnv(request: Request): any {
  // In production Cloudflare Pages:
  // return (request as any).env;
  
  return {
    NY_PLATFORM_DB: null,
    NY_AUTH_DB: null,
    NY_SHARED_RESOURCES: null,
    UBUNTU_PHILOSOPHY: 'I am because we are',
    COMMUNITY_ALWAYS_FREE: 'true',
  };
}

// Mock hooks for development
function useLoaderData<T>(): T {
  // This would be provided by Remix in the actual app
  return {} as T;
}