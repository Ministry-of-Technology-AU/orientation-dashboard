import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studentEmail = session.user.email;
  const studentName = session.user.name ?? studentEmail;

  const { subject, message, aiResponse } = (await req.json()) as {
    subject: string;
    message: string;
    aiResponse?: string;
  };

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #0A3864; padding: 24px 32px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 18px; font-weight: 600;">
          Orientation Dashboard — Student Query
        </h1>
      </div>
      <div style="background: #f8f9fa; padding: 28px 32px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef; border-top: none;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #6c757d; font-size: 13px; width: 100px;">From</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500;">${studentName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6c757d; font-size: 13px;">Email</td>
            <td style="padding: 6px 0; font-size: 14px;">
              <a href="mailto:${studentEmail}" style="color: #0A3864;">${studentEmail}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6c757d; font-size: 13px;">Subject</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500;">${subject}</td>
          </tr>
        </table>

        <div style="margin-bottom: 20px;">
          <p style="font-size: 12px; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px 0;">Student's Message</p>
          <div style="background: white; border: 1px solid #dee2e6; border-radius: 6px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
        </div>

        ${aiResponse ? `
        <div>
          <p style="font-size: 12px; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px 0;">AI Response That Prompted This Query</p>
          <div style="background: white; border: 1px solid #dee2e6; border-left: 3px solid #A61017; border-radius: 0 6px 6px 0; padding: 16px; font-size: 13px; line-height: 1.6; color: #495057; white-space: pre-wrap;">${aiResponse}</div>
        </div>
        ` : ""}
      </div>
      <p style="text-align: center; font-size: 11px; color: #adb5bd; margin-top: 16px;">
        Sent via Bijlee · Ashoka University Orientation Dashboard
      </p>
    </div>
  `;

  try {
    await sendMail({
      alias: "Orientation Dashboard Query",
      to: "studentaffairs@ashoka.edu.in",
      replyTo: studentEmail,
      subject: `[Student Query] ${subject}`,
      html,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mail send failed:", err);
    return NextResponse.json({ error: "Failed to send ticket" }, { status: 500 });
  }
}
