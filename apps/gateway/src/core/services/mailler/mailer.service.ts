import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MailerConfig } from '../../config/mailer/mailer.config';
import { Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private mailerConfig: MailerConfig) {
    const { emailHost, emailPort, emailUser, emailPassword } =
        this.mailerConfig;

    if (!emailHost || !emailPort || !emailUser || !emailPassword) {
      throw new Error('Missing required email configuration');
    }

    this.transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(String(emailPort), 10),
      secure: String(emailPort) === '465',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  }

  async sendEmail(
      recipient: string,
      emailTemplate: string,
      subject: string,
  ): Promise<boolean> {
    const info: SMTPTransport.SentMessageInfo = await this.transporter.sendMail(
        {
          from: this.mailerConfig.emailUser,
          to: recipient,
          subject,
          html: emailTemplate,
        },
    );

    console.log('Message sent: %s', info.messageId);
    return !!info;
  }
}