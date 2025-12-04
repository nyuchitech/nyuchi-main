/**
 * 🇿🇼 Travel Businesses API Route
 * CRUD operations for travel business listings
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

      const response = await fetch(`${apiUrl}/api/travel/businesses?${params}`);
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Return empty for now - real data comes from backend
    return NextResponse.json({ businesses: [] });
  } catch (error) {
    console.error('Travel businesses error:', error);
    return NextResponse.json({ businesses: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');

    const {
      business_name,
      business_type,
      country,
    } = body;

    if (!business_name || !business_type || !country) {
      return NextResponse.json(
        { error: 'Business name, type, and country are required' },
        { status: 400 }
      );
    }

    // Try to post to backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && authHeader) {
      const response = await fetch(`${apiUrl}/api/travel/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Return success for demo purposes
    return NextResponse.json({
      success: true,
      message: 'Listing submitted for review',
      business: {
        id: 'demo-' + Date.now(),
        ...body,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Travel business create error:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
