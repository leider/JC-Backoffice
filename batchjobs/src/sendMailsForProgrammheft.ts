import Message from "jc-shared/mail/message";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Kalender, { EmailEvent } from "jc-shared/programmheft/kalender";

import store from "jc-backend/lib/programmheft/kalenderstore";
import mailtransport from "jc-backend/lib/mailsender/mailtransport";

export async function remindForProgrammheft(now: DatumUhrzeit = new DatumUhrzeit()) {
  async function sendMail(eventsForToday: EmailEvent[]) {
    const messages = eventsForToday.map((e) => {
      const message = new Message({
        subject: "Programmheft Action Reminder",
        markdown: e.body(),
      });
      message.setTo(e.email());
      return message;
    });
    return Promise.all(messages.map(mailtransport.sendMail));
  }

  const [current, next] = await Promise.all([store.getCurrentKalender(now), store.getNextKalender(now)]);
  if (!current || !next) {
    return;
  }
  const events = [current as Kalender, next as Kalender].reduce(
    (previous: EmailEvent[], current) => previous.concat(current.eventsToSend(now)),
    []
  );
  return sendMail(events);
}
