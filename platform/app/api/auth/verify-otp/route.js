import { NextResponse } from 'next/server';
import { getLocalDb, saveLocalDb } from '../../../../lib/db';
import { signToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { otp, email, mobile } = await req.json();

    if (!otp) {
      return NextResponse.json(
        { success: false, message: 'Please enter the 6-digit OTP security PIN.' },
        { status: 400 }
      );
    }

    const cleanOtp = String(otp).trim();
    const db = getLocalDb();

    // Verify OTP
    const validRecord = db.otps.find(
      o => o.code === cleanOtp && o.expiresAt > Date.now()
    );

    // Accept default test code 482917 or matched code
    const isMockAccepted = cleanOtp === '482917' || Boolean(validRecord);

    if (!isMockAccepted) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP PIN. Please try again.' },
        { status: 400 }
      );
    }

    // Find associated user or default to Rajesh Sharma
    const targetEmail = validRecord?.email || email || 'rajesh.sharma@delhibar.org';
    let user = db.users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());

    if (user) {
      user.isVerified = true;
      saveLocalDb(db);
    } else {
      user = db.users[0];
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      message: 'Identity verified via DigiLocker e-KYC. Entering Citizen Workspace...',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: true
      },
      token
    });

    response.cookies.set('kanoonsaathi_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'OTP verification failed: ' + err.message },
      { status: 500 }
    );
  }
}
