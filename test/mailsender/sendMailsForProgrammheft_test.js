const sinon = require('sinon').createSandbox();
const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const DatumUhrzeit = beans.get('DatumUhrzeit');
const kalenderstore = beans.get('kalenderstore');
const Kalender = beans.get('kalender');
const mailtransport = beans.get('mailtransport');

const sendMailsForProgrammheft = require('../../lib/mailsender/sendMailsForProgrammheft');

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

  let mailcheck;

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
    sendMailsForProgrammheft.remindForProgrammheft(april12, err => {
      sinon.assert.calledOnce(mailcheck);
      const message = mailcheck.args[0][0];
      expect(message.senderAddress).to.be('bo@jazzclub.de');
      expect(message.subject).to.be('Programmheft Action Reminder');
      done(err);
    });
  });

  it('runs correctly on a day where no notificatons lie', done => {
    sendMailsForProgrammheft.remindForProgrammheft(april13, err => {
      sinon.assert.notCalled(mailcheck);
      done(err);
    });
  });
});
