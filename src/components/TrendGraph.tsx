import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

export const TrendGraph = ({ history }: { history: any[] }) => {
  // Sort history chronologically
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [history]);

  // Extract dates for Bar keys (ensure uniqueness if multiple on same day)
  const dateKeys = useMemo(() => {
    const keys: string[] = [];
    const seen = new Set<string>();
    
    sortedHistory.forEach((report, idx) => {
      let baseDate = new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
      let finalKey = baseDate;
      let counter = 1;
      while (seen.has(finalKey)) {
        finalKey = `${baseDate} (${counter})`;
        counter++;
      }
      seen.add(finalKey);
      keys.push(finalKey);
    });
    return keys;
  }, [sortedHistory]);

  const chartData = useMemo(() => {
    if (sortedHistory.length < 2) return [];

    const dataMap = new Map<string, any>();

    sortedHistory.forEach((report, index) => {
      const dateKey = dateKeys[index];
      if (report.biomarkers) {
        report.biomarkers.forEach((b: any) => {
          if (!dataMap.has(b.testName)) {
            dataMap.set(b.testName, { name: b.testName, unit: b.unit });
          }
          const item = dataMap.get(b.testName);
          // Only map if value is a number
          const val = Number(b.value);
          if (!isNaN(val)) {
            item[dateKey] = val;
          }
        });
      }
    });

    return Array.from(dataMap.values());
  }, [sortedHistory, dateKeys]);

  if (!history || history.length < 2 || chartData.length === 0) {
    return null; // Not enough data for trending
  }

  // Pre-defined color palette for different dates
  const colors = ['#94a3b8', '#818cf8', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  // Calculate dynamic width based on number of biomarkers and bars to prevent squishing
  const minWidth = Math.max(100, chartData.length * (dateKeys.length * 2));

  return (
    <div className="border rounded-2xl p-6 bg-card shadow-sm mt-6 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Longitudinal Trend Analysis
        </h3>
      </div>

      <div className="h-[500px] w-full overflow-x-auto pb-4">
        <div style={{ minWidth: `${minWidth}%`, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                interval={0} 
                angle={-45} 
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any, name: any, props: any) => [`${value} ${props.payload.unit || ''}`, name]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} verticalAlign="top" />
              {dateKeys.map((dateKey, index) => (
                <Bar 
                  key={dateKey} 
                  dataKey={dateKey} 
                  fill={colors[index % colors.length]} 
                  radius={[4, 4, 0, 0]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
