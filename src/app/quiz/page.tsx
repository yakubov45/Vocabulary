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
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);

  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const fetchQuiz = async () => {
    setLoading(true);
    setSelectedOption(null);
    setIsCorrect(null);
    try {
      const url = category 
        ? `/api/quiz/generate?category=${encodeURIComponent(category)}` 
        : "/api/quiz/generate";
      const res = await fetch(url);
      const data = await res.json();
      if (data.english_word) {
        setQuiz(data);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleOptionClick = (option: string) => {
    if (selectedOption || !quiz) return;
    setSelectedOption(option);
    const correct = option === quiz.correct_meaning;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
    setTotalAttempted((t) => t + 1);
  };

  const progress = totalAttempted === 0 ? 0 : Math.min((totalAttempted / 10) * 100, 100);

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
            onClick={() => { setScore(0); setTotalAttempted(0); fetchQuiz(); }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
           >
             <RotateCcw size={20} />
           </motion.button>
        </div>
        
        <ProgressBar progress={progress} />
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
        ) : quiz ? (
          <motion.div 
            key="quiz"
            className="w-full max-w-2xl"
          >
            <QuizCard 
              word={quiz.english_word} 
              examples={quiz.examples} 
              showExamples={!!selectedOption} 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {quiz.options.map((option, idx) => (
                <QuizOption
                  key={idx}
                  option={option}
                  isSelected={selectedOption === option}
                  isCorrect={isCorrect}
                  correctOption={quiz.correct_meaning}
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
                    onClick={fetchQuiz}
                    className="group relative px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
                  >
                    Next Word 
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
        ) : null}
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
