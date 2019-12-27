import fieldHelpers from '../../lib/commons/fieldHelpers';
const expect = require('must-dist');

describe('formatNumberWithCurrentLocale', () => {
  it('formats for "de"', () => {
    const result = fieldHelpers.formatNumberTwoDigits(22);
    expect(result).to.eql('22,00');
  });
});
