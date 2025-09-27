/**
 * Real-time Community Activity Stream
 * 
 * This route provides Server-Sent Events for live community activity updates.
 * No authentication required - Ubuntu principle: Community data is always accessible.
 * 
 * URL: /api/community/activity-stream
 * Method: GET
 * Content-Type: text/event-stream
 */

import type { LoaderFunctionArgs } from "react-router";
import { createUbuntuDatabase } from "~/lib/database.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Community activity streaming is always free - Ubuntu principle
  
  try {
    // Create SSE stream for real-time community updates
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial Ubuntu welcome
        const welcomeData = {
          type: 'welcome',
          philosophy: 'I am because we are',
          ubuntu_message: 'Welcome to our Ubuntu community live stream',
          community_always_free: true,
          african_context: true,
          timestamp: new Date().toISOString(),
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(welcomeData)}\n\n`));

        // Get initial database context
        const env = getCloudflareEnv(request);
        const db = createUbuntuDatabase(env);

        let interval: NodeJS.Timeout | null = null;

        try {
          // Send periodic community activity updates
          interval = setInterval(async () => {
            try {
              const activity = await db.getRealtimeCommunityActivity();
              
              const activityData = {
                type: 'community_activity',
                data: activity,
                ubuntu_pulse: activity.ubuntu_pulse,
                philosophy: 'I am because we are',
                timestamp: new Date().toISOString(),
              };
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(activityData)}\n\n`));
              
              // Send heartbeat to keep connection alive
              controller.enqueue(encoder.encode(`: Ubuntu heartbeat - community growing stronger\n\n`));
              
            } catch (dbError) {
              const errorData = {
                type: 'error',
                ubuntu_message: 'Community data temporarily unavailable - Ubuntu resilience in action',
                philosophy: 'I am because we are',
                error: 'Database connection challenge',
                community_support: 'Our strength helps overcome technical difficulties',
                timestamp: new Date().toISOString(),
              };
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
            }
          }, 30000); // Update every 30 seconds

          // Send immediate activity update
          const initialActivity = await db.getRealtimeCommunityActivity();
          const initialData = {
            type: 'community_activity',
            data: initialActivity,
            ubuntu_pulse: initialActivity.ubuntu_pulse,
            philosophy: 'I am because we are',
            timestamp: new Date().toISOString(),
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

        } catch (error) {
          const errorData = {
            type: 'error',
            ubuntu_message: 'Ubuntu community stream facing temporary challenges',
            philosophy: 'I am because we are',
            error: error instanceof Error ? error.message : 'Unknown error',
            community_support: 'Together we overcome all challenges',
            timestamp: new Date().toISOString(),
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          
          // Cleanup
          if (interval) {
            clearInterval(interval);
          }
          controller.close();
        }
      },

      cancel() {
        console.log('Ubuntu community activity stream cancelled by client');
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Ubuntu-Philosophy': 'I am because we are',
        'X-Community-Always-Free': 'true',
        'X-African-Context': 'true',
      },
    });

  } catch (error) {
    console.error('Ubuntu community activity stream error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Community activity stream unavailable',
        ubuntu_message: 'Our community pulse is temporarily quiet - but Ubuntu spirit remains strong',
        philosophy: 'I am because we are',
        community_support: 'Try refreshing - our community always welcomes you back',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Utility to get Cloudflare environment (same as AI stream)
function getCloudflareEnv(request: Request): any {
  // In production Cloudflare Pages deployment:
  // return (request as any).env;
  
  // Development mock
  return {
    NY_PLATFORM_DB: null,
    NY_AUTH_DB: null, 
    NY_SHARED_RESOURCES: null,
    UBUNTU_PHILOSOPHY: 'I am because we are',
    COMMUNITY_ALWAYS_FREE: 'true',
  };
}