import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/telegram';

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  // P2 FIX: Validate secret token to prevent spam/abuse
  if (WEBHOOK_SECRET) {
    const headerPayload = headers();
    const secretToken = headerPayload.get('X-Telegram-Bot-Api-Secret-Token');
    
    if (secretToken !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  try {
    const data = await request.json();
    
    if (data.message) {
      const chatId = String(data.message.chat.id);
      const text = data.message.text || '';
      const username = data.message.chat.username || 'User';
      
      if (text.trim() === '/start') {
        const welcomeMsg = `
🕉️ *Welcome to LaughingBuddha, ${username}!*

Your Chat ID is: \`${chatId}\`

🔗 To link your account:
1. Go to the website dashboard
2. Paste this Chat ID in the Telegram settings
3. Create your first alert schedule!

📊 You'll receive personalized stock alerts based on your settings.
        `.trim();
        
        await sendMessage(chatId, welcomeMsg);
      }
      
      if (text.trim() === '/help') {
        const helpMsg = `
🕉️ *LaughingBuddha Help*

*/start* - Get your Chat ID
*/help* - Show this message

📊 Create alert schedules on the website to receive personalized updates.
        `.trim();
        
        await sendMessage(chatId, helpMsg);
      }
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false });
  }
}
