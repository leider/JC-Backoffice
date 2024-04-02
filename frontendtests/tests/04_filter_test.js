const { expect } = require("chai");
const fs = require("fs");

function konzertHaving(object, name) {
  const empty = JSON.parse(fs.readFileSync(`${__dirname}/../data/veranstaltungenstore/Empty.json`, "utf8"));
  const { kopf, technik, presse, directAtts } = object;
  Object.assign(empty.kopf, kopf, {
    titel: name,
  });
  Object.assign(empty.technik, technik);
  Object.assign(empty.presse, presse);
  return Object.assign(empty, directAtts, {
    id: name,
    url: name,
  });
}

function setCheck(I, name, jaNein) {
  I.click("Filter...");
  I.click(locate("button").withText("Zurücksetzen").inside(".ant-space-item"));
  I.click(name);
  if (!jaNein) {
    I.click(name);
  }
  I.click("Anwenden");
}

function setAndCheck(I, name, title) {
  I.click("Veranstaltungen");
  I.see("Neutral");
  I.see(title);

  setCheck(I, name, true);
  I.see(title);
  I.dontSee("Neutral");

  setCheck(I, name, false);
  I.dontSee(title);
  I.see("Neutral");
}

Feature("Filter in der Übersicht funktioniert für");

BeforeSuite(({ I }) => {
  I.createObject("veranstaltungenstore", konzertHaving({}, "Neutral"));
  I.createObject("veranstaltungenstore", konzertHaving({ kopf: { confirmed: true } }, "Bestätigt"));
  I.createObject("veranstaltungenstore", konzertHaving({ kopf: { abgesagt: true } }, "Cancelled"));
  I.createObject("veranstaltungenstore", konzertHaving({ presse: { checked: true } }, "PresseOK"));
  I.createObject("veranstaltungenstore", konzertHaving({ kopf: { kannAufHomePage: true } }, "KannAufHomepage"));
  I.createObject("veranstaltungenstore", konzertHaving({ kopf: { kannInSocialMedia: true } }, "KannAufSocialMedia"));
  I.createObject("veranstaltungenstore", konzertHaving({ presse: { text: "Text" } }, "TextVorhanden"));
  I.createObject("veranstaltungenstore", konzertHaving({ presse: { originalText: "Original Text" } }, "OriginaltextVorhanden"));
  I.createObject("veranstaltungenstore", konzertHaving({ kopf: { fotografBestellen: true } }, "FotografEinladen"));
  I.createObject("veranstaltungenstore", konzertHaving({ technik: { checked: true } }, "TechnikChecked"));
  I.createObject("veranstaltungenstore", konzertHaving({ technik: { fluegel: true } }, "Fluegel"));
});

Before(({ I, login }) => {
  login("admin");
});

Scenario("Allgemein 'bestätigt'", async ({ I }) => {
  setAndCheck(I, "Ist bestätigt", "Bestätigt");
});

Scenario("Allgemein 'abgesagt'", async ({ I }) => {
  setAndCheck(I, "Ist abgesagt", "Cancelled");
});

Scenario("Öffentlichkeit 'Presse OK'", async ({ I }) => {
  setAndCheck(I, "Presse OK", "PresseOK");
});

Scenario("Öffentlichkeit 'Kann Homepage'", async ({ I }) => {
  setAndCheck(I, "Kann Homepage", "KannAufHomepage");
});

Scenario("Öffentlichkeit 'Kann Social Media'", async ({ I }) => {
  setAndCheck(I, "Kann Social Media", "KannAufSocialMedia");
});

Scenario("Öffentlichkeit 'Text vorhanden'", async ({ I }) => {
  setAndCheck(I, "Text vorhanden", "TextVorhanden");
});

Scenario("Öffentlichkeit 'Originaltext vorhanden'", async ({ I }) => {
  setAndCheck(I, "Originaltext vorhanden", "OriginaltextVorhanden");
});

Scenario("Öffentlichkeit 'Fotograf einladen'", async ({ I }) => {
  setAndCheck(I, "Fotograf einladen", "FotografEinladen");
});

Scenario("Technik 'Technik ist geklärt'", async ({ I }) => {
  setAndCheck(I, "Technik ist geklärt", "TechnikChecked");
});

Scenario("Technik 'Flügel stimmen'", async ({ I }) => {
  setAndCheck(I, "Flügel stimmen", "Fluegel");
});
