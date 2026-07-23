"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { UploadCloud, Activity, Loader2, FileText, ArrowRight, TrendingUp, AlertTriangle } from "lucide-react";
import { ComparativeChart } from "@/components/ComparativeChart";

export default function ComparePage() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("English");

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);
    if (file3) formData.append("file3", file3);
    formData.append("language", language);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        setComparison(data.data);
      } else {
        setError(data.error || "Failed to compare reports");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Improved": return "text-green-600 bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-900";
      case "Declined": return "text-red-600 bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-900";
      case "Stable": return "text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-900";
      default: return "text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-900";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-8">
        {!comparison ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
              Health Trajectory Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              Upload two lab reports from different time periods to instantly see how your health has changed.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-5xl justify-center items-center">
              {/* File 1 Upload */}
              <label className="w-full flex-1 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl p-8 bg-card hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer flex flex-col items-center justify-center group relative overflow-hidden">
                <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => e.target.files && setFile1(e.target.files[0])} />
                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-base mb-1 truncate w-full text-center">{file1 ? file1.name : "Oldest Report"}</h3>
                <p className="text-xs text-muted-foreground">{file1 ? "Ready" : "Upload oldest"}</p>
              </label>

              <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block shrink-0" />

              {/* File 2 Upload */}
              <label className="w-full flex-1 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl p-8 bg-card hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer flex flex-col items-center justify-center group relative overflow-hidden">
                <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => e.target.files && setFile2(e.target.files[0])} />
                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="font-semibold text-base mb-1 truncate w-full text-center">{file2 ? file2.name : "Intermediate/Newer"}</h3>
                <p className="text-xs text-muted-foreground">{file2 ? "Ready" : "Upload recent"}</p>
              </label>
              
              <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block shrink-0" />
              
              {/* File 3 Upload (Optional) */}
              <label className="w-full flex-1 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-2xl p-8 bg-card hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer flex flex-col items-center justify-center group relative overflow-hidden">
                <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => e.target.files && setFile3(e.target.files[0])} />
                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-semibold text-base mb-1 truncate w-full text-center">{file3 ? file3.name : "Newest (Optional)"}</h3>
                <p className="text-xs text-muted-foreground">{file3 ? "Ready" : "Upload newest"}</p>
              </label>
            </div>

            {error && <p className="text-red-500 mt-6 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

            <button 
              onClick={handleCompare} 
              disabled={loading || !file1 || !file2}
              className="mt-12 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
              {loading ? "Analyzing Trajectory..." : "Compare Reports"}
            </button>
          </div>
        ) : (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                Comparison Results
              </h2>
              <button onClick={() => { setComparison(null); setFile1(null); setFile2(null); setFile3(null); }} className="text-sm text-blue-500 hover:underline font-medium">New Comparison</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Status */}
              <div className={`col-span-1 border-2 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center ${statusColor(comparison.health_improvement_status)}`}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Health Trajectory</h3>
                <p className="text-4xl font-extrabold">{comparison.health_improvement_status}</p>
              </div>

              {/* Summary Block */}
              <div className="col-span-1 md:col-span-2 border rounded-2xl p-6 bg-card shadow-sm">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Trajectory Summary
                </h3>
                <p className="text-foreground/90 leading-relaxed text-sm md:text-base">
                  {comparison.health_improvement_summary}
                </p>
              </div>
            </div>

            {/* Visual Chart */}
            <ComparativeChart report1={comparison.report1_biomarkers} report2={comparison.report2_biomarkers} report3={comparison.report3_biomarkers} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Key Changes */}
              <div className="border rounded-2xl p-6 bg-card shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Key Changes
                </h3>
                <ul className="space-y-3">
                  {comparison.key_changes?.map((change: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5"></span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="border rounded-2xl p-6 bg-card shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Recommendations
                </h3>
                <ul className="space-y-3">
                  {comparison.recommendations?.map((rec: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-1.5"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
          </section>
        )}
      </main>
    </div>
  );
}
