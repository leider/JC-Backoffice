import async, { ErrorCallback } from 'async';

import store from '../programmheft/kalenderstore';
import Message from './message';
import mailtransport from './mailtransport';
import DatumUhrzeit from '../commons/DatumUhrzeit';
import Kalender, { EmailEvent } from '../programmheft/kalender';

export function remindForProgrammheft(
  now: DatumUhrzeit = new DatumUhrzeit(),
  callback: ErrorCallback<Error>
) {
  function sendMail(
    eventsForToday: EmailEvent[],
    callbackInner: ErrorCallback<Error>
  ) {
    const messages = eventsForToday.map(e => {
      const message = new Message({
        subject: 'Programmheft Action Reminder',
        markdown: e.body()
      });
      message.setTo([e.email()]);
      return message;
    });
    async.each(messages, mailtransport.sendMail, callbackInner);
  }

  async.parallel(
    {
      current: cb1 => store.getCurrentKalender(now, cb1),
      next: cb2 => store.getNextKalender(now, cb2)
    },
    (err, result) => {
      if (err) {
        return callback(err);
      }
      const events = [
        result.current as Kalender,
        result.next as Kalender
      ].reduce(
        (arr: EmailEvent[], each) => arr.concat(each.eventsToSend(now)),
        []
      );
      sendMail(events, callback);
    }
  );
}
