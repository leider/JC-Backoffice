export default class Message {
  subject!: string;
  markdown!: string;
  senderNameField?: string;
  senderAddressField?: string;
  replyTo?: string;
  to!: string;
  bcc!: string;
  pdfBufferAndName?: { pdf: Buffer; name: string };
  attachments?: { filename: string; content: Buffer }[];

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  static fromJSON(json: any) {
    const message = new Message({ subject: json.subject, markdown: json.markdown });
    message.bcc = json.bcc;
    message.senderNameField = json.senderNameField;
    message.senderAddressField = json.senderAddressField;
    message.replyTo = json.replyTo;
    return message;
  }

  constructor(subjectWithText: { subject: string; markdown: string }, optionalSenderName?: string, optionalSenderAddress?: string) {
    if (subjectWithText) {
      this.subject = subjectWithText.subject;
      this.markdown = subjectWithText.markdown;
      this.senderNameField = optionalSenderName;
      this.replyTo = optionalSenderAddress;
    }
    return this;
  }

  senderName(confSenderName: string): string {
    return this.senderNameField ? `${this.senderNameField} via backoffice.jazzclub.de` : confSenderName;
  }

  senderAddress(confSenderAddress: string): string {
    return this.senderAddressField || confSenderAddress;
  }

  static formatEMailAddress(name: string, email: string): string {
    return `"${name}" <${email}>`;
  }

  setTo(toAddresses?: string | string[]): void {
    if (toAddresses === undefined) {
      return;
    }
    if (typeof toAddresses === "string") {
      this.to = toAddresses;
    } else {
      this.to = (toAddresses || []).join(",");
    }
  }

  setBcc(toAddresses: string | string[]): void {
    if (typeof toAddresses === "string") {
      this.bcc = toAddresses;
    } else {
      this.bcc = toAddresses.join(",");
    }
  }
}
