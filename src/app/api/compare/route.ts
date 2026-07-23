import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;

export async function POST(req: NextRequest) {
  try {
    if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const formData = await req.formData();
    const file1 = formData.get("file1") as File; // Oldest
    const file2 = formData.get("file2") as File; // Intermediate / Newer
    const file3 = formData.get("file3") as File | null; // Newest (if 3 files)
    const language = formData.get("language") as string || "English";

    if (!file1 || !file2) {
      return NextResponse.json({ error: "At least two reports are required for comparison" }, { status: 400 });
    }

    const processFile = async (file: File) => {
      const arrayBuffer = await file.arrayBuffer();
      return {
        inlineData: {
          data: Buffer.from(arrayBuffer).toString("base64"),
          mimeType: file.type
        }
      };
    };

    const filePart1 = await processFile(file1);
    const filePart2 = await processFile(file2);

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    
    const hasThreeFiles = !!file3;
    const promptIntro = hasThreeFiles
      ? `You are given THREE lab reports for the same patient. Report 1 is the OLDEST report. Report 2 is the INTERMEDIATE report. Report 3 is the NEWEST report.`
      : `You are given TWO lab reports for the same patient. Report 1 is the OLDER report. Report 2 is the NEWER report.`;

    const analysisPrompt = `
      You are a medical lab report analyzer specializing in longitudinal patient health trajectory.
      ${promptIntro}
      
      CRITICAL INSTRUCTIONS:
      1. The user requested the response to be in the following language: ${language}. ALL text outputs MUST be translated into ${language}.
      2. EXTREMELY SIMPLE LANGUAGE: You MUST write all explanations, summaries, and descriptions in extremely simple, everyday language. Assume the reader has ZERO medical background. Use analogies if helpful. Do NOT use complex medical jargon. Write at a 6th-grade reading level.
      3. Focus entirely on the DIFFERENCES and TRAJECTORY. Has the patient improved? Gotten worse? Remained stable?
      4. EVERYDAY TERMINOLOGY: Normalize biomarker names to everyday, common language that non-medical people use (e.g., use "Red Blood Cells" instead of "Erythrocytes", "Blood Sugar" instead of "Glucose" or "FBS"). Do NOT use complex latin or medical names if a simple common name exists.
      5. Group each biomarker into a standard simple category (e.g., "Blood Count", "Cholesterol", "Liver Health", "Kidney Health", "Thyroid", "Vitamins", "Others"). Add this as the "category" field.
      
      Extract the text and return a JSON object in this exact format ONLY (no markdown backticks):
      {
        "patient_details": {
          "name": "string",
          "age": "string",
          "gender": "string"
        },
        "health_improvement_status": "Improved" | "Declined" | "Stable" | "Mixed",
        "health_improvement_summary": "Plain language paragraph summarizing if their health improved or declined overall.",
        "key_changes": ["Bullet point 1 about a major change", "Bullet point 2"],
        "recommendations": ["Recommendation 1 based on changes", "Recommendation 2"],
        "report1_biomarkers": [
          {
            "test_name": "string",
            "category": "string",
            "value": number,
            "unit": "string",
            "status": "Normal" | "Borderline" | "Abnormal" | "Critical"
          }
        ],
        "report2_biomarkers": [
          {
            "test_name": "string",
            "category": "string",
            "value": number,
            "unit": "string",
            "status": "Normal" | "Borderline" | "Abnormal" | "Critical"
          }
        ]${hasThreeFiles ? `,
        "report3_biomarkers": [
          {
            "test_name": "string",
            "category": "string",
            "value": number,
            "unit": "string",
            "status": "Normal" | "Borderline" | "Abnormal" | "Critical"
          }
        ]` : ''}
      }
    `;
    
    const parts: any[] = [analysisPrompt];
    parts.push("File 1:");
    parts.push(await processFile(file1));
    parts.push("File 2:");
    parts.push(await processFile(file2));
    if (file3) {
      parts.push("File 3:");
      parts.push(await processFile(file3));
    }

    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    
    const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const comparisonData = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, data: comparisonData });

  } catch (error: any) {
    console.error("Compare API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
