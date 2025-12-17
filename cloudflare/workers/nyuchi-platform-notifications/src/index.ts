/**
 * Nyuchi Platform Notifications Worker
 * Email and notification service via queue consumer
 */

import { Hono } from 'hono';
import type { NotificationsEnv, QueueMessage, EmailNotificationPayload } from '@nyuchi/workers-shared';
import { createServiceClient } from '@nyuchi/workers-shared';

interface Env extends NotificationsEnv {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  FROM_NAME: string;
}

// Email templates
const templates: Record<string, (data: Record<string, unknown>) => { subject: string; html: string }> = {
  'welcome-email': (data) => ({
    subject: 'Welcome to Nyuchi Africa!',
    html: `
      <h1>Welcome to Nyuchi, ${data.fullName || 'Friend'}!</h1>
      <p>We're excited to have you join our community of African entrepreneurs.</p>
      <p>Nyuchi is guided by the Ubuntu philosophy: "I am because we are."</p>
      <p>Here's what you can do next:</p>
      <ul>
        <li>Complete your profile to earn Ubuntu points</li>
        <li>Add your business to our directory</li>
        <li>Share knowledge with the community</li>
      </ul>
      <p>Together, we grow.</p>
      <p>— The Nyuchi Team</p>
    `,
  }),

  'content-approved': (data) => ({
    subject: `Your content "${data.title}" has been published!`,
    html: `
      <h1>Great news!</h1>
      <p>Your content "<strong>${data.title}</strong>" has been reviewed and published.</p>
      <p>You've earned Ubuntu points for your contribution to the community!</p>
      <p>View your content: <a href="https://platform.nyuchi.com/content/${data.contentId}">Click here</a></p>
      <p>Thank you for sharing your knowledge.</p>
      <p>— The Nyuchi Team</p>
    `,
  }),

  'content-rejected': (data) => ({
    subject: `Update on your content submission`,
    html: `
      <h1>Content Review Update</h1>
      <p>Thank you for submitting "<strong>${data.title}</strong>".</p>
      <p>Unfortunately, we weren't able to publish it at this time.</p>
      ${data.feedback ? `<p><strong>Feedback:</strong> ${data.feedback}</p>` : ''}
      <p>You're welcome to revise and resubmit your content.</p>
      <p>— The Nyuchi Team</p>
    `,
  }),

  'listing-approved': (data) => ({
    subject: `Your business "${data.businessName}" is now live!`,
    html: `
      <h1>Congratulations!</h1>
      <p>Your business "<strong>${data.businessName}</strong>" has been approved and is now visible in our directory.</p>
      <p>You've earned 50 Ubuntu points!</p>
      <p>View your listing: <a href="https://platform.nyuchi.com/directory/${data.listingId}">Click here</a></p>
      <p>— The Nyuchi Team</p>
    `,
  }),

  'listing-rejected': (data) => ({
    subject: `Update on your business listing`,
    html: `
      <h1>Listing Review Update</h1>
      <p>Thank you for submitting "<strong>${data.businessName}</strong>".</p>
      <p>Unfortunately, we weren't able to approve it at this time.</p>
      ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
      <p>You're welcome to update and resubmit your listing.</p>
      <p>— The Nyuchi Team</p>
    `,
  }),

  'verification-approved': (data) => ({
    subject: `Your business is now verified!`,
    html: `
      <h1>Verification Complete!</h1>
      <p>Congratulations! "<strong>${data.businessName}</strong>" is now a verified business on Nyuchi.</p>
      <p>You've earned 75 Ubuntu points and your listing now displays the verified badge.</p>
      <p>Thank you for being part of our trusted community.</p>
      <p>— The Nyuchi Team</p>
    `,
  }),

  'verification-rejected': (data) => ({
    subject: `Verification update for ${data.businessName}`,
    html: `
      <h1>Verification Update</h1>
      <p>We've reviewed your verification request for "<strong>${data.businessName}</strong>".</p>
      <p>Unfortunately, we weren't able to verify your business at this time.</p>
      ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
      <p>Please contact support if you have questions.</p>
      <p>— The Nyuchi Team</p>
    `,
  }),

  'ubuntu-level-up': (data) => ({
    subject: `You've reached ${data.newLevel} status!`,
    html: `
      <h1>Level Up!</h1>
      <p>Congratulations! You've reached <strong>${data.newLevel}</strong> status in the Nyuchi community.</p>
      <p>Your Ubuntu score: ${data.score} points</p>
      <p>Keep contributing and growing with us!</p>
      <p>— The Nyuchi Team</p>
    `,
  }),

  'subscription-created': (data) => ({
    subject: 'Welcome to Nyuchi Premium!',
    html: `
      <h1>Thank you for subscribing!</h1>
      <p>Your Nyuchi Premium subscription is now active.</p>
      <p>You now have access to all premium features.</p>
      <p>Manage your subscription anytime from your account settings.</p>
      <p>— The Nyuchi Team</p>
    `,
  }),

  'profile-reminder': (data) => ({
    subject: 'Complete your Nyuchi profile',
    html: `
      <h1>Hey ${data.fullName || 'there'}!</h1>
      <p>We noticed you haven't completed your profile yet.</p>
      <p>A complete profile helps you:</p>
      <ul>
        <li>Connect with other entrepreneurs</li>
        <li>Get discovered in the community</li>
        <li>Earn 25 Ubuntu points!</li>
      </ul>
      <p><a href="https://platform.nyuchi.com/profile">Complete your profile now</a></p>
      <p>— The Nyuchi Team</p>
    `,
  }),
};

