/**
 * Nyuchi Platform Help Scout Integration
 * Customer support & helpdesk integration
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { BaseEnv, QueueMessage } from '@nyuchi/workers-shared';
import { createServiceClient, isValidUUID } from '@nyuchi/workers-shared';
import {
  createConversation,
  getConversation,
  addNote,
  updateTags,
  getOrCreateCustomer,
  listMailboxes,
  type CreateConversationRequest,
  type HelpScoutCustomer,
} from './helpscout-client';

interface Env extends BaseEnv {
  // Help Scout credentials
  HELPSCOUT_CLIENT_ID: string;
  HELPSCOUT_CLIENT_SECRET: string;
  HELPSCOUT_MAILBOX_ID: string;
  HELPSCOUT_WEBHOOK_SECRET: string;
  HELPSCOUT_API_BASE: string;

  // Bindings
  CACHE: KVNamespace;
  NOTIFICATIONS_QUEUE: Queue<QueueMessage>;
}

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use('*', cors({
  origin: [
    'https://platform.nyuchi.com',
    'https://nyuchi.com',
    'http://localhost:3000',
  ],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Support ticket categories
const TICKET_CATEGORIES = {
  general: 'General Inquiry',
  billing: 'Billing & Payments',
  technical: 'Technical Support',
  listing: 'Directory Listing',
  verification: 'Business Verification',
  account: 'Account Issues',
  feedback: 'Feedback & Suggestions',
} as const;

type TicketCategory = keyof typeof TICKET_CATEGORIES;

/**
 * Verify platform user from Authorization header
 */
async function verifyUser(env: Env, authHeader: string | undefined): Promise<{
  id: string;
  email: string;
  fullName?: string;
} | null> {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createServiceClient(env);

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email || '',
    fullName: profile?.full_name,
  };
}

/**
 * Health check
 */
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'nyuchi-platform-helpscout',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /categories - List ticket categories
 */
app.get('/categories', (c) => {
  return c.json({
    data: Object.entries(TICKET_CATEGORIES).map(([key, label]) => ({
      id: key,
      label,
    })),
    ubuntu: 'I am because we are',
  });
});

/**
 * POST /ticket - Create a support ticket
 */
app.post('/ticket', async (c) => {
  try {
    const user = await verifyUser(c.env, c.req.header('Authorization'));
    const body = await c.req.json();

    const {
      subject,
      message,
      category = 'general',
      email: guestEmail,
      name: guestName,
      attachments,
    } = body;

    // Validate required fields
    if (!subject || !message) {
      return c.json({ error: 'subject and message are required' }, 400);
    }

    // Determine customer info
    let customer: HelpScoutCustomer;
    let userId: string | undefined;

    if (user) {
      // Authenticated user
      customer = {
        email: user.email,
        firstName: user.fullName?.split(' ')[0],
        lastName: user.fullName?.split(' ').slice(1).join(' '),
      };
      userId = user.id;
    } else {
      // Guest submission
      if (!guestEmail) {
        return c.json({ error: 'email is required for guest submissions' }, 400);
      }
      customer = {
        email: guestEmail,
        firstName: guestName?.split(' ')[0],
        lastName: guestName?.split(' ').slice(1).join(' '),
      };
    }

    // Build tags
    const tags = ['nyuchi-platform', category as string];
    if (userId) tags.push('registered-user');

    // Create conversation in Help Scout
    const conversationData: CreateConversationRequest = {
      subject,
      customer,
      mailboxId: parseInt(c.env.HELPSCOUT_MAILBOX_ID),
      type: 'email',
      status: 'active',
      tags,
      threads: [
        {
          type: 'customer',
          customer: { email: customer.email },
          text: message,
          attachments: attachments?.map((att: { name: string; type: string; data: string }) => ({
            fileName: att.name,
            mimeType: att.type,
            data: att.data,
          })),
        },
      ],
    };

    const result = await createConversation(c.env, conversationData);

    // If authenticated, store ticket reference in database
    if (userId) {
      const supabase = createServiceClient(c.env);

      await supabase.from('support_tickets').insert({
        user_id: userId,
        helpscout_id: result.id,
        subject,
        category,
        status: 'open',
        metadata: {
          webLocation: result.webLocation,
        },
      });
    }

    // Send confirmation email via queue
    await c.env.NOTIFICATIONS_QUEUE.send({
      type: 'ticket-created',
      payload: {
        to: customer.email,
        type: 'ticket-created',
        data: {
          subject,
          ticketId: result.id,
          category: TICKET_CATEGORIES[category as TicketCategory] || category,
        },
      },
      timestamp: new Date().toISOString(),
    });

    return c.json({
      message: 'Support ticket created successfully',
      ticketId: result.id,
      ubuntu: 'We are here to help',
    }, 201);
  } catch (error) {
    console.error('Create ticket error:', error);
    return c.json({ error: 'Failed to create support ticket' }, 500);
  }
});

/**
 * GET /tickets - Get user's support tickets
 */
