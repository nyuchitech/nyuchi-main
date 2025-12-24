/**
 * Sign In Page - Brand V5
 * Built with React Native Paper
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Button, TextInput, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { useAuth } from '@/lib/auth-context';
import { useThemeMode } from '@/components/PaperProvider';
import { GlobalLayout } from '@/components/GlobalLayout';
import { nyuchiColors, borderRadius } from '@/theme/nyuchi-theme';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, user, loading } = useAuth();
  const { isDark } = useThemeMode();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const colors = isDark ? nyuchiColors.dark : nyuchiColors.light;

  useEffect(() => {
    if (user && !loading) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      router.push(redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={nyuchiColors.sunsetDeep} />
      </View>
    );
  }

  return (
    <View style={styles.mainContent}>
      <Card style={[styles.card, { backgroundColor: colors.card }]} mode="elevated">
        <Card.Content style={styles.cardContent}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to continue to Nyuchi Platform
          </Text>
          <Text style={[styles.ubuntuText, { color: nyuchiColors.sunsetDeep }]}>
            &quot;I am because we are&quot;
          </Text>

          {/* Error Alert */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Google Sign In */}
          <Button
            mode="outlined"
            style={[styles.googleButton, { borderColor: colors.border }]}
            labelStyle={[styles.buttonLabel, { color: colors.text }]}
            contentStyle={styles.buttonContent}
            icon="google"
            onPress={handleGoogleSignIn}
          >
            Continue with Google
          </Button>

          <View style={styles.dividerContainer}>
            <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              or sign in with email
            </Text>
            <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          {/* Form */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={nyuchiColors.sunsetDeep}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={nyuchiColors.sunsetDeep}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Button
            mode="contained"
            style={[styles.submitButton, { backgroundColor: nyuchiColors.sunsetDeep }]}
            labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
            contentStyle={styles.buttonContent}
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Sign In
          </Button>

          {/* Links */}
          <View style={styles.linksContainer}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              Don&apos;t have an account?{' '}
            </Text>
            <Pressable
              onPress={() =>
                router.push(`/sign-up${redirectUrl !== '/dashboard' ? `?redirect=${redirectUrl}` : ''}`)
              }
            >
              <Text style={[styles.linkTextHighlight, { color: nyuchiColors.sunsetDeep }]}>
                Sign up
              </Text>
            </Pressable>
          </View>

          <Pressable style={styles.backLink} onPress={() => router.push('/')}>
            <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>
              Back to Home
            </Text>
          </Pressable>
        </Card.Content>
      </Card>
    </View>
  );
}

function LoadingFallback() {
  const { isDark } = useThemeMode();
  const colors = isDark ? nyuchiColors.dark : nyuchiColors.light;

  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={nyuchiColors.sunsetDeep} />
    </View>
  );
}

export default function SignInPage() {
  return (
    <GlobalLayout hideMobileNav>
      <Suspense fallback={<LoadingFallback />}>
        <SignInContent />
      </Suspense>
    </GlobalLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: borderRadius.card,
  },
  cardContent: {
    padding: 32,
  },
  title: {
    fontFamily: 'Noto Serif, Georgia, serif',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
  },
  ubuntuText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.button,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
  googleButton: {
    borderRadius: borderRadius.button,
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 13,
    paddingHorizontal: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  submitButton: {
    borderRadius: borderRadius.button,
    marginTop: 8,
    marginBottom: 24,
  },
  buttonLabel: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '600',
    fontSize: 15,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  linkText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 14,
  },
  linkTextHighlight: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 14,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 14,
  },
});
