"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number; // 0 to 100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full max-w-2xl h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-12 shadow-inner">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)]"
      />
    </div>
  );
}
