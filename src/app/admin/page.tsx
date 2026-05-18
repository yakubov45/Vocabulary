"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
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
  Home,
  LogOut
} from "lucide-react";

interface Word {
  _id: string;
  english_word: string;
  uzbek_meaning: string;
  examples: string[];
  rank: string;
  category: string;
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
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [rankCategories, setRankCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [newRankName, setNewRankName] = useState("");
  const [newCategoryNameForRank, setNewCategoryNameForRank] = useState("");
  
  const [manualWord, setManualWord] = useState({
    english_word: "",
    uzbek_meaning: "",
    examples: ["", ""],
    category: "",
    rank: ""
  });
  const [showManualForm, setShowManualForm] = useState(false);

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

  const fetchCategoriesForRank = async (rank: string) => {
    try {
      const res = await fetch(`/api/categories?rank=${encodeURIComponent(rank)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.categories) setRankCategories(data.categories);
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

  useEffect(() => {
    if (selectedRank) {
      fetchCategoriesForRank(selectedRank);
    }
  }, [selectedRank]);

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
    formData.append("category", activeCategory || categoryTitle);
    formData.append("rank", selectedRank || rankTitle);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setFile(null);
        fetchWords();
        fetchCategories();
        fetchRanks();
        if (selectedRank) fetchCategoriesForRank(selectedRank);
        alert("Words uploaded successfully!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      alert("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRank = async (rank: string) => {
    if (!confirm(`Are you sure you want to delete ALL words in lesson "${rank}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/words?rank=${encodeURIComponent(rank)}`, { method: "DELETE" });
      if (res.ok) {
        fetchWords();
        fetchRanks();
        if (selectedRank === rank) setSelectedRank(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (!confirm(`Are you sure you want to delete ALL words in category "${category}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/words?category=${encodeURIComponent(category)}`, { method: "DELETE" });
      if (res.ok) {
        fetchWords();
        fetchCategories();
        if (activeCategory === category) setActiveCategory(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameRank = async (oldRank: string) => {
    const newRank = prompt("Enter new name for lesson:", oldRank);
    if (!newRank || newRank === oldRank) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'rank', oldTitle: oldRank, newTitle: newRank })
      });
      if (res.ok) {
        fetchWords();
        fetchRanks();
        if (selectedRank === oldRank) setSelectedRank(newRank);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameCategory = async (oldCat: string) => {
    const newCat = prompt("Enter new name for section:", oldCat);
    if (!newCat || newCat === oldCat) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'category', oldTitle: oldCat, newTitle: newCat, rankContext: selectedRank })
      });
      if (res.ok) {
        fetchWords();
        if (selectedRank) fetchCategoriesForRank(selectedRank);
        if (activeCategory === oldCat) setActiveCategory(newCat);
      }
    } catch (err) {
      console.error(err);
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

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualWord),
      });
      if (res.ok) {
        setManualWord({ ...manualWord, english_word: "", uzbek_meaning: "", examples: ["", ""] });
        fetchWords();
        fetchCategories();
        fetchRanks();
        alert("Word added successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add word");
      }
    } catch (err) {
      alert("Error adding word");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-slate-950 flex">
      
      {/* Sidebar */}
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
            <SidebarItem 
              icon={<LogOut size={20} />} 
              label="Logout" 
              onClick={() => signOut({ callbackUrl: "/" })}
            />
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
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-black tracking-tight dark:text-white">Admin Dashboard</h1>
              <p className="text-slate-500 font-medium">Manage your vocabulary, lessons, and student progress</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDeleteAll}
                className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/30 text-rose-600 rounded-xl font-semibold shadow-sm hover:bg-rose-50 dark:hover:bg-rose-500/10 transition flex items-center gap-2"
              >
                <Trash2 size={18} /> Clear All
              </button>
              <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                Export Data
              </button>
              <button 
                onClick={() => setShowManualForm(!showManualForm)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition flex items-center gap-2"
              >
                <Plus size={18} strokeWidth={3} /> {showManualForm ? "Close Form" : "Add Word"}
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Users className="text-indigo-600" />} label="Total Students" value="1,284" trend="+12% growth" />
            <StatCard icon={<BookOpen className="text-emerald-600" />} label="Total Words" value={words.length} trend="Active database" />
            <StatCard icon={<BarChart3 className="text-amber-600" />} label="Quiz Sessions" value="856" trend="Last 7 days" />
            <StatCard icon={<AlertCircle className="text-rose-600" />} label="Avg. Accuracy" value="84%" trend="+2.4% boost" />
          </div>

