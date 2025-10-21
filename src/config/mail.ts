

import nodemailer from 'nodemailer';
import { env } from './env';

const mailConfig = {
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
};

export const transporter = nodemailer.createTransport(mailConfig);

export const mailOptions = {
  from: env.EMAIL_FROM,
};
