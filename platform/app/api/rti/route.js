import { NextResponse } from 'next/server';
import { getLocalDb, saveLocalDb } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

const DEPT_NAMES = {
  mcd: 'Municipal Corporation of Delhi (MCD) - Building Dept',
  dda: 'Delhi Development Authority (DDA) - Land Allotment',
  police: 'Delhi Police - Office of the DCP (Vigilance)',
  revenue: 'Department of Revenue & Land Records, Govt of NCT',
  highcourt: 'Public Information Officer, High Court of Delhi'
};

export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    const db = getLocalDb();
    const rtis = db.rtis || [];

    return NextResponse.json({
      success: true,
      rtis
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const { department, applicantName, applicantAddress, bplStatus, questions } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide at least one query under Section 6(1).' },
        { status: 400 }
      );
    }

    const db = getLocalDb();
    if (!db.rtis) db.rtis = [];
    if (!db.causeVault) db.causeVault = [];

    const rtiId = `RTI/${department.toUpperCase()}/2026/${Math.floor(100 + Math.random() * 900)}`;
    const deptName = DEPT_NAMES[department] || department.toUpperCase();

    const newRti = {
      id: rtiId,
      userId: user.id,
      department,
      departmentName: deptName,
      applicantName: applicantName || 'Adv. Rajesh Sharma',
      applicantAddress: applicantAddress || 'Chamber 412, Patiala House Courts, New Delhi - 110001',
      bplStatus: Boolean(bplStatus),
      questions,
      feeDetails: bplStatus ? 'Exempted (BPL Certificate Attached)' : 'Rs. 10/- via Indian Postal Order / Court Fee Stamp',
      createdAt: new Date().toISOString(),
      status: 'Application Drafted & Saved'
    };

    db.rtis.unshift(newRti);

    // Also auto-archive to Cause Vault
    const vaultItem = {
      id: `cv_${Date.now()}`,
      userId: user.id,
      name: `RTI Section 6(1) Application - ${deptName.split('-')[0].trim()}.pdf`,
      category: 'rti',
      caseNo: rtiId,
      court: `Public Information Officer, ${deptName}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      size: `${(questions.length * 120 + 250)} KB`,
      hash: `SHA256: ${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 7)}`,
      status: 'Archived in Vault',
      fileUrl: `/uploads/${rtiId.replace(/[\/]/g, '_')}.pdf`
    };

    db.causeVault.unshift(vaultItem);
    saveLocalDb(db);

    return NextResponse.json({
      success: true,
      message: `RTI Application "${rtiId}" successfully generated and saved to Cause Vault!`,
      rti: newRti,
      vaultRecord: vaultItem
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
