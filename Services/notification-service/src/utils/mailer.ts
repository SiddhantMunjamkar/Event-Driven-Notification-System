import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // use TLS
//   requireTLS: true, // force TLS
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
//   tls: {
//     // Do not fail on invalid certificates (for Gmail)
//     rejectUnauthorized: false,
//   },
});

export async function sendMailTo(params: {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  await transporter.sendMail({
    from: params.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}
