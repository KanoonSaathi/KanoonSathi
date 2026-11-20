import { NextResponse } from 'next/server';
import { getLocalDb, saveLocalDb } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';
import { analyzeLegalSituation } from '../../../lib/groq';

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const { category, grievance, causeDate, urgency, language } = body;

    if (!grievance || grievance.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please provide detailed narrative of the legal situation.' },
        { status: 400 }
      );
    }

    // Call Groq LLM API
    const analysis = await analyzeLegalSituation({
      category: category || 'property',
      grievance,
      causeDate,
      urgency: urgency || 'medium',
      language: language || 'en'
    });

    // Save assessment to DB
    const db = getLocalDb();
    if (!db.assessments) db.assessments = [];

    const newAssessment = {
      id: `asm_${Date.now()}`,
      userId: user.id,
      category,
      grievance,
      causeDate,
      urgency,
      analysis,
      createdAt: new Date().toISOString()
    };

    db.assessments.unshift(newAssessment);
    saveLocalDb(db);

    return NextResponse.json({
      success: true,
      message: 'Legal situation assessed under Article 39A jurisprudence and relevant statutory codes.',
      assessment: newAssessment
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    const db = getLocalDb();
    const assessments = db.assessments || [];

    return NextResponse.json({
      success: true,
      assessments
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
