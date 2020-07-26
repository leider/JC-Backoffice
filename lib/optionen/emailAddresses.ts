import range from "lodash/range";

export default class EmailAddresses {
  id = "emailaddresses";
  partner1?: string;
  partner2?: string;
  partner3?: string;
  partner4?: string;
  partner5?: string;
  partner6?: string;
  partner7?: string;
  partner8?: string;
  partner9?: string;
  partner10?: string;
  partner11?: string;
  partner12?: string;
  partner13?: string;
  partner14?: string;
  partner15?: string;
  partner16?: string;
  email1?: string;
  email2?: string;
  email3?: string;
  email4?: string;
  email5?: string;
  email6?: string;
  email7?: string;
  email8?: string;
  email9?: string;
  email10?: string;
  email11?: string;
  email12?: string;
  email13?: string;
  email14?: string;
  email15?: string;
  email16?: string;

  constructor(object?: any) {
    if (object) {
      return Object.assign(new EmailAddresses(), object);
    }
  }
  toJSON(): any {
    return Object.assign({}, this);
  }

  fillFromUI(object: any): EmailAddresses {
    return Object.assign(this, object);
  }

  noOfEmails(): number[] {
    return range(1, 16);
  }

  partnerForIndex(index: number): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this["partner" + index];
  }
  emailForIndex(index: number): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this["email" + index];
  }
}