          <AnimatePresence>
            {showManualForm && (
              <motion.section 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 p-8 shadow-xl shadow-indigo-500/5 overflow-hidden"
              >
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-xl font-bold mb-8 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center">
                      <Plus size={18} className="text-indigo-600" />
                    </div>
                    Manual Word Entry
                  </h3>
                  <form onSubmit={handleManualAdd} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Word Details</label>
                        <input 
                          required
                          type="text" 
                          placeholder="English Word"
                          value={manualWord.english_word}
                          onChange={(e) => setManualWord({...manualWord, english_word: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                        />
                        <input 
                          required
                          type="text" 
                          placeholder="Uzbek Meaning"
                          value={manualWord.uzbek_meaning}
                          onChange={(e) => setManualWord({...manualWord, uzbek_meaning: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Classification</label>
                        <input 
                          required
                          type="text" 
                          list="rank-list"
                          placeholder="Daraja (Rank)"
                          value={manualWord.rank}
                          onChange={(e) => setManualWord({...manualWord, rank: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                        />
                        <input 
                          required
                          type="text" 
                          list="category-list"
                          placeholder="Bo'lim (Category)"
                          value={manualWord.category}
                          onChange={(e) => setManualWord({...manualWord, category: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Example Sentences</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="Example Sentence 1"
                          value={manualWord.examples[0]}
                          onChange={(e) => {
                            const newEx = [...manualWord.examples];
                            newEx[0] = e.target.value;
                            setManualWord({...manualWord, examples: newEx});
                          }}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                        />
                        <input 
                          type="text" 
                          placeholder="Example Sentence 2"
                          value={manualWord.examples[1]}
                          onChange={(e) => {
                            const newEx = [...manualWord.examples];
                            newEx[1] = e.target.value;
                            setManualWord({...manualWord, examples: newEx});
                          }}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit"
                        className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition active:scale-95"
                      >
                        Add to Database
                      </button>
                    </div>
                  </form>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl font-black dark:text-white">Vocabulary Structure</h2>
                <p className="text-slate-500">Organize lessons and upload data</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <input 
                  type="text" 
                  placeholder="New Lesson Name..." 
                  value={newRankName}
                  onChange={(e) => setNewRankName(e.target.value)}
                  className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                />
                <button 
                  onClick={() => {
                    if (newRankName) {
                      setAllRanks(prev => [...new Set([...prev, newRankName])]);
                      setSelectedRank(newRankName);
                      setNewRankName("");
                    }
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/10 hover:bg-indigo-500 transition"
                >
                  Create Lesson
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Lessons</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {allRanks.map(rank => (
                    <div key={rank} className="relative group">
                      <button 
                        onClick={() => {
                          setSelectedRank(rank);
                          setActiveCategory(null);
                        }}
                        className={`w-full p-4 rounded-2xl text-left font-bold transition-all border-2 ${selectedRank === rank ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20" : "bg-slate-50 dark:bg-slate-800/50 border-transparent dark:text-white hover:border-indigo-200"}`}
                      >
                        {rank}
                      </button>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRenameRank(rank); }}
                          className="p-2 text-indigo-500/50 hover:text-white hover:bg-indigo-500 rounded-lg transition-all"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteRank(rank); }}
                          className="p-2 text-rose-500/50 hover:text-white hover:bg-rose-500 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {allRanks.length === 0 && <p className="text-xs text-slate-400 italic p-4">No lessons yet</p>}
                </div>
              </div>

              <div className="lg:col-span-9">
                {selectedRank ? (
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] p-8 min-h-[500px] flex flex-col border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                      <div>
                        <h3 className="text-xl font-bold dark:text-white">{selectedRank} <span className="text-slate-400 font-medium">Categories</span></h3>
                        <p className="text-sm text-slate-500">Sections within this lesson</p>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="New Category Name..." 
                          value={newCategoryNameForRank}
                          onChange={(e) => setNewCategoryNameForRank(e.target.value)}
                          className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <button 
                          onClick={() => {
                            if (newCategoryNameForRank) {
                              setRankCategories(prev => [...new Set([...prev, newCategoryNameForRank])]);
                              setActiveCategory(newCategoryNameForRank);
                              setNewCategoryNameForRank("");
                            }
                          }}
                          className="px-5 py-3 bg-white dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition"
                        >
                          Add Section
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
                      {rankCategories.map(cat => (
                        <div key={cat} className="relative group">
                          <button 
                            onClick={() => setActiveCategory(cat)}
                            className={`w-full h-full p-6 rounded-[1.5rem] border-2 text-left transition-all ${activeCategory === cat ? "border-indigo-500 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/5" : "bg-white dark:bg-slate-900 border-transparent hover:border-indigo-100"}`}
                          >
                            <div className="flex justify-between items-center mb-1 pr-16">
                              <span className="font-bold dark:text-white truncate">{cat}</span>
                              <BookOpen size={16} className={activeCategory === cat ? "text-indigo-600" : "text-slate-300"} />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ready to upload</p>
                          </button>
                          <div className="absolute right-3 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRenameCategory(cat); }}
                              className="p-2 text-indigo-500/50 hover:text-white hover:bg-indigo-500 rounded-lg transition-all"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                              className="p-2 text-rose-500/50 hover:text-white hover:bg-rose-500 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {rankCategories.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                          <p className="text-slate-400 font-medium">No sections added to this lesson yet</p>
                        </div>
                      )}
                    </div>

                    {activeCategory && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-auto bg-white dark:bg-slate-900 p-1 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 shadow-2xl shadow-indigo-500/5"
                      >
                        <div className="p-8">
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Upload Vocabulary to: <span className="text-indigo-600">{activeCategory}</span></h4>
                          <label 
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            className={`
                              relative border-2 border-dashed rounded-[2rem] p-12 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer
                              ${dragActive ? "border-indigo-500 bg-indigo-50/30" : "border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20"}
                              ${file ? "border-emerald-500 bg-emerald-50/10" : ""}
                            `}
                          >
                            <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${file ? "bg-emerald-500" : "bg-indigo-600"} text-white shadow-lg`}>
                              <UploadCloud size={30} />
                            </div>
                            <p className="font-bold dark:text-white text-lg">{file ? file.name : "Drop JSON file here"}</p>
                            <p className="text-sm text-slate-500 mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "or click to browse your computer"}</p>
                            
                            {file && (
                              <button 
                                onClick={(e) => { e.preventDefault(); handleUpload(); }}
                                disabled={uploading}
                                className="mt-8 px-10 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition active:scale-95"
                              >
                                {uploading ? "Uploading..." : "Confirm & Import Data"}
                              </button>
                            )}
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="h-full bg-slate-50 dark:bg-slate-900/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-20 min-h-[500px]">
                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-sm mb-6 border border-slate-100 dark:border-slate-800">
                      <LayoutDashboard size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400">Select a lesson to begin</h3>
                    <p className="text-slate-500 max-w-xs mt-2">Choose a lesson from the left to manage its categories and upload vocabulary</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <h3 className="text-xl font-bold dark:text-white">Recent Vocabulary</h3>
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Quick search words..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                      <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <th className="px-8 py-5">English Word</th>
                        <th className="px-8 py-5">Uzbek Meaning</th>
                        <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {loading ? (
                         <tr><td colSpan={3} className="p-20 text-center text-slate-400 animate-pulse font-medium">Synchronizing database...</td></tr>
                      ) : filteredWords.length === 0 ? (
                        <tr><td colSpan={3} className="p-20 text-center text-slate-400 italic">No records found matching your search</td></tr>
                      ) : (
                        filteredWords.map((word) => (
                          <tr key={word._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-lg">{word.english_word}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase rounded-md tracking-tighter">{word.rank}</span>
                                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase rounded-md tracking-tighter">{word.category}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-slate-500 dark:text-slate-400 font-medium">{word.uzbek_meaning}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => handleDelete(word._id)}
                                className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="xl:col-span-1 space-y-6">
              <h3 className="text-xl font-bold px-2 dark:text-white">Rename Segments</h3>
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 space-y-6 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-1">Global Categories</p>
                {categories.length === 0 ? (
                   <div className="py-10 text-center border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-3xl">
                     <p className="text-sm text-slate-400 italic">No categories available</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {categories.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group">
                        {editingCategory === cat ? (
                          <div className="flex gap-2 w-full">
                            <input 
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              className="flex-1 px-4 py-2 text-sm bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-xl outline-none shadow-lg shadow-indigo-500/10"
                              autoFocus
                            />
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handleRenameCategory(cat)} className="px-2 py-1 text-[9px] font-black bg-indigo-600 text-white rounded-md">SAVE</button>
                              <button onClick={() => setEditingCategory(null)} className="px-2 py-1 text-[9px] font-black bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-md">ESC</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                                <Edit size={12} className="text-indigo-400" />
                              </div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{cat}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setNewCategoryName(cat);
                                }}
                                className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-4 px-1">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    <span className="font-bold text-indigo-500">Note:</span> Renaming a category will update all words associated with it across all lessons.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
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
