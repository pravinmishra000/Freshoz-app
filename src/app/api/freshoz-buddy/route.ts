
import { getAiResponse } from '@/ai/flows/freshoz-buddy';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, cartItems } = body;

    if (!query) {
      return NextResponse.json(
        { response: 'Query is required.', success: false },
        { status: 400 }
      );
    }

    const result = await getAiResponse({
      query,
      cartItems: cartItems || [],
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[FRESHOZ_BUDDY_API_ERROR]', error);
    return NextResponse.json(
      { 
        response: 'Sorry, I am having trouble thinking right now. Please try again later.',
        success: false 
      },
      { status: 500 }
    );
  }
}
