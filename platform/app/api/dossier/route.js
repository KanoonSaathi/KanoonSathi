import { NextResponse } from 'next/server';

const CASE_DOSSIER = {
  cnr: 'DLND01-004821-2024',
  caseNo: 'CS (OS) 482/2024',
  title: 'Sharma v. Goel & Ors.',
  hindiTitle: 'शर्मा बनाम गोयल एवं अन्य (वाद संख्या 482/2024)',
  type: 'Commercial Suit • Order XXXVII CPC',
  court: 'Patiala House Courts (Court Room 14)',
  judge: 'Sh. Vikramajit Sen, DHJS (Commercial Court 02)',
  nextHearing: 'Tomorrow, 10:30 AM (PW-1 Cross)',
  stage: 'Cross-Examination of Plaintiff (PW-1)',
  timeline: [
    {
      date: '12 Jan 2024',
      stage: 'Agreement to Sell Executed',
      details: 'Registered agreement to sell for commercial property at Connaught Place, New Delhi with earnest advance of Rs. 25,00,000 paid via RTGS.',
      exhibit: 'Exhibit P-1',
      status: 'Admitted'
    },
    {
      date: '14 Jul 2024',
      stage: 'Statutory Notice under Section 80 CPC',
      details: 'Formal demand of specific performance dispatched via Registered Post AD after vendor failed to execute sale deed within 6 months.',
      exhibit: 'Exhibit P-2 & P-3',
      status: 'Proved'
    },
    {
      date: '12 Sep 2024',
      stage: 'Institution of Commercial Suit',
      details: 'Plaint filed before Patiala House District Courts Complex. Verified Statement of Truth and Court Fee of Rs. 1,08,000 paid.',
      exhibit: 'Plaint Docket',
      status: 'Cognizance Taken'
    },
    {
      date: '28 Oct 2024',
      stage: 'Written Statement & Issues Framed',
      details: 'Defendant filed defense claiming readiness and willingness issues. Court formulated 4 judicial issues under Order XIV CPC.',
      exhibit: 'Order Sheet dt. 28.10.2024',
      status: 'Framed'
    },
    {
      date: 'Tomorrow, 10:30 AM',
      stage: 'Cross-Examination of Plaintiff (PW-1)',
      details: 'Plaintiff Adv. Rajesh Sharma to appear in Court Room 14 for oral cross-examination before Sh. Vikramajit Sen, DHJS.',
      exhibit: 'Subpoena Served',
      status: 'Listed'
    }
  ],
  exhibits: [
    { mark: 'Mark P-1', title: 'Original Agreement to Sell dt. 12.01.2024', type: 'Registered Deed', pages: '14 Pages' },
    { mark: 'Mark P-2', title: 'Bank Statement proving RTGS Transfer of Rs. 25 Lakhs', type: 'Bank Certificate', pages: '02 Pages' },
    { mark: 'Mark P-3', title: 'RPAD Postal Consignment Tracking Delivery Slip', type: 'India Post Certificate', pages: '01 Page' },
    { mark: 'Mark P-4', title: 'WhatsApp Communications Transcript with Vendor', type: 'Section 65B Certificate', pages: '08 Pages' },
    { mark: 'Mark P-5', title: 'Certified Copy of Encumbrance Certificate', type: 'Sub-Registrar Record', pages: '04 Pages' }
  ]
};

export async function GET() {
  return NextResponse.json({
    success: true,
    dossier: CASE_DOSSIER
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Authenticated Legal Dossier PDF generated with cryptographic SHA-256 seal. Ready for download.',
    downloadUrl: '/uploads/Certified_Dossier_CS_482_2024.pdf'
  });
}
