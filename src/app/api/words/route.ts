import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const rank = searchParams.get('rank');
    const limit = parseInt(searchParams.get('limit') || '1000');
    
    const query: any = {};
    if (category) query.category = category;
    if (rank) query.rank = rank;

    const cleanText = (text: string) => text ? text.replace(/\[cite:.*?\]/g, "").trim() : "";

    const words = await Word.find(query)
      .sort({ english_word: 1 })
      .limit(limit);

    const cleanedWords = words.map(w => ({
      ...w.toObject(),
      english_word: cleanText(w.english_word),
      uzbek_meaning: cleanText(w.uzbek_meaning),
      examples: w.examples?.map(ex => cleanText(ex)) || []
    }));

    return NextResponse.json({ words: cleanedWords });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
