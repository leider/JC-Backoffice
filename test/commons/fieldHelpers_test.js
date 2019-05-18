const beans = require('../../configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const expect = require('must-dist');

describe('formatNumberWithCurrentLocale', () => {
  it('formats for "de"', () => {
    const result = fieldHelpers.formatNumberTwoDigits(22);
    expect(result).to.equal('22,00');
  });

  it('formats for "en"', () => {
    const res = { locals: { language: 'en-gb' } };
    const result = fieldHelpers.formatNumberWithCurrentLocale(res, 22);
    expect(result).to.equal('22.00');
  });

  it('formats "undefined"', () => {
    const res = { locals: { language: 'en-gb' } };
    const result = fieldHelpers.formatNumberWithCurrentLocale(res, undefined);
    expect(result).to.equal('0.00');
  });
});
