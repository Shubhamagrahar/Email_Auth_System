import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const smtpTransporter = nodemailer.createTransport({
  service: 'Gmail', // Or "Zoho", "Outlook", or use 'host' and 'port' for custom SMTP
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS
  }
});

export const smtpSender = {
  email: process.env.SMTP_EMAIL,
  name: "Authentication System"
};
