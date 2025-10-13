// /home/user/studio/src/api/search-suggestions/route.ts
import { generateSearchSuggestions } from '@/ai/flows/smart-search-suggestions';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchQuery, searchHistory } = body;

    if (!searchQuery) {
      return NextResponse.json(
        { suggestions: [] },
        { status: 400 }
      );
    }

    console.log(`[API] Search suggestions requested for: "${searchQuery}"`);

    const result = await generateSearchSuggestions({
      searchQuery,
      searchHistory: searchHistory || [],
      // productList will be handled automatically by the flow
    });

    console.log(`[API] Generated ${result.suggestions.length} suggestions for: "${searchQuery}"`);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[SEARCH_SUGGESTIONS_API_ERROR]', error);
    
    // Better error response
    return NextResponse.json(
      { 
        suggestions: [], 
        error: error.message,
        fallback: true 
      },
      { status: 500 }
    );
  }
}