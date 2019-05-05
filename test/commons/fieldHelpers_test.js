const beans = require('../../configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const expect = require('must-dist');

describe('Replace email addresses from text', () => {
  it('returns the input if it is null or undefined', () => {
    expect(fieldHelpers.replaceMailAddresses(null)).to.equal(null);
    expect(fieldHelpers.replaceMailAddresses(undefined)).to.equal(undefined);
  });

  it('does not replace a single @ sign', () => {
    expect(fieldHelpers.replaceMailAddresses('@')).to.equal('@');
  });

  it('does not replace an @ sign when it is not in an email (no dots)', () => {
    expect(fieldHelpers.replaceMailAddresses('Seti@Home')).to.equal(
      'Seti@Home'
    );
  });

  it('does not replace an @ sign when it is not in an email (suffix too long)', () => {
    expect(fieldHelpers.replaceMailAddresses('I stay@Hans.Dampf')).to.equal(
      'I stay@Hans.Dampf'
    );
  });

  it('replaces a single email address', () => {
    const result = fieldHelpers.replaceMailAddresses(
      'Hans.Dampf_1@moby-dick.de'
    );

    expect(result).to.equal('...@...');
  });

  it('replaces an email address in a text', () => {
    const result = fieldHelpers.replaceMailAddresses(
      'many thanks to hans.dampf@moby-dick.de who sent me this link'
    );

    expect(result).to.equal('many thanks to ...@... who sent me this link');
  });

  it('replaces an email address in a quoted mail', () => {
    const result = fieldHelpers.replaceMailAddresses(
      '31.12.2005, Hans Dampf <hans_dampf.@mymail.org>:'
    );

    expect(result).to.equal('31.12.2005, Hans Dampf <...@...>:');
  });

  it('replaces multiple email addresses', () => {
    const result = fieldHelpers.replaceMailAddresses(
      'erna.meier@hihi.com and Hans Dampf <hans_dampf.@mymail.org>tester@system.url'
    );

    expect(result).to.equal('...@... and Hans Dampf <...@...>...@...');
  });
});

describe('Replace long numbers from text', () => {
  it('returns the input if it is null or undefined', () => {
    expect(fieldHelpers.replaceLongNumbers(null)).to.equal(null);
    expect(fieldHelpers.replaceLongNumbers(undefined)).to.equal(undefined);
  });

  it('does not replace text without digits', () => {
    expect(fieldHelpers.replaceLongNumbers('bla bli blu')).to.equal(
      'bla bli blu'
    );
  });

  it('does not replace text with single brackets, slashes, plus or minus signs', () => {
    expect(
      fieldHelpers.replaceLongNumbers('text - text + text (text) / text')
    ).to.equal('text - text + text (text) / text');
  });

  it('does not replace years', () => {
    expect(fieldHelpers.replaceLongNumbers(' 20.12.2011 ')).to.equal(
      ' 20.12.2011 '
    );
  });

  it('does not replace postal numbers', () => {
    expect(fieldHelpers.replaceLongNumbers(' 77123 Testhausen ')).to.equal(
      ' 77123 Testhausen '
    );
  });

  it('replaces six or more digits', () => {
    expect(fieldHelpers.replaceLongNumbers(' 123456 ')).to.equal(' ... ');
  });

  it('replaces phone number with parentheses', () => {
    expect(fieldHelpers.replaceLongNumbers(' (040) 334455 ')).to.equal(' ... ');
  });

  it('replaces phone number with parentheses and spaces', () => {
    expect(fieldHelpers.replaceLongNumbers('(040) 33 44 55')).to.equal('...');
  });

  it('replaces phone number with long pre-dial in parentheses and spaces', () => {
    expect(fieldHelpers.replaceLongNumbers('(0 40 35) 33 44 55')).to.equal(
      '...'
    );
  });

  it('replaces phone number with slash', () => {
    expect(fieldHelpers.replaceLongNumbers('040/334455')).to.equal('...');
  });

  it('replaces phone number with slash and spaces', () => {
    expect(fieldHelpers.replaceLongNumbers('040 / 33 44 55')).to.equal('...');
  });

  it('replaces phone number with dash', () => {
    expect(fieldHelpers.replaceLongNumbers('040-334455')).to.equal('...');
  });

  it('replaces phone number with dash and spaces', () => {
    expect(fieldHelpers.replaceLongNumbers('040 - 33 44 55')).to.equal('...');
  });

  it('replaces phone number with country code', () => {
    expect(fieldHelpers.replaceLongNumbers('+4940334455')).to.equal('...');
  });

  it('replaces phone number with country code and spaces', () => {
    expect(fieldHelpers.replaceLongNumbers('+49 40 33 44 55')).to.equal('...');
  });

  it('replaces phone number with country code and parentheses and spaces', () => {
    expect(fieldHelpers.replaceLongNumbers('+49 (40) 33 44 55')).to.equal(
      '...'
    );
  });

  it('replaces phone number with country code and funny zero and spaces', () => {
    expect(fieldHelpers.replaceLongNumbers('+49 (0) 40 33 44 55')).to.equal(
      '...'
    );
  });

  it('replaces phone number with dial-through', () => {
    expect(fieldHelpers.replaceLongNumbers('(040) 33 44 55 - 66')).to.equal(
      '...'
    );
  });
});

describe('killHtmlHead', () => {
  it('does not change text not containing a html head element', () => {
    expect(fieldHelpers.killHtmlHead(null)).to.equal(null);
    expect(fieldHelpers.killHtmlHead('')).to.equal('');
    expect(fieldHelpers.killHtmlHead('<html>bla</html>')).to.equal(
      '<html>bla</html>'
    );
  });

  it('strips HTML <head></head> completely from text', () => {
    expect(fieldHelpers.killHtmlHead('<head></head>')).to.equal('');
    expect(fieldHelpers.killHtmlHead('<head>bla</head>')).to.equal('');
    expect(fieldHelpers.killHtmlHead('123<head>bla</head>321')).to.equal(
      '123321'
    );
  });

  it('strips HTML <head></head> completely from text even when containing newlines', () => {
    expect(fieldHelpers.killHtmlHead('<head>bl\na</head>')).to.equal('');
    expect(fieldHelpers.killHtmlHead('123<head>\nbl\na</head>321')).to.equal(
      '123321'
    );
  });

  it('strips HTML <head></head> completely from text even when text very long', () => {
    expect(
      fieldHelpers.killHtmlHead(
        '123<head>\nbl\na</head>321 321 321 321 321 321 321 321 321 321 321 321 321 321 ' +
          '321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 '
      )
    ).to.equal(
      '123321 321 321 321 321 321 321 321 321 321 321 321 321 321 ' +
        '321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 321 '
    );
  });
});

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

describe('containsSlash', () => {
  it('detects a leading slash', () => {
    expect(fieldHelpers.containsSlash('/lo')).to.be(true);
  });

  it('detects an inline slash', () => {
    expect(fieldHelpers.containsSlash('hal/lo')).to.be(true);
  });

  it('detects a trailing slash', () => {
    expect(fieldHelpers.containsSlash('hal/')).to.be(true);
  });

  it('detects a double slash', () => {
    expect(fieldHelpers.containsSlash('hal//')).to.be(true);
  });

  it('detects no slash', () => {
    expect(fieldHelpers.containsSlash('hallo')).to.be(false);
  });
});
