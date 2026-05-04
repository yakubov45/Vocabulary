"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

interface QuizData {
  english_word: string;
  options: string[];
  examples: string[];
}

export default function QuizDashboard() {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const fetchQuiz = async () => {
    setLoading(true);
    setSelectedOption(null);
    setIsCorrect(null);
    try {
      // In a real app we'd also fetch the correct answer, or return the ID to check it securely.
      // For this simple implementation, the API doesn't tell us which one is correct directly.
      // Wait, our API doesn't return the correct option to verify on the frontend!
      // Let's modify the API to return the correct option OR we can check via another API call.
      // Actually, since we didn't return the correct answer in the API response, let's fix the API.
      // But assuming we can't change the API right now, I'll temporarily assume the correct answer is known.
      // Let's modify the API right after this to include `correct_option`.
      const res = await fetch("/api/quiz/generate");
      const data = await res.json();
      if (data.english_word) {
        setQuiz(data);
      } else {
        alert(data.error || "Failed to load quiz");
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
    if (selectedOption) return; // Prevent multiple clicks
    setSelectedOption(option);
    
    // For now we check by making a quick guess or modifying API.
    // I will update the API to return `correct_meaning` so we can verify.
    // Let's assume `quiz.correct_meaning` will exist.
    const correct = option === (quiz as any).correct_meaning; 
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center justify-center p-6">
      
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-10">
        <a href="/" className="text-slate-400 hover:text-white transition font-medium">
          &larr; Back Home
        </a>
        <div className="bg-slate-800 px-5 py-2 rounded-full font-bold text-blue-400 border border-slate-700 shadow-sm">
          Score: {score}
        </div>
      </div>

      <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Progress Bar (Visual flair) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-700">
          <div className="h-full bg-blue-500 w-full animate-pulse rounded-r-full"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-400 font-medium">Generating your next word...</p>
          </div>
        ) : quiz ? (
          <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-2">Translate this word</p>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-8 text-center tracking-tight">
              {quiz.english_word}
            </h1>

            {/* Context Examples */}
            {quiz.examples && quiz.examples.length > 0 && (
              <div className="w-full bg-slate-800/80 rounded-2xl p-5 mb-10 border border-slate-700">
                <p className="text-xs text-slate-400 font-bold uppercase mb-3">Context</p>
                <ul className="space-y-3">
                  {quiz.examples.map((ex, i) => (
                    <li key={i} className="text-slate-300 italic flex items-start gap-3">
                      <span className="text-blue-500 font-bold">&quot;</span>
                      <span className="leading-relaxed">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Options */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quiz.options.map((option, idx) => {
                let btnStyle = "bg-slate-700 hover:bg-slate-600 border-slate-600 text-white";
                
                if (selectedOption) {
                  if (option === (quiz as any).correct_meaning) {
                    btnStyle = "bg-green-500/20 border-green-500 text-green-400";
                  } else if (option === selectedOption && option !== (quiz as any).correct_meaning) {
                    btnStyle = "bg-red-500/20 border-red-500 text-red-400";
                  } else {
                    btnStyle = "bg-slate-800 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    disabled={!!selectedOption}
                    className={`p-5 rounded-2xl border-2 text-lg font-medium transition-all duration-200 shadow-sm flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {selectedOption && option === (quiz as any).correct_meaning && <CheckCircle2 className="w-6 h-6" />}
                    {selectedOption === option && option !== (quiz as any).correct_meaning && <XCircle className="w-6 h-6" />}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            {selectedOption && (
              <button
                onClick={fetchQuiz}
                className="mt-10 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/25 animate-in fade-in slide-in-from-bottom-2"
              >
                Next Word <ArrowRight className="w-5 h-5" />
              </button>
            )}

          </div>
        ) : (
          <div className="py-20 text-center text-red-400">Error loading quiz.</div>
        )}
      </div>
    </div>
  );
}
