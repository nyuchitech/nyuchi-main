import { Page, Card, BlockStack, Text, Button } from '@shopify/polaris';
import { Link } from "react-router";

export default function SignOut() {
  return (
    <Page
      title="🇿🇼 Ubuntu Farewell"
      subtitle="Thank you for contributing to our community"
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
                👋 Goodbye from Nyuchi
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                "I am because we are" - Your contributions remain part of our community
              </Text>
            </div>

            <div style={{ 
              padding: '1.5rem',
              backgroundColor: '#f6f6f7',
              borderRadius: '8px',
              border: '2px solid #00A651',
              textAlign: 'center'
            }}>
              <Text variant="bodyLg" as="p">
                ✅ You have been successfully signed out
              </Text>
            </div>

            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                🌍 Community Impact
              </Text>
              <Text variant="bodyMd" as="p">
                Thank you for being part of the Ubuntu philosophy at Nyuchi Africa Platform. 
                Your participation strengthens our community of African entrepreneurs.
              </Text>
              
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/auth/signin">
                  <Button variant="primary" size="large">
                    🔐 Sign In Again
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
              textAlign: 'center',
              borderTop: '1px solid #e1e3e5',
              paddingTop: '1rem'
            }}>
              <Text variant="bodySm" as="p" tone="subdued">
                🇿🇼 Zimbabwe Green • 🟠 Ubuntu Orange • Always Welcome Back
              </Text>
            </div>
          </BlockStack>
        </Card>
      </div>
    </Page>
  );
}