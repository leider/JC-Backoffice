import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import { Event } from "jc-shared/programmheft/Event.js";

import store from "jc-backend/lib/programmheft/kalenderstore.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import User from "jc-shared/user/user.js";
import { JobResult } from "./sendMailsNightly.js";

export class EmailEvent {
  event: Event;

  constructor(event: Event) {
    this.event = event;
  }

  private get datumUhrzeitToSend(): DatumUhrzeit {
    return this.start.minus({ tage: this.event.emailOffset });
  }

  shouldSendOn(datumUhrzeit: DatumUhrzeit): boolean {
    return Math.abs(this.datumUhrzeitToSend.differenzInTagen(datumUhrzeit)) === 0;
  }

  get start(): DatumUhrzeit {
    return DatumUhrzeit.forISOString(this.event.start);
  }

  private selectedUsers(allUsers: User[]) {
    return allUsers.filter((user) => {
      return this.event.users.includes(user.id);
    });
  }

  email(allUsers?: User[]): string[] {
    if (!allUsers || !this.event.users.length) {
      return (this.event.email ?? "").split(/[, ]+/).map((each) => each.trim());
    } else {
      return this.selectedUsers(allUsers).map((user) => user.email);
    }
  }

  names(allUsers?: User[]): string {
    if (!allUsers || !this.event.users.length) {
      return this.event.wer ?? "";
    } else {
      return this.selectedUsers(allUsers)
        .map((user) => user.name)
        .join(", ");
    }
  }

  body(allUsers?: User[]): string {
    return `Hallo ${this.names(allUsers)},

hier eine automatische Erinnerungsmail:
${this.event.was}

Vielen Dank für Deine Arbeit und Unterstützung,
Damit alles reibungslos klappt, sollte dies bis zum ${this.start.tagMonatJahrLang} erledigt sein.

Danke & keep swingin'`;
  }
}

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

/**
 * exported for testing
 */
export function eventsToSend(aDatumUhrzeit: DatumUhrzeit, events?: Event[]): EmailEvent[] {
  const result = (events ?? []).filter((e) => !!e.email).map((e) => new EmailEvent(e));
  return result.filter((e) => e.shouldSendOn(aDatumUhrzeit));
}

export async function remindForProgrammheft(now: DatumUhrzeit = new DatumUhrzeit()): Promise<JobResult> {
  const current = store.getCurrentKalender(now);
  const next = store.getNextKalender(now);
  try {
    if (!current && !next) {
      return {};
    }
    return { result: await sendMail(eventsToSend(now, current?.events).concat(eventsToSend(now, next?.events))) };
  } catch (e) {
    return { error: e as Error };
  }
}
