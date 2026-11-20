import { NextResponse } from 'next/server';
import { getLocalDb, saveLocalDb } from '../../../../lib/db';
import { sendPasswordResetEmail } from '../../../../lib/email';

export async function POST(req) {
  try {
    const { identifier } = await req.json();

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Please provide registered email or mobile.' },
        { status: 400 }
      );
    }

    const email = identifier.includes('@') ? identifier : 'rajesh.sharma@delhibar.org';
    const otpCode = '482917';
    const resetLink = `http://localhost:3000/?flow=otp&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail(email, resetLink, 'Citizen Litigant');

    return NextResponse.json({
      success: true,
      message: `Password recovery token and instructions dispatched to ${identifier}.`,
      demoOtp: otpCode
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Recovery dispatch failed: ' + err.message },
      { status: 500 }
    );
  }
}
