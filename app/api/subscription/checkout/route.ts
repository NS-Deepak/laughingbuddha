import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { Tier, PLAN_PRICING } from '@/lib/subscription-limits';

// Dodo Payments API configuration
// Replace these with your actual Dodo Payments credentials
const DODO_API_KEY = process.env.DODO_API_KEY || '';
const DODO_API_URL = process.env.DODO_API_URL || 'https://api.dodopayments.com';

interface CheckoutRequest {
  tier: Tier;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CheckoutRequest = await request.json();
    const { tier, billingCycle } = body;

    // Validate tier
    if (!['PRO', 'MAX'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Validate billing cycle
    if (!['monthly', 'quarterly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const pricing = PLAN_PRICING[tier];
    let amount: number;
    
    switch (billingCycle) {
      case 'monthly':
        amount = pricing.monthly;
        break;
      case 'quarterly':
        amount = pricing.quarterly;
        break;
      case 'yearly':
        amount = pricing.yearly;
        break;
      default:
        amount = pricing.monthly;
    }
    const currency = 'USD';

    // Create checkout session with Dodo Payments
    // This is a simplified example - adapt to Dodo Payments API
    const checkoutData = {
      order_id: `sub_${userId}_${Date.now()}`,
      amount: Math.round(amount * 100), // Dodo uses cents
      currency: currency.toUpperCase(),
      description: `${tier} Plan - ${billingCycle}`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/plans?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/plans?canceled=true`,
      customer: {
        email: user.email,
        user_id: userId,
      },
      metadata: {
        userId,
        tier,
        billingCycle,
      },
    };

    // Make request to Dodo Payments API
    // Note: This is a placeholder - actual implementation depends on Dodo Payments API
    let checkoutUrl = '';
    
    if (DODO_API_KEY) {
      try {
        const response = await fetch(`${DODO_API_URL}/v1/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DODO_API_KEY}`,
          },
          body: JSON.stringify(checkoutData),
        });

        if (response.ok) {
          const data = await response.json();
          checkoutUrl = data.checkout_url || data.url;
        } else {
          console.error('Dodo API error:', await response.text());
          // Fallback to mock URL for demo
          checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/plans?demo=true&tier=${tier}`;
        }
      } catch (err) {
        console.error('Dodo checkout error:', err);
        checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/plans?demo=true&tier=${tier}`;
      }
    } else {
      // No API key - return demo URL
      checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/plans?demo=true&tier=${tier}`;
    }

    return NextResponse.json({
      checkoutUrl,
      tier,
      billingCycle,
      amount,
      currency,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
