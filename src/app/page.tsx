"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { UploadCloud, Activity, HeartPulse, CheckCircle2, AlertTriangle, FileText, Loader2, History, User, Calendar, Stethoscope, Download } from "lucide-react";
import { ReportPDF } from "@/components/ReportPDF";
import { TrendGraph } from "@/components/TrendGraph";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ComprehensiveResults } from "@/components/ComprehensiveResults";
import { Header } from "@/components/Header";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-sm text-blue-500 flex items-center gap-1 opacity-50"><Download className="w-4 h-4" /> Loading PDF...</span> }
);

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("English");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("lab_reports_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveToHistory = (newReport: any) => {
    const updated = [newReport, ...history].slice(0, 10); // Keep last 10
    setHistory(updated);
    localStorage.setItem("lab_reports_history", JSON.stringify(updated));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    // Send the most recent previous report (if any) for AI comparison
    if (history.length > 0) {
      const prev = history[0]; // Assuming the last uploaded report is the baseline
      const prevData = {
        date: prev.patientDetails?.sample_date || prev.createdAt,
        biomarkers: prev.biomarkers
      };
      formData.append("previousData", JSON.stringify(prevData));
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok) {
          setReport(data.report);
          saveToHistory(data.report);
        } else {
          setError(data.error || "Failed to analyze report");
        }
      } else {
        const text = await res.text();
        console.error("Non-JSON response from server:", text);
        if (res.status === 413) {
          setError("File is too large. Please upload a smaller file.");
        } else {
          setError(`Server error (${res.status}). Please check the console for details.`);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          {!report ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                Understand Your Health Reports
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mb-8">
                Upload your laboratory reports (PDFs or images) to get plain-language explanations, highlight abnormal values, and generate questions for your doctor.
              </p>
              
              <label 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="w-full max-w-xl border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl p-12 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer flex flex-col items-center justify-center group relative overflow-hidden"
              >
                <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform shadow-blue-500/10">
                  <UploadCloud className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{file ? file.name : "Upload Lab Report"}</h3>
                <p className="text-sm text-muted-foreground">{file ? "Click Analyze to proceed" : "Drag and drop your PDF, PNG, or JPG here"}</p>
              </label>

              {file && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Select Response Language:</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border rounded-lg px-4 py-2 bg-background focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                    <option value="French">French</option>
                  </select>
                </div>
              )}

              {error && <p className="text-red-500 mt-4">{error}</p>}

              {file && (
                <button 
                  onClick={handleAnalyze} 
                  disabled={loading}
                  className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                  {loading ? "Analyzing..." : "Analyze Report"}
                </button>
              )}
            </div>
          ) : (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold">Analysis Results</h2>
                <div className="flex items-center gap-4">
                  <PDFDownloadLink document={<ReportPDF report={report} />} fileName="lab-report-analysis.pdf">
                    {/* @ts-ignore */}
                    {({ loading }: { loading: boolean }) => (
                      <button disabled={loading} className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors font-medium">
                        <Download className="w-4 h-4" />
                        {loading ? "Generating PDF..." : "Download PDF"}
                      </button>
                    )}
                  </PDFDownloadLink>
                  <button onClick={() => { setReport(null); setFile(null); }} className="text-sm text-blue-500 hover:underline font-medium">Upload Another</button>
                </div>
              </div>

              {report.criticalWarnings && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 rounded-xl p-5 shadow-sm flex gap-3 animate-in fade-in zoom-in duration-500">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-600 dark:text-red-400 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">CRITICAL WARNING</h3>
                    <p className="font-medium">{report.criticalWarnings}</p>
                  </div>
                </div>
              )}

              {report.patientDetails && (
                <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Patient Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Patient Name</p>
                      <p className="font-semibold">{report.patientDetails.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Age / Gender</p>
                      <p className="font-semibold">{report.patientDetails.age || "N/A"} / {report.patientDetails.gender || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Referred By</p>
                      <p className="font-semibold flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-muted-foreground" />
                        {report.patientDetails.referred_by || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Sample Date</p>
                      <p className="font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {report.patientDetails.sample_date || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Card */}
                <div className="col-span-1 border rounded-2xl p-6 bg-card shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] -z-10 ${
                    report.status === "Healthy" ? "bg-green-500/10" : 
                    report.status === "Needs Attention" ? "bg-yellow-500/10" : "bg-red-500/10"
                  }`}></div>
                  <div className="flex items-center gap-3 mb-4">
                    {report.status === "Healthy" ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <AlertTriangle className={`w-6 h-6 ${report.status === "Needs Attention" ? "text-yellow-500" : "text-red-500"}`} />}
                    <h3 className="font-semibold text-lg">Overall Status</h3>
                  </div>
                  <p className={`text-3xl font-bold mb-2 ${
                    report.status === "Healthy" ? "text-green-600 dark:text-green-500" : 
                    report.status === "Needs Attention" ? "text-yellow-600 dark:text-yellow-500" : "text-red-600 dark:text-red-500"
                  }`}>{report.status}</p>
                </div>

                {/* Critical Findings */}
                <div className="col-span-1 border rounded-2xl p-6 bg-card shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-6 h-6 text-red-500" />
                    <h3 className="font-semibold text-lg">Abnormalities</h3>
                  </div>
                  <ul className="space-y-3 max-h-32 overflow-y-auto pr-2">
                    {report.biomarkers?.filter((b: any) => b.status !== "Normal").map((b: any, i: number) => (
                      <li key={i} className={`flex items-center justify-between p-3 rounded-lg border ${
                        b.status === "Borderline" ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-900/50" : "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50"
                      }`}>
                        <span className="font-medium text-sm">{b.testName}</span>
                        <span className={`font-bold text-sm ${b.status === "Borderline" ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                          {b.value} {b.unit} <span className="text-xs opacity-70">({b.status})</span>
                        </span>
                      </li>
                    ))}
                    {report.biomarkers?.filter((b: any) => b.status !== "Normal").length === 0 && (
                      <p className="text-sm text-muted-foreground">No abnormal results found.</p>
                    )}
                  </ul>
                </div>

                {/* Normal Findings */}
                <div className="col-span-1 border rounded-2xl p-6 bg-card shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <h3 className="font-semibold text-lg">Normal Results</h3>
                  </div>
                  <div className="flex items-center justify-center h-24">
                    <div className="text-center">
                      <p className="text-4xl font-extrabold text-green-500">
                        {report.biomarkers?.filter((b: any) => b.status === "Normal").length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Biomarkers in range</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Previous vs Current Comparison */}
              {(() => {
                const prevReport = history.find(h => h.id !== report.id && h.patientDetails?.name === report.patientDetails?.name);
                return prevReport ? <ComparisonTable currentReport={report} previousReport={prevReport} /> : null;
              })()}

              {/* Longitudinal Trend Graph */}
              {(() => {
                const patientReports = history.filter(h => h.patientDetails?.name === report.patientDetails?.name);
                // Include current report if it's not already in history (it should be due to saveToHistory)
                const allReports = patientReports.some(h => h.id === report.id) ? patientReports : [report, ...patientReports];
                return allReports.length > 1 ? <TrendGraph history={allReports} /> : null;
              })()}
              
              {/* Executive Summary */}
              <div className="border rounded-2xl p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-sm border-blue-100 dark:border-blue-900 mt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  What You Need to Know
                </h3>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  {report.summary}
                </p>
                <h4 className="font-semibold mt-4 mb-2">Detailed Insights</h4>
                <p className="text-foreground/80 text-sm leading-relaxed mb-6">{report.insights}</p>
                
                {report.precautions && report.precautions.length > 0 && (
                  <>
                    <h4 className="font-semibold mt-4 mb-2 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <AlertTriangle className="w-4 h-4" /> Recommended Precautions
                    </h4>
                    <ul className="list-disc list-inside text-foreground/80 text-sm mb-6 space-y-1">
                      {report.precautions.map((p: string, i: number) => <li key={i}>{p}</li>)}
                    </ul>
                  </>
                )}

                {report.followUps && report.followUps.length > 0 && (
                  <>
                    <h4 className="font-semibold mt-4 mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Activity className="w-4 h-4" /> Follow-ups
                    </h4>
                    <ul className="list-disc list-inside text-foreground/80 text-sm mb-6 space-y-1">
                      {report.followUps.map((f: string, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                  </>
                )}

                {report.diseaseCauses && report.diseaseCauses.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" /> Detected Conditions & Potential Causes
                    </h4>
                    <div className="space-y-4">
                      {report.diseaseCauses.map((dc: any, idx: number) => (
                        <div key={idx} className="space-y-2 pb-2">
                          <p className="font-semibold text-base text-foreground/90">{dc.disease}</p>
                          {dc.description && (
                            <p className="text-sm text-foreground/80 leading-relaxed bg-red-100/30 dark:bg-red-900/10 p-3 rounded-lg">
                              {dc.description}
                            </p>
                          )}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 mt-2">Potential Causes:</p>
                            <ul className="list-disc list-inside text-foreground/80 text-sm">
                              {dc.causes.map((cause: string, cIdx: number) => (
                                <li key={cIdx}>{cause}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.doctorQuestions && (
                  <>
                    <h4 className="font-semibold mt-4 mb-2">Questions for your Doctor</h4>
                    {Array.isArray(report.doctorQuestions) ? (
                      <ul className="list-decimal list-inside text-foreground/80 text-sm mb-6 space-y-2">
                        {report.doctorQuestions.map((q: string, i: number) => (
                          <li key={i} className="leading-relaxed pl-1">{q}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-foreground/80 text-sm mb-6 space-y-2">
                        {report.doctorQuestions.split('\n').filter((q: string) => q.trim() !== '').map((q: string, i: number) => (
                          <p key={i} className="leading-relaxed">{q}</p>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-900/50">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    Disclaimer: Always consult your doctor if you have any doubts. Seek immediate medical care if there are critical results. Do not use this as a substitute for professional medical advice.
                  </p>
                </div>
              </div>

              {/* Comprehensive Systematic Results Table */}
              <ComprehensiveResults biomarkers={report.biomarkers} />
            </section>
          )}
        </div>

        {/* Browser History Sidebar */}
        {history.length > 0 && (
          <aside className="w-full md:w-80 border-l pl-0 md:pl-6 pt-6 md:pt-0 flex flex-col gap-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              Past Reports
            </h3>
            <div className="flex flex-col gap-3">
              {history.map((histItem, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setReport(histItem)}
                  className="p-4 border rounded-xl bg-card hover:bg-accent cursor-pointer transition-colors"
                >
                  <p className="font-medium text-sm truncate">
                    {histItem.patientDetails?.name ? `${histItem.patientDetails.name}'s Report` : (histItem.fileName || `Report ${idx + 1}`)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      histItem.status === "Healthy" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      histItem.status === "Needs Attention" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {histItem.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(histItem.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
