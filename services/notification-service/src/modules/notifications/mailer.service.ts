import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 1025,
    secure: false,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });

  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    correlationId: string;
  }): Promise<void> {
    const from = process.env.MAIL_FROM ?? 'no-reply@fst-cfc.local';

    await this.transporter.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      headers: {
        'x-correlation-id': params.correlationId,
      },
    });
  }
}
