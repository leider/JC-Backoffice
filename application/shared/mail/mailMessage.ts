import User from "../user/user.js";
import map from "lodash/map.js";

export type MailAddress = { name: string; address: string };

export default class MailMessage {
  subject: string;
  body = ""; // can be markdown
  replyTo?: MailAddress;
  to?: MailAddress[];
  bcc?: MailAddress[];
  from?: MailAddress;
  attachments: { filename: string; content: Buffer }[];

  constructor({ subject }: { subject: string }) {
    this.subject = subject;
    this.attachments = [];
    return this;
  }

  static forJsonAndUser({ subject, body, bcc }: { subject: string; body: string; bcc: MailAddress[] }, user: User) {
    const message = new MailMessage({ subject });
    message.body = body;
    message.bcc = bcc;
    message.replyTo = MailMessage.formatEMailAddress(user.name, user.email);
    return message;
  }

  static formatEMailAddress(name: string, email: string): MailAddress {
    return { name, address: email };
  }

  static formatEMailAddressCommaSeparated(nameWithCommas: string, emailWithCommas: string): MailAddress[] {
    const names = nameWithCommas.split(",");
    const emails = emailWithCommas.split(",");
    return map(names, (name, index) => ({ name: name, address: emails[index] }));
  }

  attach(attachment: { filename: string; content: Buffer }) {
    this.attachments.push(attachment);
  }
}
