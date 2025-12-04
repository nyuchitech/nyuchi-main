/**
 * 🇿🇼 Community Travel API Route (Public)
 * "I am because we are" - Public access to verified travel businesses
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const country = searchParams.get('country');
    const search = searchParams.get('search');

    // Try to get from backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      if (type) params.set('type', type);
      if (country) params.set('country', country);
      if (search) params.set('search', search);

      const response = await fetch(`${apiUrl}/api/community/travel?${params}`);
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Return demo data for travel businesses
    const demoBusinesses = [
      {
        id: 'demo-1',
        business_name: 'Victoria Falls Safari Tours',
        business_type: 'Tour Operator',
        country: 'Zimbabwe',
        city: 'Victoria Falls',
        description: 'Experience the majesty of Victoria Falls with our expert guides. We offer walking safaris, sunset cruises, and helicopter flights over the falls.',
        website: 'https://example.com',
        verification_status: 'approved',
      },
      {
        id: 'demo-2',
        business_name: 'Hwange Wildlife Safaris',
        business_type: 'Safari Guide',
        country: 'Zimbabwe',
        city: 'Hwange',
        description: "Discover the incredible wildlife of Hwange National Park with our experienced rangers. Home to Africa's largest elephant population.",
        website: null,
        verification_status: 'approved',
      },
      {
        id: 'demo-3',
        business_name: 'Cape Town Adventures',
        business_type: 'Activity Provider',
        country: 'South Africa',
        city: 'Cape Town',
        description: 'Table Mountain hikes, wine tours, and coastal adventures. Experience the best of the Mother City with local experts.',
        website: 'https://example.com',
        verification_status: 'approved',
      },
      {
        id: 'demo-4',
        business_name: 'Masai Mara Expeditions',
        business_type: 'Tour Operator',
        country: 'Kenya',
        city: 'Nairobi',
        description: 'Witness the great migration and experience authentic Maasai culture. Luxury camps and expert wildlife guides.',
        website: 'https://example.com',
        verification_status: 'approved',
      },
    ];

    // Filter based on search params
    let filtered = demoBusinesses;

    if (type) {
      filtered = filtered.filter((b) => b.business_type === type);
    }

    if (country) {
      filtered = filtered.filter((b) => b.country === country);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.business_name.toLowerCase().includes(searchLower) ||
          b.description.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ businesses: filtered.slice(0, limit) });
  } catch (error) {
    console.error('Community travel error:', error);
    return NextResponse.json({ businesses: [] });
  }
}
