/**
 * Sign Up Page - Brand V5
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

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signInWithGoogle, user, loading } = useAuth();
  const { isDark } = useThemeMode();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp(email, password, name);
      setSuccess('Account created! Please check your email to verify your account.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
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
          <Text style={[styles.title, { color: colors.text }]}>Join Our Community</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Create your account to start contributing
          </Text>
          <Text style={[styles.ubuntuText, { color: nyuchiColors.sunsetDeep }]}>
            &quot;I am because we are&quot;
          </Text>

          {/* Error/Success Alerts */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          {/* Google Sign Up */}
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
              or sign up with email
            </Text>
            <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          {/* Form */}
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoCapitalize="words"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={nyuchiColors.sunsetDeep}
            left={<TextInput.Icon icon="account" />}
          />

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
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Minimum 8 characters
          </Text>

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={nyuchiColors.sunsetDeep}
            left={<TextInput.Icon icon="lock-check" />}
          />

          <Button
            mode="contained"
            style={[styles.submitButton, { backgroundColor: nyuchiColors.sunsetDeep }]}
            labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
            contentStyle={styles.buttonContent}
            onPress={handleSubmit}
            disabled={isSubmitting || !!success}
            loading={isSubmitting}
          >
            Create Account
          </Button>

          {/* Links */}
          <View style={styles.linksContainer}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Pressable
              onPress={() =>
                router.push(`/sign-in${redirectUrl !== '/dashboard' ? `?redirect=${redirectUrl}` : ''}`)
              }
            >
              <Text style={[styles.linkTextHighlight, { color: nyuchiColors.sunsetDeep }]}>
                Sign in
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

export default function SignUpPage() {
  return (
    <GlobalLayout hideMobileNav>
      <Suspense fallback={<LoadingFallback />}>
        <SignUpContent />
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
  successContainer: {
    backgroundColor: '#D1FAE5',
    borderRadius: borderRadius.button,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 14,
    color: '#059669',
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
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  helperText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
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
