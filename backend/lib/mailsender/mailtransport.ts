import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import winston from "winston";
const logger = winston.loggers.get("application");

import Message from "jc-shared/mail/message";

import conf from "../commons/simpleConfigure";
const doNotSendMails = conf.get("doNotSendMails") || "";
import MailBodyRenderer from "./mailbodyRenderer";

const transport = nodemailer.createTransport(conf.get("transport-options") as object);

// exported for testing
export function toTransportObject(message: Message, isForDatev: boolean): Mail.Options {
  const mbRenderer = new MailBodyRenderer(message.markdown);

  const senderAddress = isForDatev ? (conf.get("sender-address-datev") as string) : (conf.get("sender-address") as string);
  const senderName = (conf.get("sender-name") as string) + (isForDatev ? " für Datev" : "");
  return {
    from: Message.formatEMailAddress(message.senderName(senderName), message.senderAddress(senderAddress)),
    to: message.to || message.senderAddress(senderAddress),
    bcc: message.bcc || message.senderAddress(senderAddress),
    subject: message.subject,
    text: mbRenderer.text,
    html: mbRenderer.html,
    attachments: message.pdfBufferAndName && [{ filename: message.pdfBufferAndName.name, content: message.pdfBufferAndName.pdf as Buffer }],
  };
}

function sendMail(message: Message, callback: Function): void {
  sendMailInternal(message, false, callback);
}

function sendDatevMail(message: Message, callback: Function): void {
  sendMailInternal(message, true, callback);
}

function sendMailInternal(message: Message, isForDatev: boolean, callback: Function): void {
  const transportObject = toTransportObject(message, isForDatev);
  if (doNotSendMails) {
    const withoutAttachments = JSON.parse(JSON.stringify(transportObject));
    delete withoutAttachments.attachments;
    logger.info(JSON.stringify(withoutAttachments, null, 2));
    delete transportObject.to;
    transportObject.bcc = doNotSendMails as string;
  }
  transport.sendMail(transportObject, (err: Error | null) => {
    if (err) {
      logger.error(err.stack as string);
    }
    callback(err);
  });
}

export default {
  sendMail,
  sendDatevMail,
};
