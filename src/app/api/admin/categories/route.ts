import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { oldTitle, newTitle } = await req.json();

    if (!oldTitle || !newTitle) {
      return NextResponse.json({ error: 'Both old and new titles are required' }, { status: 400 });
    }

    await dbConnect();
    
    const result = await Word.updateMany(
      { category: oldTitle },
      { $set: { category: newTitle } }
    );

    return NextResponse.json({ 
      message: 'Category renamed successfully',
      modifiedCount: result.modifiedCount 
    });
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

    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Category title is required' }, { status: 400 });
    }

    await dbConnect();
    
    const result = await Word.deleteMany({ category: title });

    return NextResponse.json({ 
      message: 'Category and all associated words deleted successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
