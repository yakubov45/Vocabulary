import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10000'); // Changed default to 10000
    
    const query = {};
    const total = await Word.countDocuments(query);

    const cleanText = (text: string) => text ? text.replace(/\[cite:.*?\]/g, "").trim() : "";

    const words = await Word.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const cleanedWords = words.map(w => ({
      ...w.toObject(),
      english_word: cleanText(w.english_word),
      uzbek_meaning: cleanText(w.uzbek_meaning),
      examples: w.examples?.map(ex => cleanText(ex)) || []
    }));

    return NextResponse.json({
      words: cleanedWords,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { english_word, uzbek_meaning, examples, category, rank } = await req.json();

    if (!english_word || !uzbek_meaning || !category || !rank) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    const newWord = await Word.create({
      english_word,
      uzbek_meaning,
      examples: examples || [],
      category,
      rank,
    });

    return NextResponse.json({ message: 'Word created successfully', word: newWord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const rank = searchParams.get('rank');
    const category = searchParams.get('category');

    let query = {};
    if (rank) query = { rank };
    if (category) query = { category };

    const result = await Word.deleteMany(query);
    
    return NextResponse.json({ 
      message: result.deletedCount > 0 ? 'Deleted successfully' : 'No words found to delete',
      count: result.deletedCount 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
