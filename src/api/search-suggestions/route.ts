
import { generateSearchSuggestions } from '@/ai/flows/smart-search-suggestions';
import { NextResponse, type NextRequest } from 'next/server';
import { products } from '@/lib/data';

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
    
    const productList = products.map(p => p.name_en);

    const result = await generateSearchSuggestions({
      searchQuery,
      searchHistory: searchHistory || [],
      productList: productList,
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[SEARCH_SUGGESTIONS_API_ERROR]', error);
    return NextResponse.json(
      { suggestions: [] },
      { status: 500 }
    );
  }
}
