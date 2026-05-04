import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Admin
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Parse form data to get the uploaded file
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 3. Parse .json file
    const fileText = await file.text();
    let jsonData;
    try {
      jsonData = JSON.parse(fileText);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }

    if (!Array.isArray(jsonData)) {
      return NextResponse.json({ error: 'JSON must be an array of objects' }, { status: 400 });
    }

    // 4. Map the data into Mongoose format
    const wordsToInsert = jsonData.map((item: any) => {
      const english_word = item.english_word || '';
      const uzbek_meaning = item.uzbek_meaning || '';
      const examples = [];
      
      if (item.example_1) examples.push(item.example_1);
      if (item.example_2) examples.push(item.example_2);
      
      return {
        english_word,
        uzbek_meaning,
        examples,
      };
    }).filter(word => word.english_word && word.uzbek_meaning); // Only keep valid entries

    if (wordsToInsert.length === 0) {
       return NextResponse.json({ error: 'No valid words found in the JSON file.' }, { status: 400 });
    }

    // 5. Connect to DB and insert
    await dbConnect();
    
    // Automatically sort them alphabetically by english_word before insert
    wordsToInsert.sort((a, b) => a.english_word.localeCompare(b.english_word));

    const result = await Word.insertMany(wordsToInsert, { ordered: false });

    return NextResponse.json({
      message: 'Words successfully uploaded and inserted',
      count: result.length,
      sample: result.slice(0, 3)
    }, { status: 201 });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
