/**
 * Volunteer Opportunities Page
 * Contribute to sustainable tourism
 */

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  TreePine,
  GraduationCap,
  Languages,
  Camera,
  Users,
  ArrowRight,
  Mail,
} from 'lucide-react'

const VOLUNTEER_ROLES = [
  {
    id: 'conservation',
    title: 'Conservation Support',
    icon: TreePine,
    description: 'Help document and promote conservation efforts across Zimbabwe wildlife areas.',
    commitment: 'Flexible',
    location: 'Remote / On-site',
    skills: ['Writing', 'Photography', 'Research'],
  },
  {
    id: 'education',
    title: 'Tourism Education',
    icon: GraduationCap,
    description: 'Create educational content about responsible tourism and cultural preservation.',
    commitment: '5-10 hrs/week',
    location: 'Remote',
    skills: ['Teaching', 'Content Creation', 'Tourism Knowledge'],
  },
  {
    id: 'translation',
    title: 'Translation Services',
    icon: Languages,
    description: 'Help translate content into local languages (Shona, Ndebele) and other languages.',
    commitment: 'Per project',
    location: 'Remote',
    skills: ['Shona', 'Ndebele', 'French', 'Portuguese'],
  },
  {
    id: 'content',
    title: 'Content Creation',
    icon: Camera,
    description: 'Contribute photography, videos, and written content about Zimbabwe destinations.',
    commitment: 'Per project',
    location: 'Remote / Travel',
    skills: ['Photography', 'Videography', 'Writing'],
  },
  {
    id: 'community',
    title: 'Community Moderation',
    icon: Users,
    description: 'Help moderate our community forums and social media groups.',
    commitment: '3-5 hrs/week',
    location: 'Remote',
    skills: ['Communication', 'Conflict Resolution', 'Social Media'],
  },
]

export default function VolunteerPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-foreground text-background py-8 md:py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-10 w-10 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              Volunteer Opportunities
            </h1>
          </div>
          <p className="opacity-90 max-w-xl">
            Contribute your skills to sustainable tourism and community development initiatives across Zimbabwe.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-6">
        {/* Impact Statement */}
        <Card className="mb-8 bg-mineral-malachite/5 border-mineral-malachite/20">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Make a Meaningful Impact</h2>
            <p className="text-muted-foreground">
              Our volunteers help promote sustainable tourism, preserve cultural heritage, support conservation efforts, and connect travelers with authentic Zimbabwean experiences. Whether you have a few hours a week or want to contribute to specific projects, there&apos;s a role for you.
            </p>
          </CardContent>
        </Card>

        {/* Volunteer Roles */}
        <h2 className="text-xl font-semibold mb-4">Current Opportunities</h2>
        <div className="space-y-4 mb-8">
          {VOLUNTEER_ROLES.map((role) => {
            const Icon = role.icon
            return (
              <Card key={role.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4 flex-col md:flex-row">
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{role.title}</h3>
                      <p className="text-muted-foreground mb-3">{role.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">Time: {role.commitment}</Badge>
                        <Badge variant="outline">{role.location}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {role.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs bg-primary/10"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button variant="outline" asChild>
                        <a href={`mailto:volunteer@nyuchi.com?subject=Volunteer Application: ${role.title}`}>
                          Apply
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Benefits */}
        <h2 className="text-xl font-semibold mb-4">Volunteer Benefits</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { title: 'Meaningful Impact', desc: 'Contribute to sustainable tourism' },
            { title: 'Skill Development', desc: 'Gain valuable experience' },
            { title: 'Community', desc: 'Connect with like-minded people' },
            { title: 'Recognition', desc: 'Ubuntu points and certificates' },
          ].map((benefit) => (
            <Card key={benefit.title} className="p-4 text-center">
              <p className="font-semibold text-primary">{benefit.title}</p>
              <p className="text-sm text-muted-foreground">{benefit.desc}</p>
            </Card>
          ))}
        </div>

        {/* Contact */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">
              Ready to Make a Difference?
            </h3>
            <p className="text-muted-foreground mb-4">
              Contact us to discuss volunteer opportunities that match your skills and availability.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button size="lg" asChild>
                <a href="mailto:volunteer@nyuchi.com?subject=Volunteer Inquiry">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/get-involved">
                  Other Ways to Get Involved
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
