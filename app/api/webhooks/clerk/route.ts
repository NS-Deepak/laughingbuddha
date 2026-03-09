import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  // P1 FIX: Verify webhook signature
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }
  
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing webhook headers' },
      { status: 400 }
    );
  }
  
  const payload = await request.json();
  const body = JSON.stringify(payload);
  
  const wh = new Webhook(WEBHOOK_SECRET);
  
  let evt: any;
  
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
  
  const eventType = evt.type;
  
  // P1 FIX: Handle user creation (instead of doing it in GET /api/users)
  if (eventType === 'user.created') {
    const { id, email_addresses, primary_email_address_id } = evt.data;
    
    // Get primary email
    const primaryEmail = email_addresses?.find(
      (email: any) => email.id === primary_email_address_id
    )?.email_address;
    
    try {
      await prisma.user.upsert({
        where: { id },
        update: {
          email: primaryEmail || '',
          updatedAt: new Date(),
        },
        create: {
          id,
          email: primaryEmail || '',
          timezone: 'Asia/Kolkata', // Default timezone
        },
      });
      
      console.log(`✅ User ${id} created/updated via webhook`);
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
  }
  
  // Handle user deletion
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      await prisma.user.delete({
        where: { id }
      });
      
      console.log(`✅ User ${id} deleted via webhook`);
    } catch (error) {
      console.error('Error deleting user:', error);
      // Don't fail the webhook if user doesn't exist
    }
  }
  
  return NextResponse.json({ success: true });
}
