import pug from 'pug';
import path from 'path';
import Renderer from '../commons/renderer';

import conf from '../commons/simpleConfigure';

export default class Message {
  private subject!: string;
  private markdown!: string;
  private senderName!: string;
  private senderAddress!: string;
  private to!: string;
  private bcc!: string;

  constructor(
    subjectWithText: { subject: string; markdown: string },
    optionalSenderName?: string,
    optionalSenderAddress?: string
  ) {
    if (subjectWithText) {
      this.subject = subjectWithText.subject;
      this.markdown = subjectWithText.markdown;
      this.senderName = optionalSenderName
        ? optionalSenderName + ' via backoffice.jazzclub.de'
        : conf.get('sender-name');
      this.senderAddress = optionalSenderAddress || conf.get('sender-address');
    }
    return this;
  }

  static formatEMailAddress(name: string, email: string) {
    return `"${name}" <${email}>`;
  }

  setTo(toAddresses?: string | string[]) {
    if (typeof toAddresses === 'string') {
      this.to = toAddresses;
    } else {
      this.to = (toAddresses || []).join(',');
    }
  }

  setBcc(toAddresses: string | string[]) {
    if (typeof toAddresses === 'string') {
      this.bcc = toAddresses;
    } else {
      this.bcc = toAddresses.join(',');
    }
  }

  toTransportObject() {
    const renderingOptions = {
      pretty: true,
      content: Renderer.render(this.markdown),
      plain: this.markdown
    };
    const filename = path.join(__dirname, 'views/mailtemplate.pug');
    const filenameTextonly = path.join(
      __dirname,
      'views/mailtemplate-textonly.pug'
    );

    return {
      from: Message.formatEMailAddress(this.senderName, this.senderAddress),
      to: this.to || this.senderAddress,
      bcc: this.bcc || this.senderAddress,
      subject: this.subject,
      text: pug.renderFile(filenameTextonly, renderingOptions),
      html: pug.renderFile(filename, renderingOptions)
    };
  }
}
