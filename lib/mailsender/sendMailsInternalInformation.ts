import DatumUhrzeit from '../commons/DatumUhrzeit';
import config from '../commons/simpleConfigure';
import { loggers } from 'winston';
const logger = loggers.get('application');

import store from '../veranstaltungen/veranstaltungenstore';
import userstore from '../users/userstore';
import mailstore from './mailstore';
import Message from './message';
import mailtransport from './mailtransport';
import misc from '../commons/misc';
import MailRule from './mailRule';
import Veranstaltung from '../veranstaltungen/object/veranstaltung';
import User from '../users/user';
import usersService from '../users/usersService';

export function checkPressetexte(now: DatumUhrzeit, callbackOuter: Function) {
  const start = now;
  const end = start.plus({ tage: 1 }); // Eine Woche im Voraus

  function processRules(rules: MailRule[], callback: Function) {
    const maxDay = rules
      .map(rule => rule.startAndEndDay(end).end)
      .reduce((day1, day2) => (day1.istNach(day2) ? day1 : day2), end);

    function sendMail(
      kaputteVeranstaltungen: Veranstaltung[],
      callbackInner: Function
    ) {
      const markdownToSend = `## Folgende Veranstaltungen haben noch keinen Pressetext und werden im Laufe der nächsten Woche der Presse angekündigt:

---
${kaputteVeranstaltungen
  .map(veranst => veranst.presseTemplateInternal())
  .join('\n\n---\n')}`;
      const message = new Message({
        subject: 'Veranstaltungen ohne Pressetext',
        markdown: markdownToSend
      });
      usersService.emailsAllerBookingUser(
        (err: Error | null, bookingAddresses: string) => {
          logger.info(
            `Email Adressen für fehlende Pressetexte: ${bookingAddresses}`
          );
          message.setBcc(bookingAddresses);
          mailtransport.sendMail(message, callbackInner);
        }
      );
    }

    store.byDateRangeInAscendingOrder(
      start,
      maxDay,
      (err1: Error | null, veranstaltungen: Veranstaltung[]) => {
        if (err1) {
          return;
        }
        const zuSendende = veranstaltungen.filter(
          veranstaltung =>
            !veranstaltung.presse().checked() &&
            veranstaltung.kopf().confirmed()
        );
        if (zuSendende.length === 0) {
          return callback();
        }
        sendMail(zuSendende, callback);
      }
    );
  }

  mailstore.all((err: Error | null, rules: MailRule[]) => {
    if (err) {
      return;
    }
    const relevantRules = rules.filter(rule =>
      rule.shouldSendUntil(start, end)
    );
    processRules(relevantRules, callbackOuter);
  });
}

export function checkKasse(now: DatumUhrzeit, callback: Function) {
  const start = now;
  const end = start.plus({ tage: 1 }); // Eine Woche im Voraus

  function sendMail(
    kaputteVeranstaltungen: Veranstaltung[],
    callbackInner: Function
  ) {
    const markdownToSend = `## Bei folgenden Veranstaltungen der nächsten 8 Tage fehlt noch jemand an der Kasse:

---
${kaputteVeranstaltungen
  .map(
    veranst =>
      `<a href="${misc.toFullQualifiedUrl(
        'veranstaltungen',
        encodeURIComponent(veranst.url())
      )}">` +
      `${veranst
        .kopf()
        .titel()} am ${veranst.datumForDisplayShort()} ${veranst
        .kopf()
        .presseIn()}</a>`
  )
  .join('\n\n---\n')}

--- 
<a href="${misc.toFullQualifiedUrl('teamseite', '')}">Zur Teamseite</a>`;

    const message = new Message({
      subject: 'Kassenpersonal für Veranstaltungen gesucht',
      markdown: markdownToSend
    });

    userstore.allUsers((err: Error | null, users: User[]) => {
      if (err) {
        return callback(err);
      }
      const validUsers = users.filter(user => !!user.email);
      const emails = validUsers.map(user =>
        Message.formatEMailAddress(user.name, user.email)
      );
      logger.info(`Email Adressen für fehlende Kasse: ${emails}`);
      message.setBcc(emails);
      mailtransport.sendMail(message, callbackInner);
    });
  }

  store.byDateRangeInAscendingOrder(
    start,
    end,
    (err1: Error | null, veranstaltungen: Veranstaltung[]) => {
      if (err1) {
        return;
      }
      const zuSendende = veranstaltungen.filter(veranstaltung =>
        veranstaltung.kasseFehlt()
      );
      if (zuSendende.length === 0) {
        return callback();
      }
      sendMail(zuSendende, callback);
    }
  );
}

export function checkFluegel(now: DatumUhrzeit, callback: Function) {
  if (now.wochentag !== 7) {
    // Sonntag
    return callback();
  }
  const stimmerName = config.get('stimmer-name');
  const stimmerEmail = config.get('stimmer-email');
  if (!stimmerName || !stimmerEmail) {
    return callback();
  }
  const start = now;
  const end = start.plus({ wochen: 6 }); // Sechs Wochen im Voraus

  function sendMail(
    veranstaltungenMitFluegel: Veranstaltung[],
    callbackInner: Function
  ) {
    const markdownToSend = `## Bei folgenden Veranstaltungen brauchen wir einen Klavierstimmer:

---
${veranstaltungenMitFluegel
  .map(
    veranst =>
      veranst.kopf().titel() +
      ' am ' +
      veranst.datumForDisplayShort() +
      ' ' +
      veranst.kopf().presseIn()
  )
  .join('\n\n---\n')}`;

    const message = new Message({
      subject: 'Flügelstimmen im Jazzclub',
      markdown: markdownToSend
    });

    usersService.emailsAllerBookingUser(
      (err: Error | null, bookingAddresses: string[]) => {
        if (err) {
          return callback(err);
        }
        logger.info(`Email Adressen für Flügelstimmen: ${bookingAddresses}`);
        message.setTo([Message.formatEMailAddress(stimmerName, stimmerEmail)]);
        message.setBcc(bookingAddresses);
        mailtransport.sendMail(message, callbackInner);
      }
    );
  }

  store.byDateRangeInAscendingOrder(
    start,
    end,
    (err1: Error | null, veranstaltungen: Veranstaltung[]) => {
      if (err1) {
        return;
      }
      const zuSendende = veranstaltungen.filter(veranstaltung =>
        veranstaltung.technik().fluegel()
      );
      if (zuSendende.length === 0) {
        return callback();
      }
      sendMail(zuSendende, callback);
    }
  );
}
