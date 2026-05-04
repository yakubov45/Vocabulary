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
    const skip = (page - 1) * limit;

    const words = await Word.find({})
      .sort({ english_word: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Word.countDocuments();

    return NextResponse.json({
      words,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
