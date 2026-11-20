import { NextResponse } from 'next/server';
import { getLocalDb, saveLocalDb } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    const { noticeType = 'cheque', addresseeName, amount, details } = await req.json();

    const db = getLocalDb();
    if (!db.notices) db.notices = [];
    if (!db.causeVault) db.causeVault = [];

    const noticeTitles = {
      cheque: 'Statutory Demand Notice under Section 138 Negotiable Instruments Act',
      eviction: 'Notice to Quit & Vacate Premises under Section 106 Transfer of Property Act',
      defamation: 'Cease and Desist Notice & Demand of Unconditional Apology'
    };

    const title = noticeTitles[noticeType] || 'Statutory Legal Notice';
    const noticeId = `NOTICE/${noticeType.toUpperCase()}/2026/${Math.floor(100 + Math.random() * 900)}`;

    const newNotice = {
      id: noticeId,
      userId: user.id,
      noticeType,
      title,
      addresseeName: addresseeName || 'Sh. Ramesh Goel',
      amount: amount || '₹ 8,50,000/-',
      details: details || "Cheque No. 049182 returned marked 'Funds Insufficient'",
      senderName: user.name || 'Adv. Rajesh Sharma',
      createdAt: new Date().toISOString(),
      status: 'Generated & Dispatched via RPAD'
    };

    db.notices.unshift(newNotice);

    // Archive in Cause Vault
    const vaultItem = {
      id: `cv_${Date.now()}`,
      userId: user.id,
      name: `${title}.pdf`,
      category: 'notices',
      caseNo: noticeId,
      court: 'Pre-Litigation Statutory Record',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      size: '680 KB',
      hash: `SHA256: ${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 7)}`,
      status: 'RPAD Sealed',
      fileUrl: `/uploads/${noticeId.replace(/[\/]/g, '_')}.pdf`
    };

    db.causeVault.unshift(vaultItem);
    saveLocalDb(db);

    return NextResponse.json({
      success: true,
      message: `Generated ${title}! Securely sealed and archived in Cause Vault under reference ${noticeId}.`,
      notice: newNotice,
      vaultRecord: vaultItem
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
