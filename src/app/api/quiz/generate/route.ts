import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';

export const revalidate = 0; // Disable caching to always return random words

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 1. Fetch one random word (the question)
    const randomQuestionWord = await Word.aggregate([{ $sample: { size: 1 } }]);

    if (!randomQuestionWord || randomQuestionWord.length === 0) {
      return NextResponse.json({ error: 'No words found in database. Please upload words first.' }, { status: 404 });
    }

    const targetWord = randomQuestionWord[0];

    // 2. Fetch 3 random uzbek_meanings from other documents where the ID does not match the current word
    const randomIncorrectWords = await Word.aggregate([
      { $match: { _id: { $ne: targetWord._id } } }, // Exclude the correct word
      { $sample: { size: 3 } }, // Get 3 random words
      { $project: { uzbek_meaning: 1 } } // We only need the meaning
    ]);

    // 3. Collect options
    const options = [
      targetWord.uzbek_meaning,
      ...randomIncorrectWords.map(w => w.uzbek_meaning)
    ];

    // 4. Shuffle the 4 options using Fisher-Yates algorithm
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    // 5. Return the expected data
    return NextResponse.json({
      english_word: targetWord.english_word,
      correct_meaning: targetWord.uzbek_meaning,
      options: options,
      examples: targetWord.examples,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
