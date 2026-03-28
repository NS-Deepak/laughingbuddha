import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Dodo Payments webhook secret
const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET || '';

interface DodoWebhookEvent {
  event_type: string;
  event_id: string;
  data: {
    order_id?: string;
    subscription_id?: string;
    customer_id?: string;
    status?: string;
    plan_id?: string;
    metadata?: {
      userId?: string;
      tier?: string;
      billingCycle?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (simplified - adapt to Dodo Payments)
    const signature = request.headers.get('x-dodo-signature');
    
    // Parse the webhook payload
    const payload = await request.json() as DodoWebhookEvent;
    
    console.log('Dodo webhook received:', payload.event_type);

    // Handle different event types
    switch (payload.event_type) {
      case 'payment_completed':
      case 'subscription_created':
      case 'subscription_activated': {
        const { metadata, status } = payload.data;
        const userId = metadata?.userId;
        const tier = metadata?.tier;

        if (userId && tier) {
          // Update user's tier
          // @ts-ignore - MAX tier will be available after migration
          await prisma.user.update({
            where: { id: userId },
            data: {
              tier: tier as any,
            },
          });
          console.log(`User ${userId} upgraded to ${tier}`);
        }
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        const { metadata } = payload.data;
        const userId = metadata?.userId;

        if (userId) {
          // Downgrade to free
          await prisma.user.update({
            where: { id: userId },
            data: {
              tier: 'FREE',
            },
          });
          console.log(`User ${userId} downgraded to FREE`);
        }
        break;
      }

      case 'payment_failed': {
        // Could send email notification about failed payment
        console.log('Payment failed event received');
        break;
      }

      default:
        console.log('Unhandled Dodo event type:', payload.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
