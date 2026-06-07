import nodemailer from "nodemailer";
import { logger } from "../lib/logger";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.info({ emailUser: testAccount.user }, "Email: using Ethereal test account (demo mode)");
  }

  return transporter;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<boolean> {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: '"Jarvis" <noreply@jarvis-app.io>',
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info({ previewUrl, to: opts.to }, "Email sent (preview)");
    }
    return true;
  } catch (err) {
    logger.error({ err }, "Failed to send email");
    return false;
  }
}

export async function sendTaskAssignedEmail(opts: {
  toEmail: string;
  toName: string;
  taskTitle: string;
  groupName: string;
  priority: string;
  deadline: string | null;
}): Promise<boolean> {
  const deadlineStr = opts.deadline ? `Due: ${opts.deadline}.` : "No deadline set.";
  return sendEmail({
    to: opts.toEmail,
    subject: `Jarvis: You've been assigned "${opts.taskTitle}"`,
    text: `Hi ${opts.toName},\n\nYou have been assigned a new task: ${opts.taskTitle} in group ${opts.groupName}.\nPriority: ${opts.priority}. ${deadlineStr}\n\nLog in to view details.\n\n— Jarvis`,
  });
}

export async function sendTaskCreatedEmail(opts: {
  toEmail: string;
  toName: string;
  taskTitle: string;
  groupName: string;
  creatorName: string;
  deadline: string | null;
}): Promise<boolean> {
  const deadlineStr = opts.deadline ? `Due: ${opts.deadline}.` : "";
  return sendEmail({
    to: opts.toEmail,
    subject: `Jarvis: New task "${opts.taskTitle}" in ${opts.groupName}`,
    text: `Hi ${opts.toName},\n\nA new task "${opts.taskTitle}" has been added to your group ${opts.groupName} by ${opts.creatorName}. ${deadlineStr}\n\nLog in to view details.\n\n— Jarvis`,
  });
}

export async function sendInvitationEmail(opts: {
  toEmail: string;
  groupName: string;
  appUrl: string;
}): Promise<boolean> {
  return sendEmail({
    to: opts.toEmail,
    subject: `You've been added to "${opts.groupName}" on Jarvis`,
    text: `Hi,\n\nYou have been added to a group called ${opts.groupName} on Jarvis. Click the link below to create your account and start collaborating:\n${opts.appUrl}\n\n— Jarvis`,
  });
}
