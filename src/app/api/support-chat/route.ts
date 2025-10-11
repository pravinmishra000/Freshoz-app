
import { supportChat } from '@/ai/flows/customer-support-chat';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message } = body;
    
    if (!message) {
      return NextResponse.json(
        { message: 'Message is required', success: false },
        { status: 400 }
      );
    }
    
    const result = await supportChat({
      userId: userId || 'guest',
      message: message,
    });
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[SUPPORT_CHAT_API_ERROR]', error);
    return NextResponse.json(
      { 
        message: 'An internal server error occurred.',
        success: false 
      },
      { status: 500 }
    );
  }
}
