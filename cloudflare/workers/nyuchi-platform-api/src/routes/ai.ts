/**
 * AI Routes - AI-powered features via Cloudflare AI Gateway
 */

import { Hono } from 'hono';
import type { ApiEnv } from '@nyuchi/workers-shared';
import { authMiddleware } from '../middleware/auth';

const ai = new Hono<{ Bindings: ApiEnv }>();

// Type for AI Gateway response
interface AIGatewayResponse {
  choices?: Array<{
    message?: {
      content?: string;
      role?: string;
    };
  }>;
}

/**
 * POST /api/ai/chat - Chat with AI assistant
 */
ai.post('/chat', authMiddleware, async (c) => {
  try {
    const { messages, stream } = await c.req.json();

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'messages array required' }, 400);
    }

    const response = await fetch(c.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.AI_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant for Nyuchi, an African business platform.
            You help users with business advice, directory listings, and community engagement.
            Always be respectful of African culture and business practices.
            The Ubuntu philosophy "I am because we are" guides our community.`,
          },
          ...messages,
        ],
        stream: stream || false,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    if (stream) {
      // Return streaming response
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const data: AIGatewayResponse = await response.json();

    return c.json({
      data: data.choices?.[0]?.message || data,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return c.json({ error: 'AI service unavailable' }, 500);
  }
});

/**
 * POST /api/ai/analyze-listing - Analyze a directory listing
 */
ai.post('/analyze-listing', authMiddleware, async (c) => {
  try {
    const { listing } = await c.req.json();

    if (!listing) {
      return c.json({ error: 'listing data required' }, 400);
    }

    const response = await fetch(c.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.AI_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are reviewing business listings for quality.
            Analyze the listing and provide suggestions for improvement.
            Be constructive and helpful. Focus on: completeness, clarity, and professionalism.
            Return a JSON object with: score (1-10), suggestions (array), and summary (string).`,
          },
          {
            role: 'user',
            content: `Analyze this business listing:\n${JSON.stringify(listing, null, 2)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data: AIGatewayResponse = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Try to parse as JSON
    let analysis;
    try {
      analysis = content ? JSON.parse(content) : null;
    } catch {
      analysis = { summary: content, score: 5, suggestions: [] };
    }

    return c.json({
      data: analysis,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('AI analyze error:', error);
    return c.json({ error: 'AI service unavailable' }, 500);
  }
});

/**
 * POST /api/ai/suggest-content - Get content suggestions
 */
ai.post('/suggest-content', authMiddleware, async (c) => {
  try {
    const { topic, type } = await c.req.json();

    if (!topic) {
      return c.json({ error: 'topic required' }, 400);
    }

    const response = await fetch(c.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.AI_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a content advisor for Nyuchi, an African business platform.
            Suggest content ideas that would be valuable for African entrepreneurs.
            Focus on practical, actionable advice relevant to African business contexts.
            Return a JSON object with: title, outline (array of sections), and targetAudience.`,
          },
          {
            role: 'user',
            content: `Suggest a ${type || 'article'} about: ${topic}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data: AIGatewayResponse = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let suggestion;
    try {
      suggestion = content ? JSON.parse(content) : null;
    } catch {
      suggestion = { title: topic, outline: [], targetAudience: 'African entrepreneurs' };
    }

    return c.json({
      data: suggestion,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('AI suggest error:', error);
    return c.json({ error: 'AI service unavailable' }, 500);
  }
});

export default ai;
