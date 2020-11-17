import Message from "../../../shared/mail/message";
import winston from "winston";

const logger = winston.loggers.get("application");
import conf from "../commons/simpleConfigure";
const testLocal = conf.get("doNotSendMails") || false;

import transport from "./nodemailerTransport";
import Mail from "nodemailer/lib/mailer";
import Renderer from "../../../shared/commons/renderer";
import path from "path";
import pug from "pug";

function toTransportObject(message: Message): Mail.Options {
  const renderingOptions = {
    pretty: true,
    content: Renderer.render(message.markdown),
    plain: message.markdown,
  };
  const filename = path.join(__dirname, "views/mailtemplate.pug");
  const filenameTextonly = path.join(__dirname, "views/mailtemplate-textonly.pug");

  const senderAddress = conf.get("sender-address") as string;
  return {
    from: Message.formatEMailAddress(message.senderName(conf.get("sender-name") as string), message.senderAddress(senderAddress)),
    to: message.to || message.senderAddress(senderAddress),
    bcc: message.bcc || message.senderAddress(senderAddress),
    subject: message.subject,
    text: pug.renderFile(filenameTextonly, renderingOptions),
    html: pug.renderFile(filename, renderingOptions),
  };
}

function sendMail(message: Message, callback: Function): void {
  const transportObject = toTransportObject(message);
  if (testLocal) {
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
