import { expect } from "chai";

import "../../backend/configure";
import conf from "../../backend/lib/commons/simpleConfigure";
conf.addProperties({
  "sender-name": "Der Sender",
  "sender-address": "sender@jazz.club",
});

import { toTransportObject } from "../../backend/lib/mailsender/mailtransport";
import Message from "jc-shared/mail/message";

describe("Mailrendering works", () => {
  const message = new Message({
    subject: "[B-O Jazzclub] Mails sent",
    markdown: `Nightly Mails have been sent
Anzahl: 5
Error: "keiner"`,
  });

  it("renders html and text", () => {
    const res = toTransportObject(message);
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
    const res = toTransportObject(message);
    expect(res.from).to.equal('"Der Sender" <sender@jazz.club>');
  });

  it("uses the given sender", () => {
    const message = new Message({ subject: "", markdown: "" }, "Andreas von Jazzclub", "andreas@jazz.club");
    const res = toTransportObject(message);
    expect(res.from).to.equal('"Andreas von Jazzclub via backoffice.jazzclub.de" <andreas@jazz.club>');
  });
});
