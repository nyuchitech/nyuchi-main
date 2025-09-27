import { Page, Layout, Card, BlockStack, Text } from '@shopify/polaris';
import { useEffect } from 'react';
import { isUserAuthenticated } from '~/lib/auth';
import { useNavigate } from 'react-router';

export default function SignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    async function checkAuth() {
      if (await isUserAuthenticated()) {
        navigate('/');
      }
    }
    checkAuth();
  }, [navigate]);

  // Handle successful authentication
  useEffect(() => {
    const handleAuthSuccess = () => {
      navigate('/');
    };

    // Listen for Passage authentication events
    if (typeof window !== 'undefined') {
      window.addEventListener('passage-auth-success', handleAuthSuccess);
      return () => window.removeEventListener('passage-auth-success', handleAuthSuccess);
    }
  }, [navigate]);

  return (
    <Page title="🇿🇼 Welcome to Nyuchi Platform">
      <Layout>
        <Layout.Section>
          <div style={{ maxWidth: '480px', margin: '0 auto', padding: '64px 16px' }}>
            <Card>
              <BlockStack gap="500">
                <div style={{ textAlign: 'center' }}>
                  <Text variant="headingXl" as="h1">
                    🇿🇼 Nyuchi Africa Platform
                  </Text>
                  <Text variant="bodyLg" as="p" tone="subdued">
                    "I am because we are" - Ubuntu Philosophy
                  </Text>
                </div>
                
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Sign in to your account
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Join our community of African entrepreneurs building the future together.
                  </Text>
                </BlockStack>

                {/* Embedded Passage Authentication */}
                <div 
                  dangerouslySetInnerHTML={{
                    __html: '<passage-auth app-id="Lnv7cRQrfjdrD34CsTozgUu9"></passage-auth>'
                  }}
                />

                <div style={{ padding: '16px', backgroundColor: '#f6f6f7', borderRadius: '8px' }}>
                  <Text variant="bodySm" as="p" tone="subdued">
                    🟢 Community features are always free - no account required for /community routes
                  </Text>
                  <Text variant="bodySm" as="p" tone="subdued">
                    🟡 Business tools require authentication for personalized experience
                  </Text>
                  <Text variant="bodySm" as="p" tone="subdued">
                    🔴 Your data is secured with enterprise-grade encryption
                  </Text>
                </div>
              </BlockStack>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
