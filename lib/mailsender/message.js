const pug = require('pug');
const path = require('path');
const conf = require('simple-configure');
const Renderer = conf.get('beans').get('renderer');

class Message {
  constructor(subjectWithText, optionalSenderName, optionalSenderAddress) {
    if (subjectWithText) {
      this.subject = subjectWithText.subject;
      this.markdown = subjectWithText.markdown;
      this.senderName = optionalSenderName ? optionalSenderName + ' via b-o.jazzclub.de' : conf.get('sender-name');
      this.senderAddress = optionalSenderAddress || conf.get('sender-address');
    }
    return this;
  }

  static formatEMailAddress(name, email) {
    return '"' + name + '" <' + email + '>';
  }

  setTo(toAddresses) {
    this.to = toAddresses;
  }

  toTransportObject() {

    const renderingOptions = {
      pretty: true,
      content: Renderer.render(this.markdown),
      plain: this.markdown
    };
    const filename = path.join(__dirname, 'views/mailtemplate.pug');
    const filenameTextonly = path.join(__dirname, 'views/mailtemplate-textonly.pug');

    return {
      from: Message.formatEMailAddress(this.senderName, this.senderAddress),
      to: this.senderAddress,
      bcc: this.to,
      subject: this.subject,
      text: pug.renderFile(filenameTextonly, renderingOptions),
      html: pug.renderFile(filename, renderingOptions)
    };
  }
}

module.exports = Message;
