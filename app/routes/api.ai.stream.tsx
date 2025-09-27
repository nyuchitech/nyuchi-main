/**
 * Ubuntu AI Server-Sent Events (SSE) Route
 * 
 * This route provides real-time streaming AI responses following Ubuntu philosophy.
 * Connects directly to the existing Ubuntu AI worker and streams responses.
 * 
 * URL: /api/ai/stream
 * Method: POST
 * Content-Type: text/event-stream
 */

import type { ActionFunctionArgs } from "react-router";
import { requireAuth, getAuthenticatedUser } from "~/lib/auth";
import { createUbuntuDatabase } from "~/lib/database.server";

// Ubuntu AI Worker endpoint (from existing infrastructure)
const UBUNTU_AI_WORKER_URL = "https://nyu-ubuntu-ai-prod.nyuchitech.workers.dev";

export async function action({ request }: ActionFunctionArgs) {
  // Only authenticated users can access AI streaming
  // Community can access basic AI, but streaming requires auth for resource management
  await requireAuth(request);
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    return new Response('Authentication required for AI streaming', { status: 401 });
  }

  try {
    const formData = await request.formData();
    const message = formData.get('message') as string;
    const context = formData.get('context') as string;

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    // Get database context for Ubuntu AI
    const env = getCloudflareEnv(request); // This would be available in Cloudflare Pages/Workers
    const db = createUbuntuDatabase(env);
    const aiContext = await db.getUbuntuAIContext();

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial Ubuntu context
        const initialData = {
          type: 'context',
          philosophy: 'I am because we are',
          ubuntu_message: 'Ubuntu AI connecting to serve your business and community',
          user: user.email,
          community_context: aiContext.community_context,
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

        try {
          // Forward to Ubuntu AI Worker with streaming
          const aiResponse = await fetch(`${UBUNTU_AI_WORKER_URL}/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${request.headers.get('Authorization')?.replace('Bearer ', '')}`,
              'X-Ubuntu-Context': 'remix-ssr-streaming',
              'X-User-Email': user.email || '',
              'X-African-Context': 'true',
            },
            body: JSON.stringify({
              message,
              context: context || 'business-support',
              user_context: {
                id: user.id,
                email: user.email,
                ubuntu_member: true,
              },
              community_context: aiContext.community_context,
            }),
          });

          if (!aiResponse.ok) {
            throw new Error(`AI Worker responded with ${aiResponse.status}`);
          }

          // Stream the response from Ubuntu AI Worker
          const reader = aiResponse.body?.getReader();
          if (!reader) {
            throw new Error('No response stream available');
          }

          const decoder = new TextDecoder();
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Send completion message
              const completionData = {
                type: 'complete',
                ubuntu_message: 'Ubuntu AI session complete - your growth strengthens our community',
                philosophy: 'I am because we are',
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));
              break;
            }

            // Forward the chunk from Ubuntu AI Worker
            const chunk = decoder.decode(value);
            
            // Parse and enhance with Ubuntu context if needed
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.substring(6));
                  // Add Ubuntu enhancement to AI responses
                  if (data.type === 'ai_response') {
                    data.ubuntu_enhanced = true;
                    data.community_benefit = 'This AI guidance serves both your success and our collective prosperity';
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                } catch (e) {
                  // Forward as-is if not JSON
                  controller.enqueue(encoder.encode(`${line}\n`));
                }
              } else if (line.trim()) {
                controller.enqueue(encoder.encode(`${line}\n`));
              }
            }
          }

        } catch (error) {
          // Ubuntu-themed error handling
          const errorData = {
            type: 'error',
            ubuntu_message: 'Ubuntu AI temporarily facing challenges - our community supports you',
            philosophy: 'I am because we are',
            error: error instanceof Error ? error.message : 'Unknown error',
            community_support: 'Try again - Ubuntu never gives up on serving the community',
            timestamp: new Date().toISOString(),
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
        } finally {
          controller.close();
        }
      },

      cancel() {
        // Cleanup when client disconnects
        console.log('Ubuntu AI SSE stream cancelled by client');
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Ubuntu-Philosophy': 'I am because we are',
        'X-Community-AI': 'true',
      },
    });

  } catch (error) {
    console.error('Ubuntu AI SSE error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Ubuntu AI streaming unavailable',
        ubuntu_message: 'Our AI community support is temporarily challenged',
        philosophy: 'I am because we are',
        try_again: true,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Utility to get Cloudflare environment (this would be provided by the Remix adapter)
function getCloudflareEnv(request: Request): any {
  // In a real Cloudflare Pages deployment, this would be:
  // return (request as any).env;
  
  // For development, return mock environment
  return {
    NY_PLATFORM_DB: null, // Would be actual D1Database in production
    NY_AUTH_DB: null,
    NY_SHARED_RESOURCES: null,
    UBUNTU_PHILOSOPHY: 'I am because we are',
    COMMUNITY_ALWAYS_FREE: 'true',
  };
}