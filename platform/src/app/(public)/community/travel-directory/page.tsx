/**
 * Nyuchi Community Travel Directory
 * "I am because we are" - Public travel business directory (no auth required)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plane, MapPin, Search, BadgeCheck, Compass, ExternalLink } from 'lucide-react'

interface TravelBusiness {
  id: string
  business_name: string
  business_type: string
  country: string
  city: string | null
  description: string
  website: string | null
  verification_status: string
}

interface Destination {
  id: string
  name: string
  country: string
  description: string
  highlights: string[]
}

const FEATURED_DESTINATIONS: Destination[] = [
  {
    id: 'victoria-falls',
    name: 'Victoria Falls',
    country: 'Zimbabwe',
    description: 'One of the Seven Natural Wonders of the World.',
    highlights: ['Adventure sports', 'Safari tours', 'Cultural experiences'],
  },
  {
    id: 'serengeti',
    name: 'Serengeti',
    country: 'Tanzania',
    description: 'World-famous for the great wildebeest migration.',
    highlights: ['Wildlife safaris', 'Hot air balloons', 'Luxury camps'],
  },
  {
    id: 'cape-town',
    name: 'Cape Town',
    country: 'South Africa',
    description: 'Mother City with stunning natural beauty.',
    highlights: ['Table Mountain', 'Wine tours', 'Beaches'],
  },
  {
    id: 'masai-mara',
    name: 'Masai Mara',
    country: 'Kenya',
    description: "Africa's most famous wildlife reserve.",
    highlights: ['Big Five', 'Cultural visits', 'Balloon safaris'],
  },
]

const BUSINESS_TYPES = [
  'Tour Operator',
  'Safari Guide',
  'Accommodation',
  'Transport',
  'Activity Provider',
]

const COUNTRIES = ['Zimbabwe', 'South Africa', 'Kenya', 'Tanzania', 'Botswana', 'Zambia']

export default function CommunityTravelDirectoryPage() {
  const [businesses, setBusinesses] = useState<TravelBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [country, setCountry] = useState('')

  const fetchBusinesses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (businessType && businessType !== 'all') params.set('type', businessType)
      if (country && country !== 'all') params.set('country', country)
      params.set('limit', '20')

      const response = await fetch(`/api/community/travel?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.businesses || [])
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    } finally {
      setLoading(false)
    }
  }, [search, businessType, country])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchBusinesses()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchBusinesses])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 md:py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Plane className="h-10 w-10 text-mineral-gold" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              Travel Directory
            </h1>
          </div>
          <p className="opacity-90">
            Discover verified African travel businesses and experiences
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-6">
        {/* Tabs */}
        <Tabs defaultValue="destinations" className="mb-6">
          <TabsList>
            <TabsTrigger value="destinations" className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              Destinations
            </TabsTrigger>
            <TabsTrigger value="businesses" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Travel Businesses
            </TabsTrigger>
          </TabsList>

          {/* Tab: Destinations */}
          <TabsContent value="destinations" className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Featured African Destinations</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURED_DESTINATIONS.map((destination) => (
                <Card
                  key={destination.id}
                  className="overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <div className="h-28 bg-muted flex items-center justify-center">
                    <MapPin className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{destination.name}</h3>
                    <Badge variant="outline" className="mb-2">
                      {destination.country}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-2">
                      {destination.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {destination.highlights.slice(0, 2).map((h) => (
                        <Badge key={h} variant="secondary" className="text-xs">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Travel Businesses */}
          <TabsContent value="businesses" className="mt-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <div className="text-center py-16">
                <Plane className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No travel businesses found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setBusinessType('')
                    setCountry('')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {businesses.map((business) => (
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
                          {business.city
                            ? `${business.city}, ${business.country}`
                            : business.country}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {business.description}
                      </p>
                      {business.website && (
                        <Button variant="ghost" size="sm" className="px-0" asChild>
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Website
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/community">Back to Community</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
