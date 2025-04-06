Feature("Konzert anlegen");

Before(({ I, login }) => {
  login("admin");
  I.createData("optionenstore", "optionen");
  I.createData("optionenstore", "orte");
});

Scenario("Erzeuge neues Konzert", async ({ I }) => {
  I.amOnPage("/vue/konzert/new");
  I.wait(0.5);
  I.see("Typ");
  I.fillField('//input[@placeholder="Startdatum"]', "200320 18:30\t");
  I.click("OK");
  I.fillField('//input[@placeholder="Enddatum"]', "200320 20:00\t");
  I.click("OK");
  I.fillField("Titel", "Konzert #1");
  I.fillField("Typ", "Club Konzert\n");
  I.click("Speichern");

  const res = await I.loadObjectInCollection(
    "veranstaltungenstore",
    "Konzert #1 am 20. März 2020",
  );
  I.assertDeepEqual(res.kopf, {
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
  I.assertDeepEqual(res.startDate, "2020-03-20T17:30:00.000Z");
  I.assertDeepEqual(res.endDate, "2020-03-20T19:00:00.000Z");

  I.amOnPage("/vue/veranstaltungen");
  I.wait(0.5);
  I.see("Konzert #1");
});
