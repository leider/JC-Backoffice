import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import winston from "winston";
const logger = winston.loggers.get("application");

import Message from "jc-shared/mail/message.js";

import conf from "jc-shared/commons/simpleConfigure.js";
import MailBodyRenderer from "./mailbodyRenderer.js";

const transport = nodemailer.createTransport(conf.transportOptions);

// exported for testing
export function toTransportObject(message: Message, isForDatev: boolean): Mail.Options {
  const mbRenderer = new MailBodyRenderer(message.markdown);

  const senderAddress = isForDatev ? conf.senderAddressDatev : conf.senderAddress;
  const senderName = conf.senderName + (isForDatev ? " für Datev" : "");
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

async function sendMail(message: Message) {
  return sendMailInternal(message, false);
}

async function sendDatevMail(message: Message) {
  return sendMailInternal(message, true);
}

async function sendMailInternal(message: Message, isForDatev: boolean) {
  const transportObject = toTransportObject(message, isForDatev);
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
