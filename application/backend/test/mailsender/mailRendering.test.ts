import { describe, expect, it } from "vitest";

import "jc-backend/configure.js";
import conf from "jc-shared/commons/simpleConfigure.js";
import { toTransportObject } from "jc-backend/lib/mailsender/mailtransport.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import User from "jc-shared/user/user.js";

conf.addProperties({
  "sender-name": "Der Sender",
  "sender-address": "sender@jazz.club",
});

describe("Mailrendering works", () => {
  const message = new MailMessage({
    subject: "[B-O Jazzclub] Mails sent",
  });
  message.body = `Nightly Mails have been sent
Anzahl: 5
Error: "keiner"`;

  it("renders html and text", () => {
    const res = toTransportObject(message, false);
    expect(res.html).to.equal(`<!DOCTYPE html>
<html>
  <body><p>Nightly Mails have been sent<br>Anzahl: 5<br>Error: &quot;keiner&quot;</p>
</body>
</html>`);
    expect(res.text).to.equal(`Nightly Mails have been sent
Anzahl: 5
Error: "keiner"`);
  });

  it("uses the predefined sender", () => {
    const message = new MailMessage({ subject: "" });
    const res = toTransportObject(message, false);
    expect(res.from).to.eql({
      name: "Der Sender",
      address: "sender@jazz.club",
    });
  });

  it("uses the given sender in Name, but not in Address", () => {
    const message = MailMessage.forJsonAndUser(
      { subject: "", body: "", bcc: [] },
      new User({ name: "Andreas von Jazzclub", email: "andreas@jazz.club" }),
    );
    const res = toTransportObject(message, false);
    expect(res.from).to.eql({
      address: "sender@jazz.club",
      name: "Andreas von Jazzclub via backoffice.jazzclub.de",
    });
    expect(res.replyTo).to.eql({
      address: "andreas@jazz.club",
      name: "Andreas von Jazzclub",
    });
  });
});
