"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-[20%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tight">VocabFlow</span>
        </div>
        <Link
          href="/admin"
          className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          Admin Portal
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]"
          >
            Learn English <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600">
              Without Limits.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-2xl text-xl text-slate-500 dark:text-slate-400 mb-12 leading-relaxed"
          >
            The most intuitive platform to expand your vocabulary.
            Interactive quizzes, context-aware examples, and powerful management tools.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/lessons"
              className="group px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-xl shadow-2xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all flex items-center gap-3 active:scale-95"
            >
              Start Learning Now
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium tracking-wide">
            Words are added after each lesson.
          </p>
          <div className="h-px w-12 bg-slate-100 dark:bg-slate-900" />
          <div className="flex flex-col gap-2">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
              Created by <span className="text-indigo-600 dark:text-indigo-400">Muhammad</span>
            </p>
            <a 
              href="https://t.me/ielts_cream" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 dark:text-slate-500 text-[11px] hover:text-indigo-500 transition-colors flex items-center justify-center gap-1.5"
            >
              Translated by <span className="font-bold underline decoration-indigo-500/30">IELTS-CREAM🍦| 8.5</span>
            </a>
          </div>
          <p className="text-[10px] text-slate-300 dark:text-slate-700 font-black uppercase tracking-[0.3em] mt-4">
            © {new Date().getFullYear()} VocabFlow
          </p>
        </div>
      </footer>
    </main>
  );
}
