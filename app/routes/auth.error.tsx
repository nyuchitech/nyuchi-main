import { Page, Card, BlockStack, Text, Button, Banner } from '@shopify/polaris';
import { Link, useSearchParams } from "react-router";

export default function AuthError() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  
  return (
    <Page
      title="🇿🇼 Authentication Challenge"
      subtitle="Ubuntu Philosophy: We'll help you reconnect with our community"
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        padding: '2rem'
      }}>
        <Card>
          <BlockStack gap="600">
            <div style={{ textAlign: 'center' }}>
              <Text variant="headingLg" as="h1">
                🔍 Authentication Issue
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                "I am because we are" - Let's get you back to the community
              </Text>
            </div>

            <Banner tone="warning">
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">
                  <strong>Ubuntu Support:</strong> We encountered an issue with your authentication.
                </Text>
                {error && (
                  <Text variant="bodySm" as="p">
                    Technical details: {error}
                  </Text>
                )}
              </BlockStack>
            </Banner>

            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                🛠️ What can you do:
              </Text>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><Text variant="bodyMd" as="span">Try signing in again with Passage ID</Text></li>
                <li><Text variant="bodyMd" as="span">Check your internet connection</Text></li>
                <li><Text variant="bodyMd" as="span">Clear your browser cache and cookies</Text></li>
                <li><Text variant="bodyMd" as="span">Contact our Ubuntu community support</Text></li>
              </ul>
              
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/auth/signin">
                  <Button variant="primary" size="large">
                    🔐 Try Sign In Again
                  </Button>
                </Link>
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/home">
                    <Button variant="tertiary">
                      🏠 Return Home
                    </Button>
                  </Link>
                </div>
              </div>
            </BlockStack>

            <div style={{ 
              padding: '1.5rem',
              backgroundColor: '#f6f6f7',
              borderRadius: '8px',
              border: '2px solid #E95420'
            }}>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h3">
                  🟠 Ubuntu Community Support
                </Text>
                <Text variant="bodyMd" as="p">
                  If you continue to experience issues, our community is here to help. 
                  Remember: "I am because we are" - your success is our success.
                </Text>
              </BlockStack>
            </div>

            <div style={{ 
              textAlign: 'center',
              borderTop: '1px solid #e1e3e5',
              paddingTop: '1rem'
            }}>
              <Text variant="bodySm" as="p" tone="subdued">
                🇿🇼 Secure authentication with Passage ID • Ubuntu Philosophy
              </Text>
            </div>
          </BlockStack>
        </Card>
      </div>
    </Page>
  );
}