import async, { ErrorCallback } from "async";

import Message from "jc-shared/mail/message";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Kalender, { EmailEvent } from "jc-shared/programmheft/kalender";

import store from "jc-backend/lib/programmheft/kalenderstore";
import mailtransport from "jc-backend/lib/mailsender/mailtransport";

export async function remindForProgrammheft(now: DatumUhrzeit = new DatumUhrzeit(), callback: ErrorCallback) {
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

  try {
    const [current, next] = await Promise.all([store.getCurrentKalender(now), store.getNextKalender(now)]);
    const events = [current as Kalender, next as Kalender].reduce((arr: EmailEvent[], each) => arr.concat(each.eventsToSend(now)), []);
    return sendMail(events, callback);
  } catch (e) {
    callback(e as Error);
  }
}
