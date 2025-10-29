
import { transporter, mailOptions } from '../config/mail';
import { IUser } from '../models/User.model';
import { env } from '../config/env';
import logger from '../utils/logger';
import { verificationEmailTemplate } from '../templates/email/verification.template';
import { resetPasswordTemplate } from '../templates/email/resetPassword.template';
import { passwordChangedTemplate } from '../templates/email/passwordChanged.template';

/**
 * Sends a verification email to a new user.
 * @param user The user object.
 * @param verificationToken The raw (unhashed) verification token.
 */
export const sendVerificationEmail = async (user: IUser, verificationToken: string) => {
  const verificationLink = `${env.FRONTEND_URL}/verify-email/${verificationToken}`;

  const emailContent = {
    ...mailOptions, // Use default from address
    to: user.email,
    subject: 'تفعيل حسابك - نظام إدارة المحاماة',
    html: verificationEmailTemplate(verificationLink, user.name),
  };

  try {
    await transporter.sendMail(emailContent);
    logger.info(`Verification email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Error sending verification email to ${user.email}:`, error);
    // We don't re-throw the error to not block the user registration process
    // The user can request a new verification email later.
  }
};

/**
 * Sends a password reset email to the user.
 * @param user The user object.
 * @param resetToken The raw (unhashed) reset token.
 */
export const sendPasswordResetEmail = async (user: IUser, resetToken: string) => {
  const resetLink = `${env.FRONTEND_URL}/reset-password/${resetToken}`;

  const emailContent = {
    ...mailOptions,
    to: user.email,
    subject: 'إعادة تعيين كلمة المرور - نظام إدارة المحاماة',
    html: resetPasswordTemplate(resetLink, user.name),
  };

  try {
    await transporter.sendMail(emailContent);
    logger.info(`Password reset email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Error sending password reset email to ${user.email}:`, error);
    // Do not re-throw, but the service layer should know about it to prevent token generation without email sending
    throw new Error('Failed to send password reset email.');
  }
};

/**
 * Sends a password changed notification email to the user.
 * @param user The user object.
 * @param initiatorName The name of the entity that initiated the password change (e.g., "You", "Admin [Admin Name]").
 */
export const sendPasswordChangedNotificationEmail = async (user: IUser, initiatorName: string) => {
  const emailContent = {
    ...mailOptions,
    to: user.email,
    subject: 'إشعار تغيير كلمة المرور - نظام إدارة المحاماة',
    html: passwordChangedTemplate(user.name, initiatorName),
  };

  try {
    await transporter.sendMail(emailContent);
    logger.info(`Password changed notification email sent to ${user.email} by ${initiatorName}`);
  } catch (error) {
    logger.error(`Error sending password changed notification email to ${user.email}:`, error);
    // We don't re-throw the error as the password change itself was successful.
  }
};
