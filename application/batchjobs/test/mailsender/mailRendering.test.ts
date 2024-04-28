import { expect, describe, it } from "vitest";

import "../initWinstonForTest";
import "jc-backend/configure.js";
import conf from "jc-shared/commons/simpleConfigure.js";
conf.addProperties({
  "sender-name": "Der Sender",
  "sender-address": "sender@jazz.club",
});

import { toTransportObject } from "jc-backend/lib/mailsender/mailtransport.js";
import Message from "jc-shared/mail/message.js";

describe("Mailrendering works", () => {
  const message = new Message({
    subject: "[B-O Jazzclub] Mails sent",
    markdown: `Nightly Mails have been sent
Anzahl: 5
Error: "keiner"`,
  });

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
    const message = new Message({ subject: "", markdown: "" });
    const res = toTransportObject(message, false);
    expect(res.from).to.equal('"Der Sender" <sender@jazz.club>');
  });

  it("uses the given sender in Name, but not in Address", () => {
    const message = new Message({ subject: "", markdown: "" }, "Andreas von Jazzclub", "andreas@jazz.club");
    const res = toTransportObject(message, false);
    expect(res.from).to.equal('"Andreas von Jazzclub via backoffice.jazzclub.de" <sender@jazz.club>');
    expect(res.replyTo).to.equal("andreas@jazz.club");
  });
});
