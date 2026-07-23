import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, Scale } from 'lucide-react';

export const ComparisonTable = ({ currentReport, previousReport }: { currentReport: any, previousReport: any }) => {
  if (!currentReport || !previousReport || !currentReport.biomarkers || !previousReport.biomarkers) {
    return null;
  }

  // Find matching biomarkers
  const comparisonData = currentReport.biomarkers.map((current: any) => {
    const previous = previousReport.biomarkers.find((b: any) => b.testName === current.testName);
    if (!previous) return null;

    const currentVal = Number(current.value);
    const prevVal = Number(previous.value);
    
    if (isNaN(currentVal) || isNaN(prevVal)) return null;

    const diff = currentVal - prevVal;
    const percentChange = prevVal !== 0 ? ((diff / prevVal) * 100).toFixed(1) : "0.0";
    
    // Determine if the change is "Good" or "Bad" loosely based on status changes.
    // This is a simplified heuristic: if it goes towards "Normal", it's good.
    let trend = "neutral";
    if (current.status === "Normal" && previous.status !== "Normal") trend = "good";
    else if (current.status !== "Normal" && previous.status === "Normal") trend = "bad";
    else if (diff > 0) trend = "up";
    else if (diff < 0) trend = "down";

    return {
      testName: current.testName,
      currentValue: currentVal,
      prevValue: prevVal,
      unit: current.unit,
      diff,
      percentChange,
      trend,
      currentStatus: current.status,
      prevStatus: previous.status
    };
  }).filter(Boolean);

  if (comparisonData.length === 0) return null;

  return (
    <div className="border rounded-2xl p-6 bg-card shadow-sm mt-6">
      <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-blue-500" />
        Previous vs Current Analysis
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Biomarker</th>
              <th className="px-4 py-3">Previous ({new Date(previousReport.createdAt).toLocaleDateString()})</th>
              <th className="px-4 py-3">Current ({new Date(currentReport.createdAt).toLocaleDateString()})</th>
              <th className="px-4 py-3 rounded-tr-lg">Change</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((data: any, idx: number) => (
              <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{data.testName}</td>
                <td className="px-4 py-3">
                  {data.prevValue} {data.unit} 
                  <span className={`ml-2 text-xs opacity-70 ${data.prevStatus !== 'Normal' ? 'text-red-500 font-bold' : ''}`}>({data.prevStatus})</span>
                </td>
                <td className="px-4 py-3">
                  {data.currentValue} {data.unit}
                  <span className={`ml-2 text-xs opacity-70 ${data.currentStatus !== 'Normal' ? 'text-red-500 font-bold' : ''}`}>({data.currentStatus})</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 font-semibold">
                    {data.diff > 0 ? (
                      <span className={data.trend === 'bad' ? 'text-red-600' : data.trend === 'good' ? 'text-green-600' : 'text-blue-600'}>
                        <ArrowUpRight className="w-4 h-4 inline" /> +{data.diff.toFixed(2)} ({data.percentChange}%)
                      </span>
                    ) : data.diff < 0 ? (
                      <span className={data.trend === 'bad' ? 'text-red-600' : data.trend === 'good' ? 'text-green-600' : 'text-blue-600'}>
                        <ArrowDownRight className="w-4 h-4 inline" /> {data.diff.toFixed(2)} ({data.percentChange}%)
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        <Minus className="w-4 h-4 inline" /> No change
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
