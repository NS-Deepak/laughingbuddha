import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Dodo Payments API configuration
const DODO_API_KEY = process.env.DODO_API_KEY || '';
const DODO_API_URL = process.env.DODO_API_URL || 'https://api.dodopayments.com';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the return URL
    const body = await request.json();
    const { returnUrl } = body;

    // For Dodo Payments, we would typically create a customer portal session
    // This is a placeholder - adapt to Dodo Payments API
    let portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/plans`;

    if (DODO_API_KEY) {
      try {
        // Placeholder - adapt to Dodo Payments API
        const response = await fetch(`${DODO_API_URL}/v1/portal/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DODO_API_KEY}`,
          },
          body: JSON.stringify({
            user_id: userId,
            return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/plans`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          portalUrl = data.portal_url || data.url;
        }
      } catch (err) {
        console.error('Dodo portal error:', err);
      }
    }

    return NextResponse.json({ portalUrl });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
