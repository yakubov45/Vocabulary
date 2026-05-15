"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Edit, 
  Search, 
  Plus, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Home
} from "lucide-react";

interface Word {
  _id: string;
  english_word: string;
  uzbek_meaning: string;
  examples: string[];
}

export default function AdminDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [rankTitle, setRankTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [allRanks, setAllRanks] = useState<string[]>([]);

  const filteredWords = words.filter(word => 
    word.english_word.toLowerCase().includes(searchTerm.toLowerCase()) || 
    word.uzbek_meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchWords();
    fetchCategories();
    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    try {
      const res = await fetch("/api/ranks", { cache: 'no-store' });
      const data = await res.json();
      if (data.ranks) setAllRanks(data.ranks);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: 'no-store' });
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWords = async () => {
    try {
      const res = await fetch("/api/admin/words");
      const data = await res.json();
      if (data.words) setWords(data.words);
    } catch (error) {
      console.error("Error fetching words:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", categoryTitle);
    formData.append("rank", rankTitle);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setFile(null);
        setCategoryTitle("");
        setRankTitle("");
        fetchWords();
        fetchCategories();
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      alert("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this word?")) return;
    try {
      const res = await fetch(`/api/admin/words/${id}`, { method: "DELETE" });
      if (res.ok) fetchWords();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("CRITICAL WARNING: This will delete ALL words from the database. Are you absolutely sure?")) return;
    if (!confirm("Final confirmation: Are you REALLY sure? This cannot be undone.")) return;
    
    try {
      const res = await fetch("/api/admin/words", { method: "DELETE" });
      if (res.ok) {
        fetchWords();
        alert("All words have been deleted.");
      }
    } catch (error) {
      console.error("Delete all failed", error);
    }
  };

  const handleRenameCategory = async (oldTitle: string) => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldTitle, newTitle: newCategoryName }),
      });
      if (res.ok) {
        setEditingCategory(null);
        setNewCategoryName("");
        fetchWords();
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-slate-950 flex">
      
      {/* Sidebar (Simple Desktop version) */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight dark:text-white">VocabAdmin</span>
        </div>

        <nav className="space-y-1">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active />
          <SidebarItem icon={<BookOpen size={20} />} label="All Words" />
          <SidebarItem icon={<Users size={20} />} label="Students" />
          <SidebarItem icon={<BarChart3 size={20} />} label="Analytics" />
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <Link href="/">
              <SidebarItem icon={<Home size={20} />} label="Back to Site" />
            </Link>
          </div>
        </nav>

        <div className="mt-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Storage</p>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-2">
              <div className="w-[45%] h-full bg-indigo-500 rounded-full" />
            </div>
            <p className="text-xs text-slate-500">450 / 1000 words used</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400">Welcome back, Administrator.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleDeleteAll}
                className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/30 text-rose-600 rounded-xl font-semibold shadow-sm hover:bg-rose-50 dark:hover:bg-rose-500/10 transition flex items-center gap-2"
              >
                <Trash2 size={18} /> Clear All
              </button>
              <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                Export Data
              </button>
              <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition flex items-center gap-2">
                <Plus size={18} strokeWidth={3} /> Add Word
              </button>
            </div>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<BookOpen className="text-indigo-600" />} label="Total Words" value={words.length} trend="+12 this week" />
            <StatCard icon={<CheckCircle2 className="text-emerald-600" />} label="Active Quiz" value="1.2k" trend="High activity" />
            <StatCard icon={<AlertCircle className="text-rose-600" />} label="Avg. Accuracy" value="84%" trend="+2.4% boost" />
          </div>

          {/* Upload & Management Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Upload Zone */}
            <section className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-bold px-1 dark:text-white">Import Vocabulary</h3>
              
              <div className="space-y-2 px-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Daraja (Rank)</label>
                <input 
                  type="text" 
                  list="rank-list"
                  placeholder="Masalan: Elementary, A1, Rank 1..." 
                  value={rankTitle}
                  onChange={(e) => setRankTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-4"
                />
                <datalist id="rank-list">
                  {allRanks.map(r => <option key={r} value={r} />)}
                </datalist>

                <label className="text-xs font-bold text-slate-400 uppercase">Bo'lim (Category) Title</label>
                <input 
                  type="text" 
                  list="category-list"
                  placeholder="e.g. Lesson 1: Basics" 
                  value={categoryTitle}
                  onChange={(e) => setCategoryTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <datalist id="category-list">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              <label 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-[2rem] p-8 transition-all duration-300 flex flex-col items-center justify-center text-center h-[320px] cursor-pointer
                  ${dragActive ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"}
                  ${file ? "border-emerald-500 bg-emerald-50/10" : ""}
                `}
              >
                <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl ${file ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"}`}>
                  <UploadCloud size={28} />
                </div>
                
                <h4 className="font-bold mb-1 dark:text-white">{file ? file.name : "Select JSON file"}</h4>
                <p className="text-sm text-slate-500 px-4">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : "Drag and drop your JSON file here or click to browse"}
                </p>

                {file && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={(e) => {
                      e.preventDefault(); // Stop label from triggering file input
                      handleUpload();
                    }}
                    disabled={uploading}
                    className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition relative z-20"
                  >
                    {uploading ? "Uploading..." : "Confirm Upload"}
                  </motion.button>
                )}
              </label>
            </section>

            {/* Category Management */}
            <section className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-bold px-1 dark:text-white">Category Manager</h3>
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                {categories.length === 0 ? (
                   <p className="text-sm text-slate-400 italic text-center py-4">No categories found</p>
                ) : (
                  <div className="space-y-3">
                    {categories.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        {editingCategory === cat ? (
                          <div className="flex gap-2 w-full">
                            <input 
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              className="flex-1 px-3 py-1 text-sm bg-white dark:bg-slate-900 border border-indigo-400 rounded-lg outline-none"
                              autoFocus
                            />
                            <button onClick={() => handleRenameCategory(cat)} className="text-[10px] font-bold text-indigo-600">SAVE</button>
                            <button onClick={() => setEditingCategory(null)} className="text-[10px] font-bold text-slate-400">ESC</button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-semibold truncate max-w-[150px] dark:text-white">{cat}</span>
                            <button 
                              onClick={() => {
                                setEditingCategory(cat);
                                setNewCategoryName(cat);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Words Table */}
            <section className="lg:col-span-1 space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-bold dark:text-white">Recent Words</h3>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md">
                      <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">English Word</th>
                        <th className="px-6 py-4">Uzbek Meaning</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {loading ? (
                         <tr><td colSpan={3} className="p-12 text-center text-slate-400 italic">Loading database...</td></tr>
                      ) : filteredWords.length === 0 ? (
                        <tr><td colSpan={3} className="p-12 text-center text-slate-400 italic">No entries found.</td></tr>
                      ) : (
                        filteredWords.map((word) => (
                          <tr key={word._id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{word.english_word}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-slate-500 dark:text-slate-400">{word.uzbek_meaning}</span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(word._id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all
      ${active 
        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"}
    `}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string | number, trend: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{trend}</span>
      </div>
      <h4 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</h4>
      <p className="text-3xl font-extrabold tracking-tight dark:text-white mt-1">{value}</p>
    </div>
  );
}
