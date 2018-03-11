const conf = require('simple-configure');
const beans = conf.get('beans');

const userstore = beans.get('userstore');

const Message = beans.get('message');

const receiver = conf.get('hotelMailReceiver');

function createContent(veranstaltung) {
  const hotel = veranstaltung.hotel();
  const unterkunft = veranstaltung.unterkunft();
  const text = 'Hallo ' + receiver + ',\n' + 'anbei Informationen zu einer Hotelbuchung.\n' +
    'Kannst bitte folgende Buchung machen?\n\n';
  const infoHotel = '#### Hotel\n' +
    hotel.name() + '\n\n' +
    hotel.adresse() + '\n\n' +
    '**E-Mail:** ' + hotel.email() + '\n\n';
  const infoUnterkunft = '**Anreise**: ' + unterkunft.anreiseDisplayDate() + '\n\n' +
    '**Abreise**: ' + unterkunft.abreiseDisplayDate() + '\n\n' +
    '**Kommentar**:\n' + unterkunft.kommentar() + '\n\n' +
    '**Doppel:** ' + unterkunft.doppelNum() + ' **Einzel:** ' + unterkunft.einzelNum() + ' **Suite:** ' + unterkunft.suiteNum() + '\n\n';
  return text + infoHotel + infoUnterkunft;
}

function createReminder(veranstaltung, currentUser, callback) {
  if (!veranstaltung.hotel().name()) {
    return callback(new Error('Kein Hotel gewählt'));
  }
  const unterkunft = veranstaltung.unterkunft();
  if (unterkunft.anzahlNaechte() <= 0) {
    return callback(new Error('Keine Übernachtung gewählt'));
  }
  if (unterkunft.anzahlZimmer() <= 0) {
    return callback(new Error('Keine Zimmer gewählt'));
  }
  userstore.forId(receiver, (err, user) => {
    if (err) { return callback(err); }
    var markdownToSend = createContent(veranstaltung);
    const message = new Message({subject: '[B-O Jazzclub] Hotelbenachrichtigung', markdown: markdownToSend}, user.name, user.email);
    message.setTo(user.email);
    return callback(null, message);
  });
}

module.exports = {createReminder: createReminder};
