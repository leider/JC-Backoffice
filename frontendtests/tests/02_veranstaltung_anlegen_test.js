const { expect } = require("chai");

Feature("Veranstaltung anlegen");

Before(({ I, login }) => {
  login("admin");
  I.createData("optionenstore", "optionen");
  I.createData("optionenstore", "orte");
});

Scenario("Erzeuge neue Veranstaltung", async ({ I }) => {
  I.amOnPage("/vue/veranstaltung/new?page=allgemeines");
  I.see("Typ");
  I.click('//input[@placeholder="Startdatum"]');
  I.fillField('//input[@placeholder="Startdatum"]', "200320 18:30\n");
  I.fillField('//input[@placeholder="Enddatum"]', "200320 20:00\n");
  I.fillField("Titel", "Konzert #1");
  I.fillField("Typ", "Club Konzert\n");
  I.click("Speichern");
  I.wait(0.5);

  const res = await I.loadObjectInCollection("veranstaltungenstore", "Konzert #1 am 20. März 2020");
  expect(res.kopf).eql({
    abgesagt: false,
    beschreibung: "",
    confirmed: false,
    eventTyp: "Club Konzert",
    flaeche: 100,
    fotografBestellen: false,
    genre: "",
    kannAufHomePage: false,
    kannInSocialMedia: false,
    kooperation: "",
    ort: "Jazzclub",
    presseIn: "im Jazzclub Karlsruhe",
    pressename: "Jazzclub Karlsruhe",
    rechnungAnKooperation: false,
    titel: "Konzert #1",
  });
  expect(res.startDate).eql("2020-03-20T17:30:00.000Z");
  expect(res.endDate).eql("2020-03-20T19:00:00.000Z");
});
