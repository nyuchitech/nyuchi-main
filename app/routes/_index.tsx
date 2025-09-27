import { Page, Card, Text, BlockStack, InlineStack, Button, Badge, Icon, Layout, DataTable } from '@shopify/polaris';
import { PersonIcon, AlertCircleIcon, ChartVerticalIcon, HeartIcon } from '@shopify/polaris-icons';

export function meta() {
  return [
    { title: "🇿🇼 Dashboard - Nyuchi Africa Platform" },
    { name: "description", content: "Your Ubuntu-driven business dashboard" },
  ];
}

export default function DashboardIndex() {
  // Sample recent activity data for Shopify Admin style
  const recentActivity = [
    ['New member joined community', 'Tendai Mukamuri from Harare', '2 minutes ago'],
    ['Success story shared', 'Amara Okafor - Fashion startup funding', '15 minutes ago'],
    ['Ubuntu score increased', 'Community health improved to 96%', '1 hour ago'],
    ['Travel booking confirmed', 'Lagos to Cape Town business trip', '3 hours ago'],
    ['Event created', 'African Tech Summit 2025', '5 hours ago'],
  ];

  return (
    <Page 
      title="🇿🇼 Ubuntu Dashboard"
      subtitle="Welcome to your Ubuntu-driven platform for African business success"
      primaryAction={{
        content: 'Start Discussion',
        onAction: () => console.log('Start discussion'),
      }}
      secondaryActions={[
        {
          content: 'Share Success Story',
          onAction: () => console.log('Share story'),
        },
        {
          content: 'View Community',
          onAction: () => console.log('View community'),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Ubuntu Philosophy Banner */}
            <Card>
              <BlockStack gap="200">
                <Text variant="headingLg" as="h2">
                  "I am because we are"
                </Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Your success strengthens our entire African business ecosystem. Every action you take builds our collective prosperity.
                </Text>
              </BlockStack>
            </Card>

            {/* Key Metrics - Shopify Admin Style */}
            <InlineStack gap="400" wrap={false}>
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="headingMd" as="h3">Community Members</Text>
                    <Icon source={PersonIcon} tone="base" />
                  </InlineStack>
                  <Text variant="heading2xl" as="span">1,247</Text>
                  <Badge tone="success" size="small">+24 this week</Badge>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="headingMd" as="h3">Ubuntu Score</Text>
                    <Icon source={HeartIcon} tone="base" />
                  </InlineStack>
                  <Text variant="heading2xl" as="span">96%</Text>
                  <Badge tone="success" size="small">Excellent health</Badge>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="headingMd" as="h3">Success Stories</Text>
                    <Icon source={ChartVerticalIcon} tone="base" />
                  </InlineStack>
                  <Text variant="heading2xl" as="span">342</Text>
                  <Badge tone="info" size="small">Growing impact</Badge>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="headingMd" as="h3">Active Projects</Text>
                    <Icon source={AlertCircleIcon} tone="base" />
                  </InlineStack>
                  <Text variant="heading2xl" as="span">67</Text>
                  <Badge tone="warning" size="small">In progress</Badge>
                </BlockStack>
              </Card>
            </InlineStack>

            {/* Recent Activity - Shopify Admin Table Style */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h2">Recent Activity</Text>
                <DataTable
                  columnContentTypes={['text', 'text', 'text']}
                  headings={['Activity', 'Details', 'Time']}
                  rows={recentActivity}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            {/* Ubuntu Score Card */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Ubuntu Health</Text>
                <div style={{ textAlign: 'center' }}>
                  <Text variant="heading2xl" as="span">96%</Text>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    Community collaboration score
                  </Text>
                </div>
                <Button variant="primary" fullWidth>
                  View Ubuntu Details
                </Button>
              </BlockStack>
            </Card>

            {/* Quick Actions */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Quick Actions</Text>
                <BlockStack gap="200">
                  <Button fullWidth>Start Discussion</Button>
                  <Button fullWidth>Share Success Story</Button>
                  <Button fullWidth>Find Collaborators</Button>
                  <Button fullWidth>Access Community</Button>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Platform Status */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Platform Status</Text>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="span">Community Platform</Text>
                    <Badge tone="success" size="small">Always Free</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="span">Travel Platform</Text>
                    <Badge size="small">Active</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="span">MailSense</Text>
                    <Badge size="small">Active</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="span">Ubuntu AI</Text>
                    <Badge tone="info" size="small">Ready</Badge>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}