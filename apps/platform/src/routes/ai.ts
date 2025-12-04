/**
 * 🇿🇼 Nyuchi Platform - AI Routes
 * "I am because we are" - Claude AI integration endpoints
 */

import { Hono } from 'hono';
import { authMiddleware } from '../lib/auth';
import { streamSSE } from 'hono/streaming';
import { Env } from '../index';

interface ClaudeResponse {
  content: Array<{ text: string }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

const ai = new Hono<{ Bindings: Env }>();

/**
 * POST /api/ai/chat
 * Chat with Claude AI (authenticated)
 */
ai.post('/chat', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { messages, system } = await c.req.json();

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'messages array required' }, 400);
    }

    // Call Claude via Cloudflare AI Gateway
    const response = await fetch(c.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: system || 'You are a helpful AI assistant for the Nyuchi Africa Platform. Our philosophy is Ubuntu: "I am because we are". Help users with their questions about African entrepreneurship, business, and community building.',
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json() as ClaudeResponse;

    return c.json({
      message: data.content[0].text,
      usage: data.usage,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return c.json({ error: 'Failed to process AI request' }, 500);
  }
});

/**
 * POST /api/ai/stream
 * Stream chat with Claude AI (authenticated)
 */
ai.post('/stream', authMiddleware, async (c) => {
  const user = c.get('user');
  const { messages, system } = await c.req.json();

  if (!messages || !Array.isArray(messages)) {
    return c.json({ error: 'messages array required' }, 400);
  }

  return streamSSE(c, async (stream) => {
    try {
      // Call Claude via Cloudflare AI Gateway with streaming
      const response = await fetch(c.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          stream: true,
          system: system || 'You are a helpful AI assistant for the Nyuchi Africa Platform. Our philosophy is Ubuntu: "I am because we are". Help users with their questions about African entrepreneurship, business, and community building.',
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content_block_delta') {
                await stream.writeSSE({
                  data: JSON.stringify({
                    type: 'delta',
                    text: parsed.delta.text,
                  }),
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      await stream.writeSSE({
        data: JSON.stringify({ type: 'done' }),
      });
    } catch (error) {
      console.error('AI stream error:', error);
      await stream.writeSSE({
        data: JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      });
    }
  });
});

/**
 * POST /api/ai/content-suggestions
 * Get AI suggestions for content improvement (authenticated)
 */
ai.post('/content-suggestions', authMiddleware, async (c) => {
  try {
    const { title, content, contentType } = await c.req.json();

    if (!title || !content) {
      return c.json({ error: 'title and content required' }, 400);
    }

    const response = await fetch(c.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: 'You are an expert content editor for African business content. Provide constructive suggestions to improve clarity, engagement, and SEO. Focus on African entrepreneurship context.',
        messages: [
          {
            role: 'user',
            content: `Please review this ${contentType || 'article'} and provide suggestions for improvement:\n\nTitle: ${title}\n\nContent:\n${content}\n\nProvide 3-5 specific, actionable suggestions.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json() as ClaudeResponse;

    return c.json({
      suggestions: data.content[0].text,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Content suggestions error:', error);
    return c.json({ error: 'Failed to generate suggestions' }, 500);
  }
});

/**
 * POST /api/ai/listing-review
 * Get AI review for directory listing (moderator/admin)
 */
ai.post('/listing-review', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Only moderators and admins can use this
    if (user.role !== 'moderator' && user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { businessName, description, category, website } = await c.req.json();

    if (!businessName || !description) {
      return c.json({ error: 'businessName and description required' }, 400);
    }

    const response = await fetch(c.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: 'You are a content moderator for an African business directory. Review listings for quality, completeness, and appropriateness. Flag any concerns.',
        messages: [
          {
            role: 'user',
            content: `Review this directory listing:\n\nBusiness: ${businessName}\nCategory: ${category}\nWebsite: ${website || 'N/A'}\nDescription: ${description}\n\nProvide: 1) Overall assessment (approve/review/reject), 2) Quality score (1-10), 3) Any concerns or suggestions.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json() as ClaudeResponse;

    return c.json({
      review: data.content[0].text,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Listing review error:', error);
    return c.json({ error: 'Failed to generate review' }, 500);
  }
});

export default ai;
