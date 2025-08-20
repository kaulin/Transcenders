import { TwoFactorChallengePurpose } from '@transcenders/contracts';
import { ENV } from '@transcenders/server-utils';
import { Resend } from 'resend';

const resend = new Resend(ENV.RESEND_API_KEY);

function subjectFor(purpose: TwoFactorChallengePurpose) {
  switch (purpose) {
    case 'enroll':
      return 'Your Transcenders 2FA enrollment code';
    case 'login':
      return 'Your Transcenders login code';
    case 'stepup':
      return 'Your verification code';
    case 'disable':
      return 'Confirm 2FA disable';
    default:
      return 'Your verification code';
  }
}

function htmlFor(code: string, expiresAt: Date, purpose: TwoFactorChallengePurpose) {
  const mins = Math.max(1, Math.round((+expiresAt - Date.now()) / 60000));
  return `
    <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#222">
      <h2 style="margin:0 0 12px">Your ${purpose} code</h2>
      <p>Use this code to continue:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:2px;margin:12px 0">${code}</div>
      <p>This code expires in ~${mins} minute${mins === 1 ? '' : 's'}.</p>
      <p style="color:#666;font-size:12px;margin-top:16px">If you didn't request this, you can ignore this email.</p>
    </div>
  `;
}

function textFor(code: string, expiresAt: Date, purpose: TwoFactorChallengePurpose) {
  const mins = Math.max(1, Math.round((+expiresAt - Date.now()) / 60000));
  return `Your ${purpose} code: ${code}\nExpires in ~${mins} minute${mins === 1 ? '' : 's'}.\nIf you didn't request this, ignore this email.`;
}

export async function sendTwoFacCode(opts: {
  to: string;
  code: string;
  expiresAt: Date;
  purpose: TwoFactorChallengePurpose;
}) {
  // In dev without a key, just log and return
  if (!resend) {
    if (ENV.NODE_ENV !== 'production') {
      console.log(`[DEV] 2FA email to ${opts.to}: code=${opts.code}`);
    }
    return;
  }

  await resend.emails.send({
    from: ENV.MAIL_FROM,
    to: opts.to,
    subject: subjectFor(opts.purpose),
    html: htmlFor(opts.code, opts.expiresAt, opts.purpose),
    text: textFor(opts.code, opts.expiresAt, opts.purpose),
  });
}
