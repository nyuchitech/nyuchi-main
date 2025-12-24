/**
 * Nyuchi Platform - Settings & Profile
 * User preferences and account management
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/components/theme-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  company: string | null
  country: string | null
  role: string
  ubuntu_score: number
  contribution_count: number
  created_at: string
}

export default function SettingsPage() {
  const { user, token, refreshUser } = useAuth()
  const { theme: mode, setTheme: setMode } = useTheme()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Form fields
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || !token) return

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profiles/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          setProfile(data)
          setFullName(data.full_name || '')
          setCompany(data.company || '')
          setCountry(data.country || '')
          setAvatarUrl(data.avatar_url || '')
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id, token])

  const handleSave = async () => {
    if (!user?.id || !token) return

    setSuccess('')
    setError('')
    setSaving(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profiles/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          company: company || null,
          country: country || null,
          avatar_url: avatarUrl || null,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update profile')
      }

      const updated = await res.json()
      setProfile(updated)

      // Refresh user in global auth context
      await refreshUser()

      setSuccess('Settings saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {success && (
        <Alert className="mb-4 border-mineral-malachite bg-mineral-malachite/10">
          <CheckCircle className="h-4 w-4 text-mineral-malachite" />
          <AlertDescription className="text-mineral-malachite flex items-center justify-between">
            {success}
            <button onClick={() => setSuccess('')}>
              <span className="sr-only">Dismiss</span>
            </button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <button onClick={() => setError('')}>
              <span className="sr-only">Dismiss</span>
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20 text-2xl">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {fullName?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {fullName || profile?.email?.split('@')[0]}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.role || 'User'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile?.email || ''}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Your company name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Zimbabwe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avatarUrl">Avatar URL</Label>
                      <Input
                        id="avatarUrl"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      <p className="text-xs text-muted-foreground">
                        URL to your profile picture
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={profile?.role || 'user'}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Contact admin to change your role
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="mb-3 block">Theme</Label>
              <RadioGroup
                value={mode}
                onValueChange={(value) => setMode(value as 'light' | 'dark' | 'system')}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="font-normal cursor-pointer">
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="font-normal cursor-pointer">
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="font-normal cursor-pointer">
                    System (Auto)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Ubuntu Score
                </p>
                <p className="text-3xl font-bold text-primary">
                  {profile?.ubuntu_score || 0}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Contributions
                </p>
                <p className="text-2xl font-semibold">
                  {profile?.contribution_count || 0}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Member Since
                </p>
                <p className="text-sm">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : 'Recently'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            size="lg"
            className="w-full"
            disabled={saving || loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
