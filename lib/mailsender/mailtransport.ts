import Message from './message';
import winston from 'winston';

const logger = winston.loggers.get('application');
import conf from '../commons/simpleConfigure';
const testLocal = conf.get('doNotSendMails') || false;

import transport from './nodemailerTransport';

function sendMail(message: Message, callback: Function) {
  if (testLocal) {
    // eslint-disable-next-line no-console
    console.log(message.toTransportObject());
    message.setTo();
    message.setBcc('derleider@web.de');
  }
  transport.sendMail(message.toTransportObject(), (err: Error | null) => {
    if (err) {
      logger.error(err.stack as string);
    }
    callback(err);
  });
}

export default {
  sendMail
};
