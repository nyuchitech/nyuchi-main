/**
 * 🇿🇼 Community Activity API Route
 * Real-time activity feed for the community
 */

import { NextRequest, NextResponse } from 'next/server';

interface Activity {
  id: string;
  type: 'member_joined' | 'content_published' | 'business_listed' | 'collaboration' | 'ubuntu_points';
  action: string;
  actor: string;
  timestamp: string;
  ubuntuPoints?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Try to get activity from backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/api/community/activity?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Return demo activity data
    const now = new Date();
    const activities: Activity[] = [
      {
        id: '1',
        type: 'member_joined',
        action: 'Joined Ubuntu Business Network',
        actor: 'New community member',
        timestamp: new Date(now.getTime() - 2 * 60000).toISOString(),
        ubuntuPoints: 50,
      },
      {
        id: '2',
        type: 'content_published',
        action: 'Shared success story',
        actor: 'Tech Startup Zimbabwe',
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
        ubuntuPoints: 100,
      },
      {
        id: '3',
        type: 'business_listed',
        action: 'Listed new business',
        actor: 'Harare Consulting',
        timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
        ubuntuPoints: 75,
      },
      {
        id: '4',
        type: 'collaboration',
        action: 'Started cross-industry collaboration',
        actor: 'Kenya Agri & SA Fintech',
        timestamp: new Date(now.getTime() - 3 * 60 * 60000).toISOString(),
        ubuntuPoints: 200,
      },
      {
        id: '5',
        type: 'member_joined',
        action: 'Joined the community',
        actor: 'Cape Town Entrepreneur',
        timestamp: new Date(now.getTime() - 5 * 60 * 60000).toISOString(),
        ubuntuPoints: 50,
      },
    ];

    return NextResponse.json({ activities: activities.slice(0, limit) });
  } catch (error) {
    console.error('Activity feed error:', error);
    return NextResponse.json({ activities: [] });
  }
}
