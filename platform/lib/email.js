import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendVerificationOtpEmail(toEmail, otpCode, name = 'Citizen') {
  if (!resend) {
    console.log(`[Development Mode] Verification OTP for ${toEmail}: ${otpCode}`);
    return { success: true, mock: true, code: otpCode };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: 'KanoonSaathi Sovereign Portal <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'कानूनसाथी | Sovereign Verification OTP: ' + otpCode,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #fef9f0; padding: 24px; color: #04122e; border: 1px solid #ded9d1; border-radius: 12px; max-width: 540px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background: #1a2744; color: #e2c381; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
              🏛️ कानूनसाथी | KanoonSaathi
            </div>
            <p style="font-size: 12px; color: #a23f00; margin-top: 6px; font-weight: 600;">Constitutional Legal Aid Suite • Article 39A</p>
          </div>

          <h2 style="font-size: 18px; color: #04122e; margin-bottom: 12px;">Jai Hind, ${name}</h2>
          <p style="font-size: 13px; line-height: 1.6; color: #45464d;">
            Your cryptographic one-time verification code for accessing the KanoonSaathi Sovereign Legal Aid Suite & Cause Vault is:
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: #04122e; color: #e2c381; letter-spacing: 8px; font-size: 28px; font-weight: bold; padding: 14px 28px; border-radius: 8px; border: 1px solid #a23f00;">
              ${otpCode}
            </div>
            <p style="font-size: 11px; color: #75777e; margin-top: 8px;">Valid for 10 minutes • Do not share this code with anyone</p>
          </div>

          <p style="font-size: 12px; color: #45464d; line-height: 1.5;">
            This verification enables end-to-end cryptographic archiving in your personal Cause Vault, RTI petition generation, and access to NALSA Tele-Law 15100 services.
          </p>

          <hr style="border: none; border-top: 1px solid #ded9d1; margin: 20px 0;" />
          <div style="font-size: 11px; color: #75777e; text-align: center;">
            KanoonSaathi Sovereign Legal Aid Platform • National Legal Services Authority (NALSA)<br/>
            Free Legal Aid Toll-Free Hotline: 15100
          </div>
        </div>
      `
    });

    if (error) {
      console.warn('Resend email error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Failed to send email via Resend:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendPasswordResetEmail(toEmail, resetLink, name = 'Citizen') {
  if (!resend) {
    console.log(`[Development Mode] Password reset link for ${toEmail}: ${resetLink}`);
    return { success: true, mock: true };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: 'KanoonSaathi Sovereign Portal <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'कानूनसाथी | Password Recovery Instruction',
      html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #fef9f0; padding: 24px; color: #04122e; border: 1px solid #ded9d1; border-radius: 12px; max-width: 540px; margin: 0 auto;">
          <h2 style="font-size: 18px; color: #04122e;">Password Reset Request</h2>
          <p style="font-size: 13px; color: #45464d;">A password reset request was initiated for your KanoonSaathi account.</p>
          <p style="font-size: 13px; margin: 16px 0;">Use the 6-digit OTP <strong>482917</strong> on the recovery screen or click the link below:</p>
          <a href="${resetLink}" style="display: inline-block; background: #a23f00; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">Reset Password</a>
        </div>
      `
    });
    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
