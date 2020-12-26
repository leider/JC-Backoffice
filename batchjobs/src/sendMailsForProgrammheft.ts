import async, { ErrorCallback } from "async";

import Message from "../../shared/mail/message";
import DatumUhrzeit from "../../shared/commons/DatumUhrzeit";
import Kalender, { EmailEvent } from "../../shared/programmheft/kalender";

import store from "../../backend/lib/programmheft/kalenderstore";
import mailtransport from "../../backend/lib/mailsender/mailtransport";

export function remindForProgrammheft(now: DatumUhrzeit = new DatumUhrzeit(), callback: ErrorCallback): void {
  function sendMail(eventsForToday: EmailEvent[], callbackInner: ErrorCallback): void {
    const messages = eventsForToday.map((e) => {
      const message = new Message({
        subject: "Programmheft Action Reminder",
        markdown: e.body(),
      });
      message.setTo(e.email());
      return message;
    });
    async.each(messages, mailtransport.sendMail, callbackInner);
  }

  async.parallel(
    {
      current: (cb1) => store.getCurrentKalender(now, cb1),
      next: (cb2) => store.getNextKalender(now, cb2),
    },
    (err, result) => {
      if (err) {
        return callback(err);
      }
      const events = [result.current as Kalender, result.next as Kalender].reduce(
        (arr: EmailEvent[], each) => arr.concat(each.eventsToSend(now)),
        []
      );
      return sendMail(events, callback);
    }
  );
}
