import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWord extends Document {
  english_word: string;
  uzbek_meaning: string;
  examples: string[];
  category: string;
  createdAt: Date;
}

const WordSchema: Schema = new Schema({
  english_word: {
    type: String,
    required: [true, 'English word is required'],
    trim: true,
  },
  uzbek_meaning: {
    type: String,
    required: [true, 'Uzbek meaning is required'],
    trim: true,
  },
  examples: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 2'],
    default: [],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

function arrayLimit(val: string[]) {
  return val.length <= 2;
}

// In development, we want to ensure the model reflects schema changes (like adding 'category')
if (mongoose.models.Word && !mongoose.models.Word.schema.paths.category) {
  delete mongoose.models.Word;
}

const Word: Model<IWord> = mongoose.models.Word || mongoose.model<IWord>('Word', WordSchema);

export default Word;
