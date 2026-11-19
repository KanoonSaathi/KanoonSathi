import { NextResponse } from 'next/server';
import { getLocalDb, saveLocalDb } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';
import { uploadLegalDocument } from '../../../lib/cloudinary';

export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';

    const db = getLocalDb();
    let files = db.causeVault || [];

    if (category !== 'all') {
      files = files.filter(f => f.category.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      files,
      vaultUser: {
        name: 'Adv. Rajesh Sharma',
        barId: 'DL-8849',
        storageUsed: '4.8 MB',
        storageLimit: '100 GB'
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    const formData = await req.formData();

    const file = formData.get('file');
    const category = formData.get('category') || 'pleadings';
    const caseNo = formData.get('caseNo') || 'CS (OS) 482/2024 (Sharma v. Goel)';
    const court = formData.get('court') || 'Patiala House District Courts Complex';
    const customName = formData.get('name');

    let filename = customName || 'Legal_Record.pdf';
    let fileBuffer;

    if (file && typeof file.arrayBuffer === 'function') {
      filename = file.name || filename;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      // Mock generated certified record buffer if direct button click without file selector
      const content = `KanoonSaathi Sovereign Certified Legal Record\nCase: ${caseNo}\nCourt: ${court}\nCategory: ${category}\nTimestamp: ${new Date().toISOString()}`;
      fileBuffer = Buffer.from(content, 'utf-8');
      filename = customName || `Certified_Record_${category}_${Date.now()}.pdf`;
    }

    // Upload to Cloudinary with SHA-256 integrity hash seal
    const uploadResult = await uploadLegalDocument(fileBuffer, filename, 'kanoonsaathi_vault');

    const db = getLocalDb();
    if (!db.causeVault) db.causeVault = [];

    const newRecord = {
      id: `cv_${Date.now()}`,
      userId: user.id,
      name: filename,
      category,
      caseNo,
      court,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      size: uploadResult.size,
      hash: uploadResult.hash,
      fullHash: uploadResult.fullHash,
      status: 'Certified Copy',
      fileUrl: uploadResult.url,
      storageType: uploadResult.storageType
    };

    db.causeVault.unshift(newRecord);
    saveLocalDb(db);

    return NextResponse.json({
      success: true,
      message: `Document "${filename}" sealed with ${uploadResult.hash} and archived to Cause Vault!`,
      document: newRecord
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
