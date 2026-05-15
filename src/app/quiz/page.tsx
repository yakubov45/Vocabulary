"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Trophy, RotateCcw, Home } from "lucide-react";
import QuizCard from "@/components/QuizCard";
import QuizOption from "@/components/QuizOption";
import ProgressBar from "@/components/ProgressBar";

interface QuizData {
  english_word: string;
  correct_meaning: string;
  options: string[];
  examples: string[];
}

function QuizContent() {
  const [sessionWords, setSessionWords] = useState<QuizData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [quizMode, setQuizMode] = useState<"random" | "sequential" | null>(null);

  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const rank = searchParams.get("rank");

  const startSession = async (mode: "random" | "sequential") => {
    setQuizMode(mode);
    setLoading(true);
    try {
      let url = `/api/quiz/generate?all=true&mode=${mode}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (rank) url += `&rank=${encodeURIComponent(rank)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.words && data.words.length > 0) {
        setSessionWords(data.words);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < sessionWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      // Quiz finished
      setSessionWords([]);
      setQuizMode(null);
    }
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption || sessionWords.length === 0) return;
    setSelectedOption(option);
    const quiz = sessionWords[currentIndex];
    const correct = option === quiz.correct_meaning;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
  };

  const currentQuiz = sessionWords[currentIndex];
  const progress = sessionWords.length === 0 ? 0 : ((currentIndex + 1) / sessionWords.length) * 100;

  if (!quizMode) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl"
        >
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
            <Trophy className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-black mb-2 dark:text-white">Choose Quiz Mode</h1>
          <p className="text-slate-500 mb-10 font-medium">How would you like to learn today?</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => startSession("random")}
              className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-2 border-transparent hover:border-indigo-500 rounded-2xl transition-all text-left group"
            >
              <h3 className="font-bold text-lg dark:text-white group-hover:text-indigo-600">Random Mode</h3>
              <p className="text-sm text-slate-500">Shuffled words, no repetitions</p>
            </button>
            
            <button 
              onClick={() => startSession("sequential")}
              className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-2 border-transparent hover:border-emerald-500 rounded-2xl transition-all text-left group"
            >
              <h3 className="font-bold text-lg dark:text-white group-hover:text-emerald-600">Sequential Mode</h3>
              <p className="text-sm text-slate-500">In order of addition (from JSON)</p>
            </button>
          </div>
          
          <Link href="/lessons" className="mt-8 inline-block text-slate-400 hover:text-indigo-600 font-bold transition-colors">
            Back to Lessons
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 flex flex-col items-center pt-12 pb-24 px-6 transition-colors duration-500">
      
      {/* Progress & Header */}
      <div className="w-full max-w-2xl flex flex-col items-center mb-4">
        <div className="w-full flex justify-between items-center mb-8">
           <div className="flex items-center gap-4">
             <Link 
              href="/lessons" 
              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2 font-semibold text-sm"
             >
               <Home size={20} />
               <span className="hidden sm:inline">Lessons</span>
             </Link>

             <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full"
             >
               <Trophy className="text-amber-500" size={18} />
               <span className="text-lg font-bold text-slate-800 dark:text-white">{score}</span>
             </motion.div>
           </div>
           
           <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-semibold text-slate-500 dark:text-slate-400"
           >
            Vocabulary Master
           </motion.h2>

            <motion.button
             whileHover={{ rotate: 180 }}
             transition={{ duration: 0.5 }}
             onClick={() => { setQuizMode(null); setSessionWords([]); setScore(0); }}
             className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <RotateCcw size={20} />
            </motion.button>
        </div>
        
        <ProgressBar progress={progress} />
        <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentIndex + 1} / {sessionWords.length} Words</p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="w-full h-64 bg-slate-200 dark:bg-slate-900 rounded-[2.5rem] animate-pulse mb-10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-slate-900/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          </motion.div>
        ) : currentQuiz ? (
          <motion.div 
            key="quiz"
            className="w-full max-w-2xl"
          >
            <QuizCard 
              word={currentQuiz.english_word} 
              examples={currentQuiz.examples} 
              showExamples={!!selectedOption} 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-10">
              {currentQuiz.options.map((option, idx) => (
                <QuizOption
                  key={idx}
                  option={option}
                  isSelected={selectedOption === option}
                  isCorrect={isCorrect}
                  correctOption={currentQuiz.correct_meaning}
                  disabled={!!selectedOption}
                  onClick={() => handleOptionClick(option)}
                />
              ))}
            </div>

            {/* Next Button */}
            <AnimatePresence>
              {selectedOption && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={handleNext}
                    className="group relative px-8 py-4 sm:px-10 sm:py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg sm:text-xl flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
                  >
                    {currentIndex === sessionWords.length - 1 ? "Finish Quiz" : "Next Word"} 
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight size={24} />
                    </motion.div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold dark:text-white">No words found for this selection</h2>
            <Link href="/lessons" className="mt-4 inline-block text-indigo-600 font-bold">Go Back</Link>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
