import { NextResponse } from 'next/server';
import { getLocalDb, saveLocalDb } from '../../../../lib/db';
import { sendVerificationOtpEmail } from '../../../../lib/email';

export async function POST(req) {
  try {
    const { email = 'rajesh.sharma@delhibar.org', mobile = '9876543210' } = await req.json();

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const db = getLocalDb();

    db.otps = db.otps.filter(o => o.email !== email && o.mobile !== mobile);
    db.otps.push({
      email,
      mobile,
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    saveLocalDb(db);

    const emailRes = await sendVerificationOtpEmail(email, otpCode, 'Citizen');

    return NextResponse.json({
      success: true,
      message: emailRes.success
        ? `New 6-digit OTP code dispatched to ${email}.`
        : `New OTP dispatched: ${otpCode}`,
      demoOtp: otpCode
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Failed to resend OTP: ' + err.message },
      { status: 500 }
    );
  }
}
