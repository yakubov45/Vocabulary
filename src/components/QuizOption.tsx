"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge tailwind classes safely
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuizOptionProps {
  option: string;
  isSelected: boolean;
  isCorrect: boolean | null;
  correctOption: string;
  disabled: boolean;
  onClick: () => void;
}

export default function QuizOption({
  option,
  isSelected,
  isCorrect,
  correctOption,
  disabled,
  onClick,
}: QuizOptionProps) {
  const isTargetCorrect = option === correctOption;
  const showResult = disabled; // Result is shown when options are disabled (after click)

  const variants: Variants = {
    initial: { scale: 1, y: 0 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
    correct: { 
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      borderColor: "rgba(16, 185, 129, 1)",
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    },
    incorrect: { 
      x: [0, -10, 10, -10, 10, 0],
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      borderColor: "rgba(239, 68, 68, 1)",
      transition: { duration: 0.4 }
    }
  };

  // Determine the animation state
  let animationState = "";
  if (showResult) {
    if (isTargetCorrect) {
      animationState = "correct";
    } else if (isSelected && isCorrect === false) {
      animationState = "incorrect";
    }
  }

  return (
    <motion.button
      variants={variants}
      initial="initial"
      whileHover={!disabled ? "hover" : ""}
      whileTap={!disabled ? "tap" : ""}
      animate={animationState}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 text-left",
        "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm",
        !disabled && "hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md",
        
        // Correct Answer Styling
        showResult && isTargetCorrect && "border-emerald-500 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-500/10",
        
        // Selected Wrong Answer Styling
        isSelected && isCorrect === false && "border-rose-500 dark:border-rose-400 text-rose-700 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-500/10",
        
        // Other options after selection
        showResult && !isTargetCorrect && !isSelected && "opacity-40 grayscale-[0.2]"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
          showResult && isTargetCorrect ? "bg-emerald-500 border-emerald-500 text-white" : 
          isSelected && isCorrect === false ? "bg-rose-500 border-rose-500 text-white" :
          "border-slate-200 dark:border-slate-700 group-hover:border-indigo-400"
        )}>
          {showResult && isTargetCorrect ? <CheckCircle2 size={18} strokeWidth={3} /> :
           isSelected && isCorrect === false ? <XCircle size={18} strokeWidth={3} /> :
           <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-indigo-400" />}
        </div>
        <span className="text-lg font-semibold tracking-tight">{option}</span>
      </div>
      
      <AnimatePresence>
        {showResult && isTargetCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="text-emerald-500"
          >
            <CheckCircle2 size={24} strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
