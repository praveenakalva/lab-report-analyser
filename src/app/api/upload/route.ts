import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;

export async function POST(req: NextRequest) {
  try {
    if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const language = formData.get("language") as string || "English";
    const previousDataString = formData.get("previousData") as string || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Unsupported file type. Please upload a PDF or image." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    
    // We send the file inline to Gemini to both extract and analyze in one pass.
    const analysisPrompt = `
      You are a medical lab report analyzer. Do NOT diagnose, but DO advise on critical situations.
      Analyze the attached lab report.
      
      CRITICAL INSTRUCTIONS:
      1. The user requested the response to be in the following language: ${language}. ALL text outputs (summary, insights, questions, follow_ups, precautions, critical_warnings, etc.) MUST be translated into ${language}.
      2. EXTREMELY SIMPLE LANGUAGE: You MUST write all explanations, summaries, and descriptions in extremely simple, everyday language. Assume the reader has ZERO medical background. Use analogies if helpful. Do NOT use complex medical jargon. Write at a 6th-grade reading level. Tailor the explanation appropriately for the patient's Age and Sex found in the report.
      3. Clearly advise the user to seek immediate medical care and consult a doctor if there are critical, dangerous, or emergency results.
      4. Always emphasize consulting a doctor if there are any doubts.
      5. Recommend precautions regarding any abnormalities found.
      6. Recommend follow-ups regarding the lab report.
      7. If there are spelling mistakes in the lab report text or the extracted text, please correct them automatically before generating your response.
      8. EVERYDAY TERMINOLOGY & NORMALIZATION: You MUST convert all complex medical terminology, biomarker names, and disease names into everyday, common language that non-medical people use. For example: use "Red Blood Cells" instead of "Erythrocytes", "Blood Sugar" instead of "Glucose" or "FBS", "Kidney Function" instead of "Renal Function", etc. Do NOT use complex latin or medical names if a simple common name exists. This simple name will be used for trend analysis across different reports.
      9. CATEGORIZATION: Group each biomarker into a standard simple category (e.g., "Blood Count", "Cholesterol", "Liver Health", "Kidney Health", "Thyroid", "Vitamins", "Others"). Add this as the "category" field.
      10. DISEASE DETECTION & CAUSES: Identify any potential diseases or conditions indicated by abnormal results. Use the common name for the disease (e.g., "High Blood Pressure" not "Hypertension"). For each disease, provide a "detailed description" explaining what it is in extremely simple, non-medical terms, and list its potential "causes".
      11. DOCTOR QUESTIONS: Generate questions for the doctor, ordered by the severity of the detected conditions (most critical first).
      ${previousDataString ? `\n      PREVIOUS REPORT DATA FOR COMPARISON:\n      The user has provided their most recent previous lab report data below. You MUST compare the current report to this previous data. Mention any significant improvements or deteriorations explicitly in the "summary" and "insights" sections (e.g., "Your cholesterol has improved since your last test...").\n      Previous Data: ${previousDataString}\n` : ""}
      
      Extract the text and return a JSON object in this exact format ONLY (no markdown backticks):
      {
        "patient_details": {
          "name": "string",
          "age": "string",
          "gender": "string",
          "referred_by": "string",
          "sample_date": "string",
          "sid": "string"
        },
        "overall_status": "Healthy" | "Needs Attention" | "Significant Concern" | "Critical",
        "summary": "Plain language summary tailored to age and sex",
        "insights": "Detailed easy explanation without medical jargon",
        "disease_causes": [
          {
            "disease": "string",
            "description": "string",
            "causes": ["cause 1", "cause 2"]
          }
        ],
        "doctor_questions": ["question 1", "question 2"],
        "follow_ups": ["follow up 1", "follow up 2"],
        "precautions": ["precaution 1", "precaution 2"],
        "critical_warnings": "Any emergency warnings or advice to seek immediate care. If none, return empty string.",
        "biomarkers": [
          {
            "test_name": "string",
            "category": "string",
            "value": number,
            "unit": "string",
            "reference_range": "string",
            "status": "Normal" | "Borderline" | "Abnormal" | "Critical"
          }
        ]
      }
    `;
    
    const filePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.type
      }
    };

    const result = await model.generateContent([analysisPrompt, filePart]);
    const responseText = result.response.text();
    
    // Clean up the response to parse JSON
    const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const analysisData = JSON.parse(jsonStr);

    // Mock Report Object (Database saving temporarily removed)
    const report = {
      id: "mock-" + Date.now(),
      fileName: file.name,
      createdAt: new Date().toISOString(),
      status: analysisData.overall_status || "Healthy",
      patientDetails: analysisData.patient_details,
      summary: analysisData.summary,
      insights: analysisData.insights,
      diseaseCauses: analysisData.disease_causes || [],
      doctorQuestions: analysisData.doctor_questions,
      followUps: analysisData.follow_ups || [],
      precautions: analysisData.precautions || [],
      criticalWarnings: analysisData.critical_warnings || "",
      biomarkers: analysisData.biomarkers.map((b: any) => ({
        testName: b.test_name,
        category: b.category || "Others",
        value: Number(b.value) || 0,
        unit: b.unit,
        referenceRange: b.reference_range,
        status: b.status,
      }))
    };

    return NextResponse.json({ success: true, report });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
