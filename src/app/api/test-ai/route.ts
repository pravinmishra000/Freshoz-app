// src/app/api/test-ai/route.ts
import { supportChat } from '@/ai/flows/customer-support-chat';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    const result = await supportChat({
      userId: 'test-user',
      message: message
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { 
        message: 'Test failed: ' + error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'AI Test API is running',
    hasApiKey: !!process.env.GEMINI_API_KEY
  });
}