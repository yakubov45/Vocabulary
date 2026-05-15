import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const rank = req.nextUrl.searchParams.get('rank');
    const query: any = { category: { $ne: null, $exists: true, $not: /^\s*$/ } };
    if (rank) query.rank = rank;
    
    const categories = await Word.distinct('category', query);
    console.log('Fetched categories:', categories);
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
