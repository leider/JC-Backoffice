const conf = require('simple-configure');
const beans = conf.get('beans');

const userstore = beans.get('userstore');
const fieldHelpers = beans.get('fieldHelpers');
const Message = beans.get('message');

const receiver = conf.get('hotelMailReceiver');

function createContent(veranstaltung, text, hotelInfoSchreiben) {
  const hotel = veranstaltung.hotel();
  const unterkunft = veranstaltung.unterkunft();
  const infoHotel = '#### Hotel\n' +
    hotel.name() + '\n\n' +
    hotel.adresse() + '\n\n' +
    '**E-Mail:** ' + hotel.email() + '\n\n';
  const infoUnterkunft = '**Anreise**: ' + unterkunft.anreiseDisplayDate() + '\n\n' +
    '**Abreise**: ' + unterkunft.abreiseDisplayDate() + '\n\n' +
    '**Kommentar**:\n' + unterkunft.kommentar() + '\n\n' +
    '**Einzel:** ' + unterkunft.einzelNum() + ' zum Preis von: ' +
    fieldHelpers.formatNumberTwoDigits(unterkunft.einzelEUR()) + ' &euro;\n' +
    '**Doppel:** ' + unterkunft.doppelNum() + ' zum Preis von: ' +
    fieldHelpers.formatNumberTwoDigits(unterkunft.doppelEUR()) + ' &euro;\n' +
    '**Suite:** ' + unterkunft.suiteNum() + ' zum Preis von: ' +
    fieldHelpers.formatNumberTwoDigits(unterkunft.suiteEUR()) + ' &euro;\n\n';
  return text + (hotelInfoSchreiben ? infoHotel : '') + infoUnterkunft;
}

function checkStuff(veranstaltung) {
  if (!veranstaltung.hotel().name()) {
    return new Error('Kein Hotel gewählt');
  }
  const unterkunft = veranstaltung.unterkunft();
  if (unterkunft.anzahlNaechte() <= 0) {
    return new Error('Keine Übernachtung gewählt');
  }
  if (unterkunft.anzahlZimmer() <= 0) {
    return new Error('Keine Zimmer gewählt');
  }

}

function createReminder(veranstaltung, currentUser, callback) {
  const error = checkStuff(veranstaltung);
  if (error) { return callback(error); }
  userstore.forId(receiver, (err, user) => {
    if (err) { return callback(err); }
    const text = 'Hallo ' + receiver + ',\n' + 'anbei Informationen zu einer Hotelbuchung.\n' +
      'Kannst Du bitte folgende Buchung machen?\n\n';
    const markdown = createContent(veranstaltung, text, true);
    const message = new Message({
      subject: '[B-O Jazzclub] Hotelbenachrichtigung',
      markdown: markdown
    }, currentUser.name, currentUser.email);
    message.setTo(user.email);
    return callback(null, message);
  });
}

function createReservation(veranstaltung, currentUser, mailart, callback) {
  const error = checkStuff(veranstaltung);
  if (error) { return callback(error); }
  const realReceiver = mailart === 'preview' ? currentUser.email : veranstaltung.hotel().email();
  if (!realReceiver) { return callback(new Error('Keine E-Mail Adresse zum Senden')); }

  const text = 'Hallo ,\n' +
    'im Namen des Jazzclub würde ich gerne folgende Zimmer reservieren.\n' +
    'Bitte bestätigen Sie mir die Anfrage und die Preise.\n\n' +
    'Mit freundlichen Grüßen,\n' +
    currentUser.name + '\n\n --- \n';
  const markdown = createContent(veranstaltung, text, false);
  const message = new Message({
    subject: '[Jazzclub] Reservierungsanfrage',
    markdown: markdown
  }, currentUser.name, currentUser.email);
  message.setTo(realReceiver);
  return callback(null, message);
}

module.exports = {
  createReminder,
  createReservation
};
