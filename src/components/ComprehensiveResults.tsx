import React, { useMemo } from 'react';
import { Stethoscope, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const ComprehensiveResults = ({ biomarkers }: { biomarkers: any[] }) => {
  if (!biomarkers || biomarkers.length === 0) return null;

  // Group biomarkers by category
  const groupedBiomarkers = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    biomarkers.forEach(b => {
      const category = b.category || "Others";
      if (!groups[category]) groups[category] = [];
      groups[category].push(b);
    });
    return groups;
  }, [biomarkers]);

  return (
    <div className="border rounded-2xl p-6 md:p-8 bg-card shadow-sm mt-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
        <Stethoscope className="w-6 h-6 text-blue-500" />
        Comprehensive Test Results
      </h3>
      
      <div className="space-y-8">
        {Object.entries(groupedBiomarkers).map(([category, tests], idx) => (
          <div key={idx} className="space-y-3">
            <h4 className="font-semibold text-lg text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-lg inline-block">
              {category}
            </h4>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Test Name</th>
                    <th className="px-4 py-3 font-semibold">Result</th>
                    <th className="px-4 py-3 font-semibold">Unit</th>
                    <th className="px-4 py-3 font-semibold">Reference Range</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test: any, tIdx: number) => (
                    <tr key={tIdx} className={`border-b last:border-0 hover:bg-muted/20 ${test.status !== 'Normal' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                      <td className="px-4 py-3 font-medium text-foreground/90">{test.testName}</td>
                      <td className={`px-4 py-3 font-bold ${test.status !== 'Normal' ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                        {test.value}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{test.unit}</td>
                      <td className="px-4 py-3 text-muted-foreground">{test.referenceRange || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          test.status === 'Normal' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          test.status === 'Borderline' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {test.status === 'Normal' ? <CheckCircle2 className="w-3 h-3" /> : 
                           test.status === 'Borderline' ? <AlertCircle className="w-3 h-3" /> : 
                           <AlertTriangle className="w-3 h-3" />}
                          {test.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
