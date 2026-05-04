import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWord extends Document {
  english_word: string;
  uzbek_meaning: string;
  examples: string[];
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

function arrayLimit(val: string[]) {
  return val.length <= 2;
}

const Word: Model<IWord> = mongoose.models.Word || mongoose.model<IWord>('Word', WordSchema);

export default Word;
