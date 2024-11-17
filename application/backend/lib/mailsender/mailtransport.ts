import * as nodemailer from "nodemailer";
import * as Mail from "nodemailer/lib/mailer";
import * as winston from "winston";
import Message from "jc-shared/mail/message.js";

import conf from "jc-shared/commons/simpleConfigure.js";
import MailBodyRenderer from "./mailbodyRenderer.js";
import MailMessage from "jc-shared/mail/mailMessage.js";

const logger = winston.loggers.get("application");

const transport = nodemailer.createTransport(
  conf.transportOptions ?? {
    streamTransport: true,
  },
);

// exported for testing
export function toTransportObjectLegacy(message: Message, isForDatev: boolean): Mail.Options {
  const mbRenderer = new MailBodyRenderer(message.markdown);

  const senderAddress = isForDatev ? conf.senderAddress : conf.senderAddress;
  const senderName = conf.senderName + (isForDatev ? " für Datev" : "");
  const attachments = message.attachments ?? [];
  if (message.pdfBufferAndName) {
    attachments.push({ filename: message.pdfBufferAndName.name, content: message.pdfBufferAndName.pdf as Buffer });
  }
  return {
    from: Message.formatEMailAddress(message.senderName(senderName), message.senderAddress(senderAddress)),
    to: message.to || message.senderAddress(senderAddress),
    bcc: message.bcc || message.senderAddress(senderAddress),
    subject: message.subject,
    replyTo: message.replyTo,
    text: mbRenderer.text,
    html: mbRenderer.html,
    attachments,
  };
}
export function toTransportObject(mailMessage: MailMessage, isForDatev: boolean): Mail.Options {
  const mbRenderer = new MailBodyRenderer(mailMessage.body);

  const senderAddress = conf.senderAddress;
  const senderName = `${conf.senderName}${isForDatev ? " für Datev" : ""}`;
  const attachments = mailMessage.attachments ?? [];
  return {
    from: mailMessage.from ? mailMessage.from : { name: senderName, address: senderAddress },
    to: mailMessage.to ?? [conf.sender],
    bcc: mailMessage.bcc ?? [conf.sender],
    subject: mailMessage.subject,
    replyTo: mailMessage.replyTo,
    text: mbRenderer.text,
    html: mbRenderer.html,
    attachments,
  };
}

async function sendMail(message: MailMessage) {
  return sendMailInternal(message, false);
}

async function sendDatevMail(message: MailMessage) {
  return sendMailInternal(message, true);
}

async function sendMailInternal(mailMessage: MailMessage, isForDatev: boolean) {
  const transportObject = toTransportObject(mailMessage, isForDatev);
  if (conf.doNotSendMails) {
    const withoutAttachments = JSON.parse(JSON.stringify(transportObject));
    delete withoutAttachments.attachments;
    logger.info(JSON.stringify(withoutAttachments, null, 2));
    delete transportObject.to;
    transportObject.bcc = conf.doNotSendMails;
  }
  try {
    return transport.sendMail(transportObject);
  } catch (e) {
    logger.error((e as Error).stack as string);
    throw e;
  }
}

export default {
  sendMail,
  sendDatevMail,
};
