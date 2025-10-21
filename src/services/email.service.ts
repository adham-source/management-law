
import { transporter, mailOptions } from '../config/mail';
import { IUser } from '../models/User.model';
import { env } from '../config/env';
import logger from '../utils/logger';
import { verificationEmailTemplate } from '../templates/email/verification.template';

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

// You can add more email functions here, e.g., for password reset

