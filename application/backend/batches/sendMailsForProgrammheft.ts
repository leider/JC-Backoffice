import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import { Event } from "jc-shared/programmheft/Event.js";

import store from "../lib/programmheft/kalenderstore.js";
import mailtransport from "../lib/mailsender/mailtransport.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import User from "jc-shared/user/user.js";
import { JobResult } from "./index.js";
import userstore from "../lib/users/userstore.js";
import map from "lodash/map.js";
import filter from "lodash/filter.js";

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
    return filter(allUsers, (user) => this.event?.users?.includes(user.id));
  }

  email(allUsers: User[]): string[] {
    return map(this.selectedUsers(allUsers), "email");
  }

  names(allUsers: User[]): string {
    return map(this.selectedUsers(allUsers), "name").join(", ");
  }

  body(allUsers: User[]): string {
    return `Hallo ${this.names(allUsers)},

hier eine automatische Erinnerungsmail:
${this.event.was}

Vielen Dank für Deine Arbeit und Unterstützung,
Damit alles reibungslos klappt, sollte dies bis zum ${this.start.tagMonatJahrLang} erledigt sein.

Danke & keep swingin'`;
  }
}

async function sendMail(eventsForToday: EmailEvent[]) {
  const allUsers = userstore.allUsers();
  const messages = map(eventsForToday, (e) => {
    const message = new MailMessage({
      subject: "Programmheft Action Reminder",
    });
    message.body = e.body(allUsers);
    message.to = map(e.email(allUsers), (email) => ({ name: "", address: email ?? "" }));
    return message;
  });
  return Promise.all(map(messages, mailtransport.sendMail));
}

function eventsToSend(aDatumUhrzeit: DatumUhrzeit, events?: Event[]): EmailEvent[] {
  const result = map(filter(events, "users.length"), (e) => new EmailEvent(e));
  return filter(result, (emailEvent) => emailEvent.shouldSendOn(aDatumUhrzeit));
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
