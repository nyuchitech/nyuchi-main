/**
 * 🇿🇼 Dashboard Stats API Route
 * Proxies to backend API or returns fallback stats
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Try to get stats from backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      const authHeader = request.headers.get('Authorization');
      const response = await fetch(`${apiUrl}/api/dashboard/stats`, {
        headers: authHeader ? { Authorization: authHeader } : {},
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Return fallback stats
    return NextResponse.json({
      stats: {
        directory_listings: 0,
        published_content: 0,
        community_members: 1,
        ubuntu_score: 0,
        monthly_growth: 0,
        total_ubuntu_points: 0,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);

    // Return fallback stats on error
    return NextResponse.json({
      stats: {
        directory_listings: 0,
        published_content: 0,
        community_members: 1,
        ubuntu_score: 0,
        monthly_growth: 0,
        total_ubuntu_points: 0,
      },
    });
  }
}
