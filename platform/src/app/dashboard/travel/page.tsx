/**
 * Nyuchi Travel Platform Dashboard
 * "I am because we are" - Discover African destinations and travel businesses
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Plane,
  Building2,
  MapPin,
  Search,
  Plus,
  BadgeCheck,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TravelBusiness {
  id: string
  business_name: string
  business_type: string
  country: string
  city: string | null
  description: string
  verification_status: string
  image_url: string | null
}

interface Destination {
  id: string
  name: string
  country: string
  description: string
  image_url: string | null
  highlights: string[]
}

const FEATURED_DESTINATIONS: Destination[] = [
  {
    id: 'victoria-falls',
    name: 'Victoria Falls',
    country: 'Zimbabwe',
    description: 'One of the Seven Natural Wonders of the World, known locally as "Mosi-oa-Tunya" - The Smoke That Thunders.',
    image_url: '/images/destinations/victoria-falls.jpg',
    highlights: ['Bungee jumping', 'White water rafting', 'Safari tours', 'Helicopter flights'],
  },
  {
    id: 'great-zimbabwe',
    name: 'Great Zimbabwe',
    country: 'Zimbabwe',
    description: 'Ancient stone city and UNESCO World Heritage Site, showcasing remarkable African architectural achievements.',
    image_url: '/images/destinations/great-zimbabwe.jpg',
    highlights: ['Historical tours', 'Archaeological sites', 'Cultural experiences', 'Bird watching'],
  },
  {
    id: 'hwange',
    name: 'Hwange National Park',
    country: 'Zimbabwe',
    description: "Zimbabwe's largest game reserve, home to one of Africa's largest elephant populations.",
    image_url: '/images/destinations/hwange.jpg',
    highlights: ['Big Five safaris', 'Night drives', 'Walking safaris', 'Bird watching'],
  },
  {
    id: 'cape-town',
    name: 'Cape Town',
    country: 'South Africa',
    description: 'Mother City at the foot of Table Mountain, blending natural beauty with urban sophistication.',
    image_url: '/images/destinations/cape-town.jpg',
    highlights: ['Table Mountain', 'Wine tours', 'Beaches', 'Cultural experiences'],
  },
]

export default function TravelDashboardPage() {
  const [tabValue, setTabValue] = useState('destinations')
  const [businesses, setBusinesses] = useState<TravelBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchTravelBusinesses() {
      try {
        const response = await fetch('/api/travel/businesses?limit=12')
        if (response.ok) {
          const data = await response.json()
          setBusinesses(data.businesses || [])
        }
      } catch (error) {
        console.error('Failed to fetch travel businesses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTravelBusinesses()
  }, [])

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plane className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Travel Platform</h1>
            <p className="text-sm text-muted-foreground">
              Discover African destinations and connect with verified travel businesses
            </p>
          </div>
        </div>
        <Button asChild className="hidden sm:flex">
          <Link href="/dashboard/travel/new">
            <Plus className="h-4 w-4 mr-2" />
            List Your Business
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tabValue} onValueChange={setTabValue} className="mb-6">
        <TabsList>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="businesses">Travel Businesses</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
        </TabsList>

        {/* Tab: Destinations */}
        <TabsContent value="destinations" className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Featured Destinations</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_DESTINATIONS.map((destination) => (
              <Card
                key={destination.id}
                className="overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform"
              >
                <div className="h-40 bg-muted flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{destination.name}</h3>
                  <Badge variant="outline" className="mb-2">
                    {destination.country}
                  </Badge>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {destination.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {destination.highlights.slice(0, 2).map((highlight) => (
                      <Badge key={highlight} variant="secondary" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <Link href="/community/travel-directory">
                Explore All Destinations
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Tab: Travel Businesses */}
        <TabsContent value="businesses" className="mt-6">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search travel businesses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Business Grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/5 mb-2" />
                    <Skeleton className="h-4 w-2/5 mb-3" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No travel businesses listed yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to list your travel business!
              </p>
              <Button asChild>
                <Link href="/dashboard/travel/new">List Your Business</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {businesses
                .filter((b) => b.business_name.toLowerCase().includes(search.toLowerCase()))
                .map((business) => (
                  <Card key={business.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold flex-1 truncate">
                          {business.business_name}
                        </h3>
                        {business.verification_status === 'approved' && (
                          <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="outline">{business.business_type}</Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {business.city ? `${business.city}, ${business.country}` : business.country}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {business.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: My Listings */}
        <TabsContent value="my-listings" className="mt-6">
          <div className="text-center py-12">
            <Plane className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              You haven&apos;t listed any travel businesses yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              List your tour company, guide services, or accommodation to reach travelers
            </p>
            <Button asChild>
              <Link href="/dashboard/travel/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Ubuntu Philosophy */}
      <Card className="mt-8 bg-[var(--zimbabwe-green)]/5 border-[var(--zimbabwe-green)]/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Ubuntu Travel Philosophy</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            &quot;I am because we are&quot; - Our travel platform connects verified African tourism businesses
            with travelers seeking authentic experiences. By listing your business, you contribute to
            sustainable tourism and help showcase Africa&apos;s incredible destinations to the world.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
