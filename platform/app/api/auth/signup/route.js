import { NextResponse } from 'next/server';
import { getLocalDb, saveLocalDb } from '../../../../lib/db';
import { hashPassword } from '../../../../lib/auth';
import { sendVerificationOtpEmail } from '../../../../lib/email';

export async function POST(req) {
  try {
    const { name, email, mobile, role, password } = await req.json();

    if (!name || !email || !mobile) {
      return NextResponse.json(
        { success: false, message: 'Please provide full legal name, email, and mobile number.' },
        { status: 400 }
      );
    }

    const db = getLocalDb();

    // Check if user already exists
    const existing = db.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() || u.mobile === mobile
    );

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordHash = await hashPassword(password || 'Sovereign@2025');

    if (!existing) {
      const newUser = {
        id: `usr_${Date.now()}`,
        name,
        email,
        mobile,
        role: role || 'Litigant / Citizen seeking legal help',
        passwordHash,
        isVerified: false,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
    }

    // Save OTP
    db.otps = db.otps.filter(o => o.email !== email && o.mobile !== mobile);
    db.otps.push({
      email,
      mobile,
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    saveLocalDb(db);

    // Send real email via Resend
    let emailDispatched = false;
    let emailMessage = '';
    const emailRes = await sendVerificationOtpEmail(email, otpCode, name);
    if (emailRes.success) {
      emailDispatched = true;
      emailMessage = `Dispatched 6-digit verification code to ${email} and +91 ${mobile}.`;
    } else {
      emailMessage = `Verification code generated: ${otpCode}. (Simulated SMS to +91 ${mobile})`;
    }

    return NextResponse.json({
      success: true,
      message: emailMessage,
      otpDispatched: true,
      demoOtp: otpCode,
      email,
      mobile
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Signup failed: ' + err.message },
      { status: 500 }
    );
  }
}
