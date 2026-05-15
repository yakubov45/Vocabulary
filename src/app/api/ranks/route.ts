import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();
    const ranks = await Word.distinct('rank', { rank: { $ne: null, $exists: true, $not: /^\s*$/ } });
    console.log('Fetched ranks:', ranks);
    return NextResponse.json({ ranks });
  } catch (error: any) {
    console.error('Ranks fetch error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
