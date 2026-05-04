"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileText, Trash2, Edit, Search } from "lucide-react";

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

  const filteredWords = words.filter(word => 
    word.english_word.toLowerCase().includes(searchTerm.toLowerCase()) || 
    word.uzbek_meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchWords();
  }, []);

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

  const handleUpload = async () => {
    if (!file) return alert("Please select a .docx file");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Success! Imported ${data.count} words.`);
        setFile(null);
        fetchWords(); // Refresh list
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

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your English vocabulary database</p>
          </div>
          <a href="/" className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition">
            Back to Home
          </a>
        </div>

        {/* Upload Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UploadCloud className="text-blue-500" />
            Upload Vocabulary (.json)
          </h2>
          
          <div className="border-2 border-dashed border-blue-200 rounded-xl p-10 flex flex-col items-center justify-center bg-blue-50/50 transition-colors hover:bg-blue-50">
            <FileText className="w-12 h-12 text-blue-400 mb-4" />
            <p className="text-slate-600 mb-6 font-medium">Drag & Drop your JSON file here</p>
            
            <input 
              type="file" 
              accept=".json,application/json" 
              onChange={handleFileChange}
              className="hidden" 
              id="file-upload" 
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition shadow-sm"
            >
              Select File
            </label>
            {file && <p className="mt-4 text-sm text-blue-600 font-semibold">{file.name}</p>}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Importing..." : "Start Import"}
            </button>
          </div>
        </div>

        {/* Words Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              Vocabulary Database
              <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm font-semibold">
                {filteredWords.length} Words
              </span>
            </h2>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search words..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading words...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm">
                    <th className="p-4 font-medium border-b border-slate-100">English Word</th>
                    <th className="p-4 font-medium border-b border-slate-100">Uzbek Meaning</th>
                    <th className="p-4 font-medium border-b border-slate-100">Examples</th>
                    <th className="p-4 font-medium border-b border-slate-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        {searchTerm ? "No words found matching your search." : "No words found. Upload a .json file to get started."}
                      </td>
                    </tr>
                  ) : (
                    filteredWords.map((word) => (
                      <tr key={word._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                        <td className="p-4 font-semibold text-slate-800">{word.english_word}</td>
                        <td className="p-4 text-slate-600">{word.uzbek_meaning}</td>
                        <td className="p-4 text-sm text-slate-500">
                          {word.examples && word.examples.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {word.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                            </ul>
                          ) : (
                            <span className="italic text-slate-400">No examples</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(word._id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
