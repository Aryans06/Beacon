import { NextResponse } from "next/server";
import { analyzeEmergency } from "../../lib/gemini";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const analysis = await analyzeEmergency(message);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("API Analyze Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
