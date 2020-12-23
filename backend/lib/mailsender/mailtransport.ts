import winston from "winston";

const logger = winston.loggers.get("application");
import conf from "../commons/simpleConfigure";
const doNotSendMails = conf.get("doNotSendMails") || false;

import nodemailer from "nodemailer";
const transport = nodemailer.createTransport(conf.get("transport-options") as object);
import Mail from "nodemailer/lib/mailer";

import MailBodyRenderer from "./mailbodyRenderer";
import Message from "jc-shared/mail/message";

export function toTransportObject(message: Message): Mail.Options {
  const mbRenderer = new MailBodyRenderer(message.markdown);

  const senderAddress = conf.get("sender-address") as string;
  return {
    from: Message.formatEMailAddress(message.senderName(conf.get("sender-name") as string), message.senderAddress(senderAddress)),
    to: message.to || message.senderAddress(senderAddress),
    bcc: message.bcc || message.senderAddress(senderAddress),
    subject: message.subject,
    text: mbRenderer.text,
    html: mbRenderer.html,
  };
}

function sendMail(message: Message, callback: Function): void {
  const transportObject = toTransportObject(message);
  if (doNotSendMails) {
    console.log(transportObject);
    message.setTo();
    message.setBcc("derleider@web.de");
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
};
