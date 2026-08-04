import React, { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, Scale, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const DetailedComparisonTable = ({ report1, report2, report3 }: { report1: any[], report2: any[], report3?: any[] }) => {
  const tableData = useMemo(() => {
    if (!report1 || !report2) return [];

    const hasReport3 = report3 && report3.length > 0;
    
    // Map to collect all unique test names, preserving order as much as possible
    const testMap = new Map<string, any>();

    const normalize = (name: string) => name?.toLowerCase().trim() || "";

    const addOrUpdate = (reportIndex: number, test: any) => {
      const key = normalize(test.test_name);
      if (!testMap.has(key)) {
        testMap.set(key, {
          testName: test.test_name,
          category: test.category || "Others",
          unit: test.unit || "",
          r1: null,
          r2: null,
          r3: null
        });
      }
      const entry = testMap.get(key);
      if (reportIndex === 1) entry.r1 = test;
      if (reportIndex === 2) entry.r2 = test;
      if (reportIndex === 3) entry.r3 = test;
      if (!entry.unit && test.unit) entry.unit = test.unit;
    };

    report1.forEach(t => addOrUpdate(1, t));
    report2.forEach(t => addOrUpdate(2, t));
    if (hasReport3) {
      report3.forEach(t => addOrUpdate(3, t));
    }

    return Array.from(testMap.values());
  }, [report1, report2, report3]);

  if (tableData.length === 0) return null;

  // Group by category
  const groupedData = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    tableData.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [tableData]);

  const renderValueCell = (report: any) => {
    if (!report) return <span className="text-muted-foreground italic text-xs">N/A</span>;
    
    let colorClass = "text-foreground";
    let Icon = null;
    
    if (report.status === "Abnormal" || report.status === "Critical") {
      colorClass = "text-orange-600 dark:text-orange-400 font-bold";
      Icon = AlertCircle;
    } else if (report.status === "Borderline") {
      colorClass = "text-yellow-600 dark:text-yellow-400 font-bold";
      Icon = Info;
    } else if (report.status === "Normal") {
      colorClass = "text-green-600 dark:text-green-500";
      Icon = CheckCircle2;
    }

    return (
      <div className="flex items-center gap-1.5">
        <span className={colorClass}>{report.value}</span>
        {Icon && <Icon className={`w-3 h-3 ${colorClass}`} />}
      </div>
    );
  };

  const renderTrend = (first: any, last: any) => {
    if (!first || !last || isNaN(Number(first.value)) || isNaN(Number(last.value))) {
      return <span className="text-muted-foreground">-</span>;
    }
    
    const diff = Number(last.value) - Number(first.value);
    const isWorse = (last.status === "Abnormal" || last.status === "Critical") && first.status === "Normal";
    const isBetter = last.status === "Normal" && (first.status === "Abnormal" || first.status === "Critical");
    
    if (Math.abs(diff) < 0.001) {
      return <span className="text-muted-foreground flex items-center gap-1"><Minus className="w-3 h-3"/> No change</span>;
    }

    const icon = diff > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />;
    let colorClass = "text-blue-600";
    if (isWorse) colorClass = "text-orange-600";
    if (isBetter) colorClass = "text-green-600";

    return (
      <span className={`flex items-center gap-1 font-semibold ${colorClass}`}>
        {icon}
        {diff > 0 ? '+' : ''}{diff.toFixed(2)}
      </span>
    );
  };

  const hasReport3 = report3 && report3.length > 0;

  return (
    <div className="border rounded-2xl p-6 bg-card shadow-sm mt-6">
      <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
        <Scale className="w-5 h-5 text-indigo-500" />
        Detailed Biomarker Comparison
      </h3>

      <div className="space-y-8">
        {Object.entries(groupedData).map(([category, items], idx) => (
          <div key={idx} className="space-y-3">
            <h4 className="font-semibold text-sm text-indigo-900 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-lg inline-block">
              {category}
            </h4>
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Test Name</th>
                    <th className="px-4 py-3 font-semibold">Oldest Report</th>
                    <th className="px-4 py-3 font-semibold">{hasReport3 ? "Intermediate" : "Newer Report"}</th>
                    {hasReport3 && <th className="px-4 py-3 font-semibold">Newest Report</th>}
                    <th className="px-4 py-3 font-semibold">Unit</th>
                    <th className="px-4 py-3 font-semibold">Overall Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const firstReport = item.r1 || item.r2 || item.r3;
                    const lastReport = item.r3 || item.r2 || item.r1;
                    return (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/10">
                        <td className="px-4 py-3 font-medium text-foreground/90">{item.testName}</td>
                        <td className="px-4 py-3">{renderValueCell(item.r1)}</td>
                        <td className="px-4 py-3">{renderValueCell(item.r2)}</td>
                        {hasReport3 && <td className="px-4 py-3">{renderValueCell(item.r3)}</td>}
                        <td className="px-4 py-3 text-muted-foreground text-xs">{item.unit}</td>
                        <td className="px-4 py-3">{renderTrend(firstReport, lastReport)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
