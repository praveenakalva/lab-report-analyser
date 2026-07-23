import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

export const ComparativeChart = ({ report1, report2, report3 }: { report1: any[], report2: any[], report3?: any[] }) => {
  const chartData = useMemo(() => {
    if (!report1 || !report2) return [];

    const data: any[] = [];
    const hasReport3 = report3 && report3.length > 0;
    
    // Find matching biomarkers
    report2.forEach(r2 => {
      const r1 = report1.find((b: any) => b.test_name === r2.test_name);
      if (r1) {
        const item: any = {
          name: r2.test_name,
          "Report 1 (Oldest)": r1.value,
          "Report 2": r2.value,
          unit: r2.unit,
          category: r2.category
        };

        if (hasReport3) {
          const r3 = report3.find((b: any) => b.test_name === r2.test_name);
          if (r3) {
            item["Report 3 (Newest)"] = r3.value;
            // Also update Report 2 label to "Intermediate"
            item["Report 2 (Intermediate)"] = item["Report 2"];
            delete item["Report 2"];
          }
        } else {
           // Rename Report 2 to Newer if no report 3
           item["Report 2 (Newer)"] = item["Report 2"];
           delete item["Report 2"];
        }

        data.push(item);
      }
    });

    return data;
  }, [report1, report2, report3]);

  if (chartData.length === 0) return null;

  return (
    <div className="border rounded-2xl p-6 bg-card shadow-sm mt-6">
      <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        Visual Trajectory Analysis
      </h3>
      
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
