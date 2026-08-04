import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Activity } from 'lucide-react';

export const ComparativeChart = ({ report1, report2, report3 }: { report1: any[], report2: any[], report3?: any[] }) => {
  const chartData = useMemo(() => {
    if (!report1 || !report2) return [];

    const hasReport3 = report3 && report3.length > 0;
    const testMap = new Map<string, any>();
    const normalize = (name: string) => name?.toLowerCase().trim() || "";

    const addOrUpdate = (reportIndex: number, test: any) => {
      const key = normalize(test.test_name);
      if (!key) return;

      // Extract numeric value for charting
      const numValue = parseFloat(test.value);
      if (isNaN(numValue)) return;

      if (!testMap.has(key)) {
        testMap.set(key, {
          name: test.test_name,
          category: test.category || "Others",
          unit: test.unit || ""
        });
      }

      const entry = testMap.get(key);
      if (reportIndex === 1) entry["Report 1 (Oldest)"] = numValue;
      if (reportIndex === 2) {
        if (hasReport3) {
          entry["Report 2 (Intermediate)"] = numValue;
        } else {
          entry["Report 2 (Newer)"] = numValue;
        }
      }
      if (reportIndex === 3) entry["Report 3 (Newest)"] = numValue;
      
      if (!entry.unit && test.unit) entry.unit = test.unit;
    };

    report1.forEach(t => addOrUpdate(1, t));
    report2.forEach(t => addOrUpdate(2, t));
    if (hasReport3) {
      report3.forEach(t => addOrUpdate(3, t));
    }

    return Array.from(testMap.values());
  }, [report1, report2, report3]);

  const scoreData = useMemo(() => {
    if (!report1 || !report2) return [];

    const calculateScore = (biomarkers: any[]) => {
      if (!biomarkers || biomarkers.length === 0) return 0;
      let score = 0;
      biomarkers.forEach(b => {
        if (b.status === 'Normal') score += 100;
        else if (b.status === 'Borderline') score += 50;
      });
      return Math.round(score / biomarkers.length);
    };

    const data = [
      { name: 'Oldest', Score: calculateScore(report1) },
      { name: report3 && report3.length > 0 ? 'Intermediate' : 'Newer', Score: calculateScore(report2) }
    ];

    if (report3 && report3.length > 0) {
      data.push({ name: 'Newest', Score: calculateScore(report3) });
    }

    return data;
  }, [report1, report2, report3]);

  if (chartData.length === 0) return null;

  return (
    <div className="border rounded-2xl p-6 bg-card shadow-sm mt-6">
      <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        Visual Trajectory Analysis
      </h3>

      {/* Score Trend Line Chart */}
      <div className="mb-12">
        <h4 className="font-semibold text-base mb-4 flex items-center gap-2 text-indigo-600">
          <Activity className="w-4 h-4" />
          Overall Wellness Score Trend
        </h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="Score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-base flex items-center gap-2 text-blue-600">
          Detailed Biomarker Changes
        </h4>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              interval={0} 
              angle={-45} 
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any, name: any, props: any) => [`${value} ${props.payload.unit || ''}`, name]}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="Report 1 (Oldest)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            {report3 && report3.length > 0 ? (
              <>
                <Bar dataKey="Report 2 (Intermediate)" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Report 3 (Newest)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </>
            ) : (
              <Bar dataKey="Report 2 (Newer)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
