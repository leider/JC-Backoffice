const expect = require('must-dist');

import Kalender from '../../lib/programmheft/kalender';
import DatumUhrzeit from '../../lib/commons/DatumUhrzeit';

describe('Kalender', () => {
  describe('geht korrekt mit id und text um', () => {
    it('initial', () => {
      const kalender = new Kalender();
      expect(kalender.id()).is.undefined();
      expect(kalender.year()).is.undefined();
      expect(kalender.text()).is.not.undefined();
      expect(kalender.asEvents()).to.eql([]);
    });

    it('parses non existing id correctly', () => {
      const kalender = new Kalender({});
      expect(kalender.id()).is.undefined();
      expect(kalender.year()).is.undefined();
    });

    it('parses date correctly', () => {
      const kalender = new Kalender({ id: '2020/12' });
      expect(kalender.id()).to.eql('2020/12');
      expect(kalender.year()).to.eql('2020');
    });

    it('parses broken date correctly', () => {
      const kalender = new Kalender({ id: 'Peter/' });
      expect(kalender.id()).is.undefined();
      expect(kalender.year()).is.undefined();
    });

    it('parses empty text correctly', () => {
      const kalender = new Kalender({
        id: '2020/12',
        text: ''
      });
      expect(kalender.text()).to.not.eql('');
      expect(kalender.asEvents()).to.eql([]);
    });

    it('parses old style default text correctly', () => {
      const kalender = new Kalender({
        id: '2020/12',
        text: 'Was | Wer | Farbe | Wann\n' + '--- | --- | ---   | ---\n'
      });
      expect(kalender.text()).to.eql(
        'Was | Wer | Farbe | Wann\n' + '--- | --- | ---   | ---\n'
      );
      expect(kalender.asEvents()).to.eql([]);
    });
  });

  describe('geht korrekt mit datums um', () => {
    it('parses old style filled text correctly', () => {
      const kalender = new Kalender({
        id: '2020/12',
        text:
          'Was | Wer | Farbe | Wann\n' +
          'Irgendwas | Irgendwer | Green   | 13.12.2020\n'
      });
      expect(kalender.asEvents()).to.eql([
        {
          start: '2020-12-12T23:00:00.000Z',
          end: '2020-12-13T21:00:00.000Z',
          title: 'Irgendwas (Irgendwer)',
          color: 'Green'
        }
      ]);
    });

    it('ohne Jahr - parses old style filled text correctly', () => {
      const kalender = new Kalender({
        id: '2020/12',
        text:
          'Was | Wer | Farbe | Wann\n' +
          'Irgendwas | Irgendwer | Green   | 13.12.\n'
      });
      expect(kalender.asEvents()).to.eql([
        {
          start: '2020-12-12T23:00:00.000Z',
          end: '2020-12-13T21:00:00.000Z',
          title: 'Irgendwas (Irgendwer)',
          color: 'Green'
        }
      ]);
    });

    it('parses broken date text correctly (e.g. empty)', () => {
      const kalender = new Kalender({
        id: '2020/12',
        text:
          'Was | Wer | Farbe | Wann\n' +
          'Irgendwas | Irgendwer | Green   | 33.\n'
      });
      expect(kalender.asEvents()).to.eql([]);
    });
  });

  describe('geht korrekt mit Erweiterungen um  (email and mail offset)', () => {
    it('parses new style filled text correctly (email)', () => {
      const kalender = new Kalender({
        id: '2020/12',
        text:
          'Was | Wer | Farbe | Wann | Email\n' +
          'Irgendwas | Irgendwer | Green   | 13.12.2020 | andreas@andreas.as\n'
      });
      expect(kalender.asEvents()).to.eql([
        {
          start: '2020-12-12T23:00:00.000Z',
          end: '2020-12-13T21:00:00.000Z',
          title: 'Irgendwas (Irgendwer)',
          color: 'Green',
          email: 'andreas@andreas.as',
          emailOffset: 7,
          was: 'Irgendwas',
          wer: 'Irgendwer'
        }
      ]);
    });

    it('parses new style filled text correctly (email und offset)', () => {
      const kalender = new Kalender({
        id: '2020/12',
        text:
          'Was | Wer | Farbe | Wann | Email | Tage vorher\n' +
          'Irgendwas | Irgendwer | Green   | 13.12.2020 | andreas@andreas.as | 14\n'
      });
      expect(kalender.asEvents()).to.eql([
        {
          start: '2020-12-12T23:00:00.000Z',
          end: '2020-12-13T21:00:00.000Z',
          title: 'Irgendwas (Irgendwer)',
          color: 'Green',
          email: 'andreas@andreas.as',
          emailOffset: 14,
          was: 'Irgendwas',
          wer: 'Irgendwer'
        }
      ]);
    });
  });

  describe('findet Events mit E-Mail Adresse', () => {
    const kalender = new Kalender({
      id: '2020/12',
      text:
        'Was | Wer | Farbe | Wann | Email | Tage vorher\n' +
        'Irgendwas | Irgendwer | Green   | 11.12.2020 | \n' +
        'Irgendwas | Irgendwer | Green   | 13.12.2020 | andreas@andreas.as | 14\n'
    });
    const sendeDatum = DatumUhrzeit.forISOString('2020-11-29');

    it('und berücksichtigt den Offset', () => {
      const emailEvents = kalender.eventsToSend(sendeDatum);
      expect(emailEvents).to.have.length(1);

      const emailEvent = emailEvents[0];
      expect(emailEvent.event).to.eql({
        start: '2020-12-12T23:00:00.000Z',
        end: '2020-12-13T21:00:00.000Z',
        title: 'Irgendwas (Irgendwer)',
        color: 'Green',
        email: 'andreas@andreas.as',
        emailOffset: 14,
        was: 'Irgendwas',
        wer: 'Irgendwer'
      });
      expect(emailEvent.datumUhrzeitToSend().dateTime).to.eql(sendeDatum.dateTime);
      expect(emailEvent.email()).to.eql('andreas@andreas.as');
      expect(emailEvent.body()).to.eql(
        'Hallo Irgendwer\nHier eine automatische Erinnerungsmail, dass Deine Aufgabe "Irgendwas" bis zum 13. Dezember 2020 erledigt sein soll.\n\nVielen Dank für Deine Arbeit und Unterstützung,\nDer Backoffice-Mailautomat vom Jazzclub'
      );
    });
  });
});
