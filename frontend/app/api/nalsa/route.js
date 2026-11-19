import { NextResponse } from 'next/server';
import { getLocalDb, saveLocalDb } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

const CENTERS = [
  {
    id: 1,
    authority: 'Delhi State Legal Services Authority (DSLSA)',
    hindi: 'दिल्ली राज्य विधिक सेवाएं प्राधिकरण',
    office: 'Central Office, Central Hall, High Court of Delhi',
    memberSecretary: 'Sh. Mukesh Kumar Gupta, DHJS',
    timings: '10:00 AM - 05:00 PM (Monday to Saturday)',
    phone: '011-2338-4781',
    emergency: '15100 (24x7 National Toll-Free)',
    services: ['Pro Bono Advocate Assignment', 'Pre-Litigation Mediation', 'Lok Adalat Settlements']
  },
  {
    id: 2,
    authority: 'New Delhi District Legal Services Authority (ND-DLSA)',
    hindi: 'नई दिल्ली जिला विधिक सेवा प्राधिकरण',
    office: 'Front Office, Ground Floor, Patiala House Courts Complex',
    memberSecretary: 'Ld. Secretary, ND-DLSA',
    timings: '10:00 AM - 05:00 PM',
    phone: '011-2338-6622 (Ext 114)',
    emergency: '15100',
    services: ['Legal Advice Clinic', 'Jail Visiting Advocates', 'Victim Compensation Scheme']
  },
  {
    id: 3,
    authority: 'Central DLSA - Tis Hazari Courts',
    hindi: 'केंद्रीय जिला विधिक सेवा प्राधिकरण',
    office: 'Room No. 287, Tis Hazari Courts, Delhi - 110054',
    memberSecretary: 'Ld. Secretary, Central DLSA',
    timings: '10:00 AM - 05:00 PM',
    phone: '011-2395-0041',
    emergency: '15100',
    services: ['Matrimonial Counseling Cell', 'Free Bail Counsel Representation', 'Paralegal Volunteers']
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    centers: CENTERS
  });
}

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    const { criteria, applicantName, authorityId } = await req.json();

    const db = getLocalDb();
    if (!db.legalAidApplications) db.legalAidApplications = [];

    const tokenNumber = `DLSA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const selectedCenter = CENTERS.find(c => c.id === Number(authorityId)) || CENTERS[1];

    const application = {
      id: `aid_${Date.now()}`,
      tokenNumber,
      userId: user.id,
      applicantName: applicantName || user.name || 'Citizen Applicant',
      criteria: criteria || 'women',
      authority: selectedCenter.authority,
      office: selectedCenter.office,
      status: 'Advocate Assigned / Front Office Token Issued',
      createdAt: new Date().toISOString()
    };

    db.legalAidApplications.unshift(application);
    saveLocalDb(db);

    return NextResponse.json({
      success: true,
      message: `Section 12 Legal Aid Application submitted! Your official DLSA Token Number is ${tokenNumber}. An empaneled advocate from ${selectedCenter.authority} has been requested.`,
      application
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
