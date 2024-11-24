import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import { EmailEvent } from "jc-shared/programmheft/kalender.js";

import store from "jc-backend/lib/programmheft/kalenderstore.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import MailMessage from "jc-shared/mail/mailMessage.js";

async function sendMail(eventsForToday: EmailEvent[]) {
  const messages = eventsForToday.map((e) => {
    const message = new MailMessage({
      subject: "Programmheft Action Reminder",
    });
    message.body = e.body();
    message.to = e.email().map((email) => ({ name: "", address: email ?? "" }));
    return message;
  });
  return Promise.all(messages.map(mailtransport.sendMail));
}

export async function remindForProgrammheft(now: DatumUhrzeit = new DatumUhrzeit()) {
  const current = store.getCurrentKalender(now);
  const next = store.getNextKalender(now);
  if (!current || !next) {
    return;
  }
  const events = [current, next].reduce((previous: EmailEvent[], current) => previous.concat(current.eventsToSend(now)), []);
  return sendMail(events);
}
