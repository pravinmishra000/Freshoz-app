
import { NextResponse } from 'next/server';
import { getAiResponse } from '@/ai/flows/freshoz-buddy';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = await getAiResponse({
      query: body.query || '',
      cartItems: body.cartItems || []
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        response: "I'm having trouble right now. Please try again later.",
        success: false 
      },
      { status: 500 }
    );
  }
}

// CORS preflight handling
export async function OPTIONS() {
  return NextResponse.json({});
}
