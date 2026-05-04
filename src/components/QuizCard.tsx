"use client";

import { motion, AnimatePresence } from "framer-motion";

interface QuizCardProps {
  word: string;
  examples: string[];
  showExamples: boolean;
}

export default function QuizCard({ word, examples, showExamples }: QuizCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full p-10 mb-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.h1 
          key={word}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
        >
          {word}
        </motion.h1>

        <AnimatePresence>
          {showExamples && examples.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-md mt-4 pt-6 border-t border-white/10"
            >
              <div className="space-y-4">
                {examples.map((ex, i) => (
                  <motion.p 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-indigo-50/80 italic text-lg leading-relaxed"
                  >
                    "{ex}"
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
