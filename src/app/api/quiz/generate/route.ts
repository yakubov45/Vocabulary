import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';

export const revalidate = 0; // Disable caching to always return random words

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const categoryParam = searchParams.get('category');
    const rankParam = searchParams.get('rank');
    const all = searchParams.get('all') === 'true';
    const mode = searchParams.get('mode') || 'random'; // random or sequential
    
    const categories = categoryParam ? categoryParam.split(',').filter(Boolean) : [];
    
    const matchQuery: any = {};
    if (categories.length > 0) matchQuery.category = { $in: categories };
    if (rankParam) matchQuery.rank = rankParam;

    const cleanText = (text: string) => text ? text.replace(/\[cite:.*?\]/g, "").trim() : "";

    if (all) {
      // Fetch all words for the session
      let words = await Word.find(matchQuery).lean();
      
      if (mode === 'random') {
        // Shuffle words
        for (let i = words.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [words[i], words[j]] = [words[j], words[i]];
        }
      } else {
        // Sequential - sort by createdAt or stay as is
        words.sort((a: any, b: any) => (a.createdAt > b.createdAt ? 1 : -1));
      }

      // Get all meanings for distractors
      const allMeanings = await Word.find({}).select('uzbek_meaning').lean();
      const meaningList = allMeanings.map((w: any) => cleanText(w.uzbek_meaning));

      const sessionData = words.map((w: any) => {
        const correct = cleanText(w.uzbek_meaning);
        // Get 3 random distractors that are not the correct meaning
        const distractors = meaningList
          .filter(m => m !== correct)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        
        const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

        return {
          id: w._id,
          english_word: cleanText(w.english_word),
          correct_meaning: correct,
          options,
          examples: w.examples?.map((ex: string) => cleanText(ex)) || []
        };
      });

      return NextResponse.json({ words: sessionData }, { status: 200 });
    }

    // Original single word logic (fallback)
    const randomQuestionWord = await Word.aggregate([
      { $match: matchQuery },
      { $sample: { size: 1 } }
    ]);

    if (!randomQuestionWord || randomQuestionWord.length === 0) {
      return NextResponse.json({ error: 'No words found' }, { status: 404 });
    }

    const targetWord = randomQuestionWord[0];
    const distractors = await Word.aggregate([
      { $match: { _id: { $ne: targetWord._id } } },
      { $sample: { size: 3 } },
      { $project: { uzbek_meaning: 1 } }
    ]);

    const options = [cleanText(targetWord.uzbek_meaning), ...distractors.map(d => cleanText(d.uzbek_meaning))].sort(() => 0.5 - Math.random());

    return NextResponse.json({
      english_word: cleanText(targetWord.english_word),
      correct_meaning: cleanText(targetWord.uzbek_meaning),
      options,
      examples: targetWord.examples?.map((ex: string) => cleanText(ex)) || [],
    }, { status: 200 });

  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
