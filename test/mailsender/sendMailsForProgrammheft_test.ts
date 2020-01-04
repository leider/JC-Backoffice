import { expect } from 'chai';
import sin from 'sinon';
const sinon = sin.createSandbox();

import '../../configure';

import DatumUhrzeit from '../../lib/commons/DatumUhrzeit';
import kalenderstore from '../../lib/programmheft/kalenderstore';
import Kalender from '../../lib/programmheft/kalender';
import mailtransport from '../../lib/mailsender/mailtransport';
import { remindForProgrammheft } from '../../lib/mailsender/sendMailsForProgrammheft';

describe('Programmheft Mailsender', () => {
  const april12 = DatumUhrzeit.forGermanString('12.04.2019');
  const april13 = DatumUhrzeit.forGermanString('13.04.2019');

  const currentKalender = new Kalender({
    id: '2019/05',
    text:
      'Was | Wer | Farbe | Wann | Email | Tage vorher\n' +
      'Putzen | Jeder | green | 15.04.19 | x@y.z | 3'
  });
  const nextKalender = new Kalender({
    id: '2019/07',
    text:
      'Was | Wer | Farbe | Wann | Email | Tage vorher\n' +
      'Putzen | Jeder | green | 15.06.19 | x@y.z | 3'
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mailcheck: any;

  beforeEach(() => {
    sinon
      .stub(kalenderstore, 'getCurrentKalender')
      .callsFake((datum, callback) => {
        callback(null, currentKalender);
      });
    sinon
      .stub(kalenderstore, 'getNextKalender')
      .callsFake((datum, callback) => {
        callback(null, nextKalender);
      });
    mailcheck = sinon
      .stub(mailtransport, 'sendMail')
      .callsFake((message, callback) => {
        callback();
      });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('runs correctly on a day where notificatons lie', done => {
    remindForProgrammheft(april12 as DatumUhrzeit, (err: Error | null | undefined) => {
      sinon.assert.calledOnce(mailcheck);
      const message = mailcheck.args[0][0];
      expect(message.senderAddress).to.equal('bo@jazzclub.de');
      expect(message.subject).to.equal('Programmheft Action Reminder');
      done(err);
    });
  });

  it('runs correctly on a day where no notificatons lie', done => {
    remindForProgrammheft(april13 as DatumUhrzeit, (err: Error | null | undefined) => {
      sinon.assert.notCalled(mailcheck);
      done(err);
    });
  });
});
