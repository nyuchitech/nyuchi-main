/**
 * Travel Enthusiast Community Page
 * Connect with fellow travelers
 */

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Plane,
  MapPin,
  Briefcase,
  ArrowRight,
  MessageSquare,
} from 'lucide-react'

const MEMBER_BENEFITS = [
  {
    title: 'First-Time Visitors',
    icon: Plane,
    benefits: [
      'Personalized itinerary feedback',
      'Cost and logistics guidance',
      'Cultural norms education',
      'Connect with experienced guides',
    ],
  },
  {
    title: 'Repeat Visitors',
    icon: MapPin,
    benefits: [
      'Discover hidden gems',
      'Share your expertise',
      'Organize group trips',
      'Deep local connections',
    ],
  },
  {
    title: 'Local Zimbabweans',
    icon: Users,
    benefits: [
      'Share insider knowledge',
      'Offer authentic experiences',
      'Network with tourism pros',
      'Promote your region',
    ],
  },
  {
    title: 'Tourism Professionals',
    icon: Briefcase,
    benefits: [
      'Connect with partners',
      'Understand traveler needs',
      'Get service feedback',
      'Authentic engagement',
    ],
  },
]

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-foreground text-background py-8 md:py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-10 w-10 text-primary" />
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">
                Travel Enthusiast Community
              </h1>
              <Badge className="mt-2 bg-white/20 hover:bg-white/30">5,000+ Members</Badge>
            </div>
          </div>
          <p className="opacity-90 max-w-xl mt-2">
            Connect with fellow travelers, share experiences, and discover hidden gems across Zimbabwe and Africa.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-6">
        {/* Platform Cards */}
        <h2 className="text-xl font-semibold mb-4">Join Our Community</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {/* Facebook */}
          <Card className="border-2 border-[#1877F2]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-lg bg-[#1877F2] flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-lg">Facebook Group</p>
                  <p className="text-sm text-muted-foreground">5,000+ active members</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Join our vibrant Facebook community for trip reports, stunning photos, travel recommendations, and weekly &quot;Travel Tuesday&quot; photo sharing sessions.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">Trip Reports</Badge>
                <Badge variant="outline">Photo Sharing</Badge>
                <Badge variant="outline">Recommendations</Badge>
                <Badge variant="outline">Community Discussions</Badge>
              </div>
              <Button
                className="w-full bg-[#1877F2] hover:bg-[#166FE5]"
                asChild
              >
                <a
                  href="https://facebook.com/groups/zimbabwetravelinfo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Facebook Group
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Discord */}
          <Card className="border-2 border-[#5865F2]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-lg bg-[#5865F2] flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Discord Server</p>
                  <p className="text-sm text-muted-foreground">Real-time chat</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Connect in real-time with organized channels by destination and activity type. Join voice channels for group calls and expert Q&A sessions.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">Destination Channels</Badge>
                <Badge variant="outline">Voice Chats</Badge>
                <Badge variant="outline">Expert Q&A</Badge>
                <Badge variant="outline">Real-time Help</Badge>
              </div>
              <Button
                className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
                asChild
              >
                <a
                  href="https://discord.gg/dzHWFB44yw"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Discord Server
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Member Benefits */}
        <h2 className="text-xl font-semibold mb-4">Benefits for Every Member</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {MEMBER_BENEFITS.map((member) => {
            const Icon = member.icon
            return (
              <Card key={member.title}>
                <CardContent className="p-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold mb-2">{member.title}</p>
                  <div className="space-y-1">
                    {member.benefits.map((benefit) => (
                      <p key={benefit} className="text-sm text-muted-foreground">
                        {benefit}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Community Impact */}
        <Card className="bg-mineral-malachite/5 border-mineral-malachite/20 mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Community Impact</h3>
            <p className="text-muted-foreground mb-4">
              Our members actively contribute to Zimbabwe&apos;s tourism ecosystem:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge>Conservation Fundraisers</Badge>
              <Badge>Responsible Tourism Advocacy</Badge>
              <Badge>Collaborative Travel Guides</Badge>
              <Badge>Local Tourism Support</Badge>
              <Badge>Word-of-Mouth Promotion</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Nyuchi Community Link */}
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-2">
            Also Join Our Nyuchi Platform Community
          </h3>
          <p className="text-muted-foreground mb-4">
            Access the forum, directory, leaderboard, and more features on our platform.
          </p>
          <Button size="lg" asChild>
            <Link href="/community">
              Explore Nyuchi Community
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
