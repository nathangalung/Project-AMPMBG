import { Resend } from "resend"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

// Send email using Resend (HTTP-based, not blocked by cloud providers)
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[Email] RESEND_API_KEY not configured")
      return false
    }

    console.log("[Email] Attempting to send email to:", options.to)

    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    if (error) {
      console.error("[Email] Resend error:", error)
      return false
    }

    console.log(`[Email] Successfully sent to ${options.to}`, data)
    return true
  } catch (error) {
    console.error("[Email] Failed to send:", error)
    if (error instanceof Error) {
      console.error("[Email] Error message:", error.message)
    }
    return false
  }
}

// Password reset email template
export function getPasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Kata Sandi</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">AMP MBG</h1>
              <p style="margin: 8px 0 0; color: #dbeafe; font-size: 14px;">Atur Ulang Kata Sandi</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">Halo <strong>${name}</strong>,</p>
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Kami menerima permintaan untuk mengatur ulang kata sandi akun AMP MBG Anda.
                Klik tombol di bawah ini untuk membuat kata sandi baru:
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
                      Atur Ulang Kata Sandi
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                Tautan ini akan kedaluwarsa dalam <strong>1 jam</strong>.
                Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini.
              </p>

              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Jika tombol tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:
              </p>
              <p style="margin: 8px 0 0; color: #2563eb; font-size: 12px; word-break: break-all;">
                ${resetUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; 2024 AMP MBG. Semua hak dilindungi.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
