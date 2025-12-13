/**
 * 🇿🇼 Nyuchi Platform - AI Routes
 * "I am because we are" - DeepSeek AI integration via Cloudflare AI Gateway
 */

import { Hono } from 'hono';
import { authMiddleware } from '../lib/auth';
import { streamSSE } from 'hono/streaming';
import { Env } from '../index';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const ai = new Hono<{ Bindings: Env }>();

/**
 * POST /api/ai/chat
 * Chat with DeepSeek AI (authenticated)
 */
ai.post('/chat', authMiddleware, async (c) => {
  try {
    const { messages, system } = await c.req.json();

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'messages array required' }, 400);
    }

    // Prepend system message if provided
    const allMessages = system
      ? [{ role: 'system', content: system }, ...messages]
      : [
          {
            role: 'system',
            content:
              'You are a helpful AI assistant for the Nyuchi Africa Platform. Our philosophy is Ubuntu: "I am because we are". Help users with their questions about African entrepreneurship, business, and community building.',
          },
          ...messages,
        ];

    // Call DeepSeek via Cloudflare AI Gateway
    const response = await fetch(
      `${c.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT}/deepseek/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${c.env.AI_GATEWAY_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: allMessages,
          max_tokens: 4096,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = (await response.json()) as DeepSeekResponse;

    return c.json({
      message: data.choices[0].message.content,
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
 * Stream chat with DeepSeek AI (authenticated)
 */
ai.post('/stream', authMiddleware, async (c) => {
  const { messages, system } = await c.req.json();

  if (!messages || !Array.isArray(messages)) {
    return c.json({ error: 'messages array required' }, 400);
  }

  // Prepend system message if provided
  const allMessages = system
    ? [{ role: 'system', content: system }, ...messages]
    : [
        {
          role: 'system',
          content:
            'You are a helpful AI assistant for the Nyuchi Africa Platform. Our philosophy is Ubuntu: "I am because we are". Help users with their questions about African entrepreneurship, business, and community building.',
        },
        ...messages,
      ];

  return streamSSE(c, async (stream) => {
    try {
      // Call DeepSeek via Cloudflare AI Gateway with streaming
      const response = await fetch(
        `${c.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT}/deepseek/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${c.env.AI_GATEWAY_TOKEN}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: allMessages,
            max_tokens: 4096,
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
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

              if (parsed.choices?.[0]?.delta?.content) {
                await stream.writeSSE({
                  data: JSON.stringify({
                    type: 'delta',
                    text: parsed.choices[0].delta.content,
                  }),
                });
              }
            } catch {
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

    const response = await fetch(
      `${c.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT}/deepseek/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${c.env.AI_GATEWAY_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert content editor for African business content. Provide constructive suggestions to improve clarity, engagement, and SEO. Focus on African entrepreneurship context.',
            },
            {
              role: 'user',
              content: `Please review this ${contentType || 'article'} and provide suggestions for improvement:\n\nTitle: ${title}\n\nContent:\n${content}\n\nProvide 3-5 specific, actionable suggestions.`,
            },
          ],
          max_tokens: 2048,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = (await response.json()) as DeepSeekResponse;

    return c.json({
      suggestions: data.choices[0].message.content,
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

    const response = await fetch(
      `${c.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT}/deepseek/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${c.env.AI_GATEWAY_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content:
                'You are a content moderator for an African business directory. Review listings for quality, completeness, and appropriateness. Flag any concerns.',
            },
            {
              role: 'user',
              content: `Review this directory listing:\n\nBusiness: ${businessName}\nCategory: ${category}\nWebsite: ${website || 'N/A'}\nDescription: ${description}\n\nProvide: 1) Overall assessment (approve/review/reject), 2) Quality score (1-10), 3) Any concerns or suggestions.`,
            },
          ],
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = (await response.json()) as DeepSeekResponse;

    return c.json({
      review: data.choices[0].message.content,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Listing review error:', error);
    return c.json({ error: 'Failed to generate review' }, 500);
  }
});

export default ai;
