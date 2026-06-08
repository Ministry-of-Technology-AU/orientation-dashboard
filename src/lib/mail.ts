import nodemailer from "nodemailer";

interface MailOptions {
  alias: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
}

export async function sendMail({ alias, to, replyTo, subject, html }: MailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST!,
    port: Number(process.env.MAIL_PORT ?? 587),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USER!,
      pass: process.env.MAIL_PASS!,
    },
  });

  await transporter.sendMail({
    from: `"${alias}" <${process.env.MAIL_USER}>`,
    to,
    replyTo,
    subject,
    html,
  });
}
