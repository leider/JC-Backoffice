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

async function sendMail(message: Message) {
  return sendMailInternal(message, false);
}

async function sendDatevMail(message: Message) {
  return sendMailInternal(message, true);
}

async function sendMailInternal(message: Message, isForDatev: boolean) {
  const transportObject = toTransportObject(message, isForDatev);
  if (doNotSendMails) {
    const withoutAttachments = JSON.parse(JSON.stringify(transportObject));
    delete withoutAttachments.attachments;
    logger.info(JSON.stringify(withoutAttachments, null, 2));
    delete transportObject.to;
    transportObject.bcc = doNotSendMails as string;
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
