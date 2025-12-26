import { MessageType } from "../shared/kafka/types";
import { sendMailTo } from "../utils/mailer";

export async function sendEmail(
  recipient: string,
  message: string,
  MessageType: MessageType
) {
  if (!recipient.includes("@")) {
    throw new Error("Invalid email address");
  }

  // Logic to send email
  console.log(
    `Sending email to ${recipient} with message: ${message} and type: ${MessageType}`
  );

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                    ${
                      MessageType === "ALERT_RAISED"
                        ? "🚨 "
                        : MessageType === "USER_SIGNED_UP"
                        ? "🎉 "
                        : "📬 "
                    }Notification
                  </h1>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <div style="color: #333333; font-size: 16px; line-height: 1.6;">
                    ${message}
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0; color: #6c757d; font-size: 12px;">
                    This is an automated notification. Please do not reply to this email.
                  </p>
                  <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">
                    © ${new Date().getFullYear()} Notification Service. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    await sendMailTo({
      from: process.env.SMTP_USER || "",
      to: recipient,
      subject: "Notification",
      html: htmlTemplate,
      text: message,
    });
    console.log(` Email sent successfully to ${recipient}`);
  } catch (error) {
    console.error(` Failed to send email to ${recipient}:`, error);
    throw new Error(
      `Email delivery failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
