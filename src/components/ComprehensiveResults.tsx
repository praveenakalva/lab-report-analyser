import React, { useMemo } from 'react';
import { Stethoscope, CheckCircle2, Info, AlertCircle, Activity, Utensils, Phone, Calendar, HeartPulse } from 'lucide-react';
import { doctorsDB } from '../lib/doctorsDb';

// Utility to map categories to doctor specializations
const mapCategoryToSpecialization = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('lipid') || cat.includes('cardio') || cat.includes('cholesterol')) return ['Cardiology', 'Interventional Cardiologist', 'Cardiothoracic'];
  if (cat.includes('liver') || cat.includes('hepatic')) return ['Gastroenterology', 'Hepatologist', 'Surgical Gastroenterologist'];
  if (cat.includes('thyroid') || cat.includes('sugar') || cat.includes('diabet') || cat.includes('glucose') || cat.includes('hba1c')) return ['Endocrinologist', 'Diabetology', 'General Medicine'];
  if (cat.includes('kidney') || cat.includes('renal') || cat.includes('urine')) return ['Nephrology', 'Urology', 'Urologist'];
  if (cat.includes('blood') || cat.includes('haematology') || cat.includes('cbc') || cat.includes('hemoglobin')) return ['Haematology', 'Internal Medicine', 'General Physician'];
  return ['General Medicine', 'General Physician', 'Internal Medicine'];
};