app.get('/tickets', async (c) => {
  try {
    const user = await verifyUser(c.env, c.req.header('Authorization'));

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createServiceClient(c.env);

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return c.json({
      data: tickets || [],
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

/**
 * GET /tickets/:id - Get ticket details
 */
app.get('/tickets/:id', async (c) => {
  try {
    const user = await verifyUser(c.env, c.req.header('Authorization'));

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const ticketId = c.req.param('id');
    const supabase = createServiceClient(c.env);

    // Get local ticket record
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single();

    if (error || !ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Fetch latest status from Help Scout
    try {
      const conversation = await getConversation(c.env, ticket.helpscout_id);

      // Update local status if changed
      if (conversation.status !== ticket.status) {
        await supabase
          .from('support_tickets')
          .update({ status: conversation.status })
          .eq('id', ticketId);

        ticket.status = conversation.status;
      }

      return c.json({
        data: {
          ...ticket,
          threads: conversation.threads,
        },
        ubuntu: 'I am because we are',
      });
    } catch {
      // Return local data if Help Scout fetch fails
      return c.json({
        data: ticket,
        ubuntu: 'I am because we are',
      });
    }
  } catch (error) {
    console.error('Get ticket error:', error);
    return c.json({ error: 'Failed to fetch ticket' }, 500);
  }
});

/**
 * POST /tickets/:id/reply - Reply to a ticket
 */
app.post('/tickets/:id/reply', async (c) => {
  try {
    const user = await verifyUser(c.env, c.req.header('Authorization'));

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const ticketId = c.req.param('id');
    const { message } = await c.req.json();

    if (!message) {
      return c.json({ error: 'message is required' }, 400);
    }

    const supabase = createServiceClient(c.env);

    // Verify ticket ownership
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('helpscout_id')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single();

    if (error || !ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Create a customer thread (reply from customer)
    await createConversation(c.env, {
      subject: '', // Not used for reply
      customer: { email: user.email },
      mailboxId: parseInt(c.env.HELPSCOUT_MAILBOX_ID),
      type: 'email',
      status: 'active',
      threads: [{
        type: 'customer',
        customer: { email: user.email },
        text: message,
      }],
    });

    return c.json({
      message: 'Reply sent successfully',
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('Reply error:', error);
    return c.json({ error: 'Failed to send reply' }, 500);
  }
});

/**
 * POST /webhook - Handle Help Scout webhooks
 */
app.post('/webhook', async (c) => {
  try {
    // Verify webhook signature
    const signature = c.req.header('X-HelpScout-Signature');
    const payload = await c.req.text();

    if (!signature || !verifyWebhookSignature(payload, signature, c.env.HELPSCOUT_WEBHOOK_SECRET)) {
      return c.json({ error: 'Invalid signature' }, 401);
    }

    const event = JSON.parse(payload);
    const eventType = c.req.header('X-HelpScout-Event');

    console.log('Help Scout webhook:', eventType, event.id);

    const supabase = createServiceClient(c.env);

    switch (eventType) {
      case 'convo.assigned':
      case 'convo.status':
      case 'convo.moved':
        // Update local ticket status
        await supabase
          .from('support_tickets')
          .update({
            status: event.status || 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('helpscout_id', String(event.id));
        break;

      case 'convo.customer.reply.created':
        // Customer replied - already in our system
        break;

      case 'convo.agent.reply.created':
        // Agent replied - notify user
        const { data: ticket } = await supabase
          .from('support_tickets')
          .select('user_id')
          .eq('helpscout_id', String(event.id))
          .single();

        if (ticket) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', ticket.user_id)
            .single();

          if (profile?.email) {
            await c.env.NOTIFICATIONS_QUEUE.send({
              type: 'ticket-reply',
              payload: {
                to: profile.email,
                type: 'ticket-reply',
                data: {
                  subject: event.subject,
                  ticketId: event.id,
                },
              },
              timestamp: new Date().toISOString(),
            });
          }
        }
        break;

      case 'convo.deleted':
        // Mark as deleted locally
        await supabase
          .from('support_tickets')
          .update({ status: 'deleted' })
          .eq('helpscout_id', String(event.id));
        break;
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

/**
 * GET /mailboxes - List available mailboxes (admin)
 */
app.get('/mailboxes', async (c) => {
  try {
    // This should be admin-only in production
    const mailboxes = await listMailboxes(c.env);

    return c.json({
      data: mailboxes,
      ubuntu: 'I am because we are',
    });
  } catch (error) {
    console.error('List mailboxes error:', error);
    return c.json({ error: 'Failed to list mailboxes' }, 500);
  }
});

/**
 * Verify Help Scout webhook signature
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // Help Scout uses HMAC-SHA1 for webhook signatures
  // In production, implement proper HMAC verification
  // For now, just check that secret exists

  if (!secret) {
    console.warn('HELPSCOUT_WEBHOOK_SECRET not configured');
    return true; // Allow in development
  }

  // TODO: Implement HMAC-SHA1 verification
  // const hmac = crypto.createHmac('sha1', secret);
  // hmac.update(payload);
  // const expectedSignature = hmac.digest('base64');
  // return signature === expectedSignature;

  return true;
}

export default app;
