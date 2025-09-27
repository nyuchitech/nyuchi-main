import { Page, Layout, Card, BlockStack, Text, Button, DataTable, Badge } from '@shopify/polaris';
import { PersonIcon, HeartIcon } from '@shopify/polaris-icons';
import { database, handleApiError } from '~/lib/api';

// Meta function for SEO
export function meta() {
  return [
    { title: "🇿🇼 Community Hub - Nyuchi Africa Platform" },
    { name: "description", content: "Ubuntu community where African entrepreneurs support each other" },
  ];
}

// Loader: Fetch community data from D1 via Cloudflare Workers
// No authentication required - Ubuntu principle: Community is always free
export async function loader() {
  try {
    // These API calls go to Cloudflare Workers which query D1 database
    const [members, recentPosts, discussions] = await Promise.all([
      database.community.getMembers(),
      database.community.getPosts({ limit: 5 }),
      database.community.getDiscussions({ active: true }),
    ]);

    return {
      members,
      recentPosts,
      discussions,
      ubuntu_context: {
        philosophy: 'I am because we are',
        message: 'Welcome to our Ubuntu community - together we are stronger',
        community_first: true,
      }
    };
  } catch (error) {
    const ubuntuError = handleApiError(error);
    return { error: ubuntuError };
  }
}

// Action: Handle community interactions
export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const intent = formData.get('intent') as string;

    switch (intent) {
      case 'join_community': {
        const memberData = {
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          location: formData.get('location') as string,
        };
        
        // This calls our Cloudflare Worker which inserts into D1
        const result = await database.community.addMember(memberData);
        return { success: true, member: result };
      }

      case 'create_post': {
        const postData = {
          title: formData.get('title') as string,
          content: formData.get('content') as string,
          author_name: formData.get('author_name') as string,
        };
        
        // Community posts don't require authentication
        const result = await database.community.createPost(postData);
        return { success: true, post: result };
      }

      case 'start_discussion': {
        const discussionData = {
          topic: formData.get('topic') as string,
          description: formData.get('description') as string,
          starter_name: formData.get('starter_name') as string,
        };
        
        const result = await database.community.createDiscussion(discussionData);
        return { success: true, discussion: result };
      }

      default:
        return { error: 'Invalid action' };
    }
  } catch (error) {
    const ubuntuError = handleApiError(error);
    return { error: ubuntuError };
  }
}

// Component using D1 data via Cloudflare Workers
export default function CommunityHub() {
  const data = useLoaderData<typeof loader>();

  // Handle error state with Ubuntu messaging
  if ('error' in data) {
    return (
      <Page title="Ubuntu Community - Temporary Challenge">
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

  const { members, recentPosts, discussions, ubuntu_context } = data;

  return (
    <Page 
      title="🇿🇼 Ubuntu Community Hub" 
      subtitle={ubuntu_context.message}
      primaryAction={{
        content: 'Share Your Story',
        onAction: () => console.log('Open story sharing modal'),
      }}
      secondaryActions={[
        {
          content: 'Join Discussion',
          onAction: () => console.log('Join community discussion'),
        }
      ]}
    >
      <Layout>
        {/* Community Members Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">
                Ubuntu Community Members ({members?.length || 0})
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                {ubuntu_context.philosophy} - Our growing network of African entrepreneurs
              </Text>
              
              {members && members.length > 0 ? (
                <DataTable
                  columnContentTypes={['text', 'text', 'numeric', 'text']}
                  headings={['Name', 'Location', 'Ubuntu Contributions', 'Status']}
                  rows={members.map((member: any) => [
                    member.name,
                    member.location || 'Global Ubuntu',
                    member.ubuntu_contributions || 0,
                    <Badge key={member.id} status="success">Active</Badge>
                  ])}
                />
              ) : (
                <Text variant="bodyMd" as="p">
                  Be the first to join our Ubuntu community!
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Recent Posts Section */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Recent Community Posts</Text>
              
              {recentPosts && recentPosts.length > 0 ? (
                <BlockStack gap="300">
                  {recentPosts.slice(0, 3).map((post: any) => (
                    <Card key={post.id} padding="300">
                      <BlockStack gap="200">
                        <Text variant="headingSm" as="h3">{post.title}</Text>
                        <Text variant="bodyMd" as="p">
                          {post.content.substring(0, 100)}...
                        </Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          by {post.author_name} • {post.ubuntu_principle}
                        </Text>
                      </BlockStack>
                    </Card>
                  ))}
                </BlockStack>
              ) : (
                <Text variant="bodyMd" as="p">
                  No posts yet. Share the first Ubuntu story!
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Active Discussions */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Ubuntu Discussions</Text>
              
              {discussions && discussions.length > 0 ? (
                <BlockStack gap="300">
                  {discussions.map((discussion: any) => (
                    <Card key={discussion.id} padding="300">
                      <BlockStack gap="200">
                        <Text variant="headingSm" as="h3">{discussion.topic}</Text>
                        <Text variant="bodyMd" as="p">{discussion.description}</Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          {discussion.participant_count} participants • Started by {discussion.starter_name}
                        </Text>
                      </BlockStack>
                    </Card>
                  ))}
                </BlockStack>
              ) : (
                <Text variant="bodyMd" as="p">
                  Start the first Ubuntu discussion!
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}