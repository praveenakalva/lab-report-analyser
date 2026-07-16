import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;

export async function POST(req: NextRequest) {
  try {
    if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const language = formData.get("language") as string || "English";

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
      2. Simplify summaries and insights so patients without medical knowledge can easily understand. Tailor the explanation appropriately for the patient's Age and Sex found in the report.
      3. Clearly advise the user to seek immediate medical care and consult a doctor if there are critical, dangerous, or emergency results.
      4. Always emphasize consulting a doctor if there are any doubts.
      5. Recommend precautions regarding any abnormalities found.
      6. Recommend follow-ups regarding the lab report.
      7. If there are spelling mistakes in the lab report text or the extracted text, please correct them automatically before generating your response.
      
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
        "doctor_questions": "1. ... 2. ...",
        "follow_ups": ["follow up 1", "follow up 2"],
        "precautions": ["precaution 1", "precaution 2"],
        "critical_warnings": "Any emergency warnings or advice to seek immediate care. If none, return empty string.",
        "biomarkers": [
          {
            "test_name": "string",
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
      doctorQuestions: analysisData.doctor_questions,
      followUps: analysisData.follow_ups || [],
      precautions: analysisData.precautions || [],
      criticalWarnings: analysisData.critical_warnings || "",
      biomarkers: analysisData.biomarkers.map((b: any) => ({
        testName: b.test_name,
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