// Send email via Resend
async function sendEmail(
  env: Env,
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    // Check rate limit (max 10 emails per hour per recipient)
    const rateKey = `email-rate:${to}`;
    const rateCount = parseInt((await env.CACHE.get(rateKey)) || '0');

    if (rateCount >= 10) {
      console.warn(`Rate limit exceeded for ${to}`);
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return false;
    }

    // Update rate limit
    await env.CACHE.put(rateKey, String(rateCount + 1), { expirationTtl: 3600 });

    console.log(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Send email error:', error);
    return false;
  }
}

// Queue consumer
export default {
  async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        const { type, payload } = message.body;

        // Handle email notifications
        if (payload && 'to' in payload && 'type' in payload) {
          const emailPayload = payload as EmailNotificationPayload;
          const template = templates[emailPayload.type];

          if (template) {
            const { subject, html } = template(emailPayload.data);
            const sent = await sendEmail(env, emailPayload.to, subject, html);

            if (!sent) {
              // Retry later
              message.retry();
              continue;
            }
          } else {
            console.warn(`Unknown template: ${emailPayload.type}`);
          }
        } else {
          // Handle other notification types (in-app, push, etc.)
          console.log(`Notification type: ${type}`, payload);

          // Store in-app notification
          if (payload && 'userId' in payload) {
            const supabase = createServiceClient(env);

            await supabase.from('notifications').insert({
              user_id: (payload as { userId: string }).userId,
              type,
              title: (payload as { title?: string }).title || type,
              message: (payload as { message?: string }).message || '',
              data: payload,
              read: false,
            });
          }
        }

        message.ack();
      } catch (error) {
        console.error('Notification processing failed:', error, message.body);
        message.retry();
      }
    }
  },

  // HTTP handler for direct API calls
  async fetch(request: Request, env: Env): Promise<Response> {
    const app = new Hono<{ Bindings: typeof env }>();

    app.get('/health', (c) => {
      return c.json({
        status: 'healthy',
        service: 'nyuchi-platform-notifications',
        timestamp: new Date().toISOString(),
      });
    });

    // Direct send endpoint (internal only)
    app.post('/send', async (c) => {
      const authHeader = c.req.header('X-Internal-Auth');
      if (authHeader !== env.SUPABASE_SERVICE_ROLE_KEY) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { to, templateName, data } = await c.req.json();
      const template = templates[templateName];

      if (!template) {
        return c.json({ error: 'Unknown template' }, 400);
      }

      const { subject, html } = template(data);
      const sent = await sendEmail(env, to, subject, html);

      return c.json({ success: sent });
    });

    return app.fetch(request, env);
  },
};
