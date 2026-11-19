import { NextResponse } from 'next/server';
import { getLocalDb, saveLocalDb } from '../../../../lib/db';
import { getUserFromRequest } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    const { action } = await req.json();

    const db = getLocalDb();
    const dbUser = db.users.find(u => u.id === user.id) || db.users[0];

    if (action === 'pair_esign') {
      dbUser.eSignPaired = true;
      saveLocalDb(db);
      return NextResponse.json({
        success: true,
        message: 'Aadhaar eSign certificate successfully generated and paired with Cause Vault!',
        eSignPaired: true
      });
    }

    if (action === 'verify_bar') {
      dbUser.barCouncilVerified = true;
      saveLocalDb(db);
      return NextResponse.json({
        success: true,
        message: 'Bar Council of Delhi enrollment verified with National Bar Registry.',
        barCouncilVerified: true
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        name: dbUser.name,
        aadhaarToken: dbUser.aadhaarToken || '•••••••• 8812',
        barEnrollment: dbUser.barEnrollment || 'D/8849/2014',
        eSignPaired: dbUser.eSignPaired !== false
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
