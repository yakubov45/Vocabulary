"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BookOpen, ArrowLeft, Play, List, Search, ChevronRight, Check } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Word {
  _id: string;
  english_word: string;
  uzbek_meaning: string;
  category: string;
  examples?: string[];
}

export default function LessonsPage() {
  const [ranks, setRanks] = useState<string[]>([]);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryWords, setCategoryWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"ranks" | "categories" | "wordlist">("ranks");
  const [searchTerm, setSearchTerm] = useState("");
  const [multiSelected, setMultiSelected] = useState<string[]>([]);

  useEffect(() => {
    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ranks", { cache: 'no-store' });
      const data = await res.json();
      if (data.ranks) setRanks(data.ranks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (rank: string) => {
    setLoading(true);
    setSelectedRank(rank);
    try {
      const res = await fetch(`/api/categories?rank=${encodeURIComponent(rank)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        setViewMode("categories");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryWords = async (cat: string) => {
    setLoading(true);
    try {
      const rankParam = selectedRank ? `&rank=${encodeURIComponent(selectedRank)}` : "";
      const res = await fetch(`/api/words?limit=1000&category=${encodeURIComponent(cat)}${rankParam}`);
      const data = await res.json();
      if (data.words) setCategoryWords(data.words);
      setSelectedCategory(cat);
      setViewMode("wordlist");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMultiSelect = (cat: string) => {
    setMultiSelected(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredWords = categoryWords.filter(w => 
    w.english_word.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.uzbek_meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 p-6 md:p-10 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex gap-2">
            {viewMode !== "ranks" ? (
              <button 
                onClick={() => setViewMode(viewMode === "wordlist" ? "categories" : "ranks")}
                className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              >
                <ArrowLeft size={24} />
              </button>
            ) : (
              <Link href="/" className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <ArrowLeft size={24} />
              </Link>
            )}
            <ThemeToggle />
          </div>
          
          <h1 className="text-2xl font-black tracking-tight dark:text-white text-center flex-1">
            {viewMode === "ranks" ? "Choose Level" : viewMode === "categories" ? "Choose Lesson" : selectedCategory}
          </h1>
          
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-900 rounded-[1.5rem] animate-pulse" />
              ))}
            </motion.div>
          ) : viewMode === "ranks" ? (
            <motion.div 
              key="ranks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 gap-4"
            >
              {ranks.map((rank, idx) => (
                <div key={idx} className="relative group cursor-pointer" onClick={() => fetchCategories(rank)}>
                  <div className="w-full flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border-2 border-transparent transition-all shadow-sm hover:border-indigo-500">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-xl font-black">
                        {rank[0].toUpperCase()}
                      </div>
                      <h3 className="font-bold text-xl dark:text-white leading-tight">{rank}</h3>
                    </div>
                    <ChevronRight className="text-slate-300" />
                  </div>
                </div>
              ))}
              {ranks.length === 0 && (
                <p className="text-center text-slate-500 mt-10">No ranks found yet.</p>
              )}
            </motion.div>
          ) : viewMode === "categories" ? (
            <motion.div 
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 gap-4"
            >
              {/* Start Quiz for entire Rank */}
              <div className="mb-4">
                <Link 
                  href={`/quiz?rank=${encodeURIComponent(selectedRank || "")}`}
                  className="flex items-center justify-center gap-3 p-5 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-lg shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95"
                >
                  <Play fill="currentColor" size={20} />
                  Start Level Quiz
                </Link>
              </div>

              {/* Multi-select actions */}
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-sm font-bold text-slate-400 uppercase">Categories</h2>
                <button 
                  onClick={() => {
                    if (multiSelected.length === categories.length) {
                      setMultiSelected([]);
                    } else {
                      setMultiSelected([...categories]);
                    }
                  }}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  {multiSelected.length === categories.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {multiSelected.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-indigo-600 rounded-[1.5rem] text-white flex flex-col gap-3 shadow-xl shadow-indigo-500/20"
                >
                  <div className="flex justify-between items-center px-2">
                    <span className="font-bold">{multiSelected.length} lessons selected</span>
                    <button onClick={() => setMultiSelected([])} className="text-xs underline opacity-80">Clear all</button>
                  </div>
                  <Link 
                    href={`/quiz?rank=${encodeURIComponent(selectedRank || "")}&category=${encodeURIComponent(multiSelected.join(","))}`}
                    className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-center shadow-sm hover:bg-indigo-50 transition-colors"
                  >
                    Start Mixed Quiz
                  </Link>
                </motion.div>
              )}

              {categories.map((cat, idx) => (
                <div key={idx} className="relative group">
                  <div className={`
                    w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border-2 transition-all shadow-sm
                    ${multiSelected.includes(cat) ? "border-indigo-500 ring-4 ring-indigo-500/10" : "border-transparent"}
                  `}>
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => fetchCategoryWords(cat)}>
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <List size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg dark:text-white leading-tight">{cat}</h3>
                        <p className="text-sm text-slate-500">View words</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleMultiSelect(cat)}
                        className={`
                          w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2
                          ${multiSelected.includes(cat) 
                            ? "bg-indigo-600 border-indigo-600 text-white" 
                            : "bg-transparent border-slate-100 dark:border-slate-800 text-transparent hover:border-indigo-400"}
                        `}
                      >
                        <Check size={18} strokeWidth={4} />
                      </button>
                      <ChevronRight className="text-slate-300" />
                    </div>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-center text-slate-500 mt-10">No categories found yet.</p>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="wordlist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Actions for category */}
              <div className="grid grid-cols-1 gap-4">
                <Link 
                  href={`/quiz?category=${encodeURIComponent(selectedCategory || "")}`}
                  className="flex items-center justify-center gap-3 p-5 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-lg shadow-xl shadow-indigo-500/20 hover:bg-indigo-50 transition-all active:scale-95"
                >
                  <Play fill="currentColor" size={20} />
                  Start Category Quiz
                </Link>
              </div>

              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search in this lesson..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              <div className="space-y-3">
                {filteredWords.map((word) => (
                  <div 
                    key={word._id}
                    className="p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col"
                  >
                    <div className="flex flex-col mb-3">
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{word.english_word}</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{word.uzbek_meaning}</span>
                    </div>
                    
                    {word.examples && word.examples.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                        {word.examples.map((ex, i) => (
                          <p key={i} className="text-xs text-slate-400 dark:text-slate-500 italic leading-relaxed">
                            • {ex}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
