import { smtpTransporter, smtpSender } from "./smtp.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE
} from "./emailTemplates.js";

export const sendSMTPVerificationEmail = async (email, verificationToken) => {
  try {
    await smtpTransporter.sendMail({
      from: `"${smtpSender.name}" <${smtpSender.email}>`,
      to: email,
      subject: "Verify your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
    });
    console.log("SMTP: Verification email sent");
  } catch (error) {
    console.error("SMTP: Error sending verification email", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendSMTPPasswordResetEmail = async (email, resetURL) => {
  try {
    await smtpTransporter.sendMail({
      from: `"${smtpSender.name}" <${smtpSender.email}>`,
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });
    console.log("SMTP: Password reset email sent");
  } catch (error) {
    console.error("SMTP: Error sending reset email", error);
    throw new Error("Failed to send password reset email");
  }
};

export const sendSMTPResetSuccessEmail = async (email) => {
  try {
    await smtpTransporter.sendMail({
      from: `"${smtpSender.name}" <${smtpSender.email}>`,
      to: email,
      subject: "Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });
    console.log("SMTP: Reset success email sent");
  } catch (error) {
    console.error("SMTP: Error sending success email", error);
    throw new Error("Failed to send password reset success email");
  }
};

export const sendSMTPWelcomeEmail = async (email, name) => {
  try {
    await smtpTransporter.sendMail({
      from: `"${smtpSender.name}" <${smtpSender.email}>`,
      to: email,
      subject: "Welcome to Authentication System!",
      html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
    });
    console.log("SMTP: Welcome email sent");
  } catch (error) {
    console.error("SMTP: Error sending welcome email", error);
    throw new Error("Failed to send welcome email");
  }
};