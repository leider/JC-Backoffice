const beans = require('simple-configure').get('beans');
const veranstaltungenstore = beans.get('veranstaltungenstore');
const fieldHelpers = beans.get('fieldHelpers');
const OptionValues = beans.get('optionValues');

module.exports = {

  fuerJahr: function fuerJahr(jahr, callback) {
    const from = fieldHelpers.parseToMomentUsingDefaultTimezone('1.1.' + jahr);
    const to = fieldHelpers.parseToMomentUsingDefaultTimezone('31.12.' + jahr);
    return veranstaltungenstore.byDateRangeInAscendingOrder(from, to, callback);
  },

  optionen: function optionen(callback) {
    const result = new OptionValues({
      typen: [
        'Heimspiel',
        'Jazz und Literatur',
        'JazzClassix',
        'JazzFestival',
        'JC im Kunstverein',
        'Session I',
        'Session II',
        'Soulcafé',
        'Club Konzert'
      ],
      orte: [
        'Alte Hackerei',
        'Badischer Kunsterverein',
        'Badisches Staatstheater',
        'Jubez',
        'Substage',
        'Tempel',
        'Tollhaus',
        'ZKM'
      ],
      verantwortliche: [
        'NB',
        'CT',
        'JL',
        'EH',
        'JWM',
        'TA',
        'MH'
      ],
      kooperationen: [
        '',
        'Stadt/ZKM',
        'Tempel',
        'Stadtjugendaussschuss'
      ],
      kontakte: [
        {auswahl: '<manuell>'},
        {auswahl: 'K1', name: 'Ka eins'},
        {auswahl: 'K2'},
        {auswahl: 'K3'}
      ]
    });
    return callback(null, result);
  }
};