// Utility to get care plans based on category
const getCarePlan = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('lipid') || cat.includes('cholesterol')) {
    return {
      diet: "Low saturated fat diet (DASH Diet). Increase soluble fiber (oats, beans). Eat omega-3 rich foods like walnuts and fish.",
      lifestyle: "Aim for 150 mins of moderate aerobic exercise per week. Quit smoking and limit alcohol."
    };
  }
  if (cat.includes('liver')) {
    return {
      diet: "Avoid alcohol entirely. Reduce sodium and processed foods. Eat antioxidant-rich berries and cruciferous vegetables.",
      lifestyle: "Maintain a healthy BMI. Drink at least 3 liters of water daily."
    };
  }
  if (cat.includes('sugar') || cat.includes('diabet') || cat.includes('glucose')) {
    return {
      diet: "Low glycemic index foods. Strict portion control for carbs. Increase lean protein and leafy greens.",
      lifestyle: "Take a 15-minute walk after every meal. Ensure 7-8 hours of quality sleep to regulate insulin."
    };
  }
  if (cat.includes('kidney') || cat.includes('renal')) {
    return {
      diet: "Low sodium, low potassium, and low phosphorus diet. Avoid processed meats and dark colas.",
      lifestyle: "Monitor blood pressure regularly. Avoid NSAID painkillers."
    };
  }
  return {
    diet: "Balanced diet rich in whole foods, vegetables, and lean proteins. Avoid ultra-processed foods.",
    lifestyle: "Stay hydrated, exercise for 30 minutes daily, and manage stress through meditation or yoga."
  };
};

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

  // Calculate Health Score
  const healthScore = useMemo(() => {
    let score = 0;
    biomarkers.forEach(b => {
      if (b.status === 'Normal') score += 100;
      else if (b.status === 'Borderline') score += 50;
      // Abnormal is 0
    });
    return Math.round(score / biomarkers.length);
  }, [biomarkers]);

  // Get abnormal categories for triage and care plans
  const abnormalCategories = useMemo(() => {
    const categories = new Set<string>();
    biomarkers.forEach(b => {
      if (b.status !== 'Normal') categories.add(b.category || "Others");
    });
    return Array.from(categories);
  }, [biomarkers]);

  // Triage: Find recommended doctors grouped by specialty
  const groupedDoctors = useMemo(() => {
    if (abnormalCategories.length === 0) return [];
    
    let neededSpecs = new Set<string>();
    abnormalCategories.forEach(cat => {
      mapCategoryToSpecialization(cat).forEach(s => neededSpecs.add(s));
    });
    
    const groups = Array.from(neededSpecs).map(spec => {
      const matches = doctorsDB.filter(doc => doc.specialization.toLowerCase().includes(spec.toLowerCase()));
      // deduplicate
      const uniqueMatches = matches.filter((v,i,a)=>a.findIndex(v2=>(v2.name===v.name))===i).slice(0, 3);
      return {
        specialty: spec,
        doctors: uniqueMatches
      };
    }).filter(g => g.doctors.length > 0);
    
    return groups;
  }, [abnormalCategories]);

  const scoreColor = healthScore >= 80 ? 'text-green-500' : healthScore >= 50 ? 'text-yellow-500' : 'text-red-500';
  const scoreStroke = healthScore >= 80 ? 'stroke-green-500' : healthScore >= 50 ? 'stroke-yellow-500' : 'stroke-red-500';

  return (
    <div className="space-y-8 mt-8">
      
      {/* Gamification & Health Score */}
      <div className="border rounded-2xl p-6 md:p-8 bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle className="stroke-slate-700 fill-none" strokeWidth="8" cx="50" cy="50" r="40" />
            <circle 
              className={`\${scoreStroke} fill-none transition-all duration-1000 ease-out`} 
              strokeWidth="8" 
              strokeDasharray="251.2" 
              strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
              strokeLinecap="round"
              cx="50" cy="50" r="40" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-black \${scoreColor}`}>{healthScore}</span>
            <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">Score</span>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-400" />
            Overall Wellness Score
          </h3>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
            {healthScore >= 80 
              ? "Great job! Your biomarkers are mostly within healthy ranges. Keep up the good work and maintain your current lifestyle." 
              : healthScore >= 50 
              ? "You have some areas that need attention. A few biomarkers are borderline or out of range. Check the care plan below."
              : "Your results indicate several critical areas needing immediate clinical attention. Please consult a specialist as soon as possible."}
          </p>
        </div>
      </div>

      {/* Clinical Triage & Doctor Booking */}
      {groupedDoctors.length > 0 && (
        <div className="border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 md:p-8 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
            <HeartPulse className="w-6 h-6 text-indigo-500" />
            Direct-to-Doctor Clinical Triage
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Based on your abnormal lab results, our AI has matched you with the best specialists from Malla Reddy Narayana Multispeciality Hospital.
          </p>
          
          <div className="space-y-8">
            {groupedDoctors.map((group, groupIdx) => (
              <div key={groupIdx}>
                <h4 className="font-semibold text-lg text-indigo-800 dark:text-indigo-400 mb-4 flex items-center gap-2 border-b border-indigo-200 dark:border-indigo-800/50 pb-2">
                  Specialist Required: {group.specialty}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {group.doctors.map((doc, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-foreground mb-1">{doc.name}</h4>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1 line-clamp-1" title={doc.specialization}>{doc.specialization}</p>
                      <p className="text-xs text-muted-foreground mb-5 line-clamp-1">{doc.hospital}</p>
                      
                      <div className="flex gap-2">
                        <a href="https://www.mallareddynarayana.com/find-a-doctor" target="_blank" rel="noreferrer" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors">
                          <Calendar className="w-3 h-3" /> Book
                        </a>
                        <a href="https://wa.me/918790387903" target="_blank" rel="noreferrer" className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors">
                          <Phone className="w-3 h-3" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holistic Care Plan */}
      {abnormalCategories.length > 0 && (
        <div className="border rounded-2xl p-6 md:p-8 bg-card shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-green-500" />
            AI Holistic Care Plan
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Personalized dietary and lifestyle modifications tailored specifically to correct your out-of-range biomarkers.
          </p>
          <div className="space-y-6">
            {abnormalCategories.map((cat, idx) => {
              const plan = getCarePlan(cat);
              return (
                <div key={idx} className="border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/10 p-5 rounded-r-xl">
                  <h4 className="font-bold text-base mb-3 capitalize text-green-900 dark:text-green-300 flex items-center gap-2">
                    Action Plan for {cat}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-500 mb-1 block">Dietary Changes</span>
                      <p className="text-sm text-foreground/80 leading-relaxed">{plan.diet}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-500 mb-1 block">Lifestyle Adjustments</span>
                      <p className="text-sm text-foreground/80 leading-relaxed">{plan.lifestyle}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raw Table */}
      <div className="border rounded-2xl p-6 md:p-8 bg-card shadow-sm mt-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
          <Stethoscope className="w-6 h-6 text-blue-500" />
          Detailed Test Results
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
                      <tr key={tIdx} className={`border-b last:border-0 hover:bg-muted/20 \${test.status !== 'Normal' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                        <td className="px-4 py-3 font-medium text-foreground/90">{test.testName}</td>
                        <td className={`px-4 py-3 font-bold \${test.status !== 'Normal' ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                          {test.value}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{test.unit}</td>
                        <td className="px-4 py-3 text-muted-foreground">{test.referenceRange || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold \${
                            test.status === 'Normal' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            test.status === 'Borderline' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {test.status === 'Normal' ? <CheckCircle2 className="w-3 h-3" /> : 
                             test.status === 'Borderline' ? <AlertCircle className="w-3 h-3" /> : 
                             <Info className="w-3 h-3" />}
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
    </div>
  );
};
