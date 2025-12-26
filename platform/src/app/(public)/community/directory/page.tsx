/**
 * Nyuchi Community Directory
 * "I am because we are" - Public business directory (no auth required)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Building2, MapPin, BadgeCheck, ExternalLink } from 'lucide-react'

interface Listing {
  id: string
  business_name: string
  business_type: string
  category: string
  country: string
  city: string | null
  description: string
  website: string | null
  verification_status: string
  created_at: string
}

interface Categories {
  directory_categories: string[]
  countries: string[]
}

export default function CommunityDirectoryPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Categories | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [country, setCountry] = useState('')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (country) params.set('country', country)
      params.set('limit', '20')

      const response = await fetch(`/api/community/directory?${params}`)
      if (response.ok) {
        const data = await response.json()
        setListings(data.listings || [])
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }, [search, category, country])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/community/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchListings()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchListings])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 md:py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Business Directory
          </h1>
          <p className="opacity-90">
            Discover African businesses and entrepreneurs
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-6">
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
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.directory_categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {categories?.countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No businesses found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setCategory('')
                setCountry('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-semibold text-lg flex-1">
                      {listing.business_name}
                    </h2>
                    {listing.verification_status === 'approved' && (
                      <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{listing.category}</Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.city ? `${listing.city}, ${listing.country}` : listing.country}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {listing.description}
                  </p>
                  {listing.website && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-0"
                      asChild
                    >
                      <a
                        href={listing.website}
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
