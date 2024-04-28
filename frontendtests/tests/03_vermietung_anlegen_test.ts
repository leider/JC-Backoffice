Feature("Vermietung anlegen");

Before(({ I, login }) => {
  login("admin");
  I.createData("optionenstore", "optionen");
  I.createData("optionenstore", "orte");
});

Scenario("Erzeuge neue Vermietung", async ({ I }) => {
  I.amOnPage("/vue/vermietung/new");
  I.fillField("Saalmiete", "100");
  I.fillField('//input[@placeholder="Startdatum"]', "200320 18:30\t");
  I.fillField('//input[@placeholder="Enddatum"]', "200320 20:00\t");
  I.click("OK");
  I.fillField("Titel", "Vermietung #1");
  I.click("Speichern");

  const res = await I.loadObjectInCollection(
    "vermietungenstore",
    "Vermietung #1 am 20. März 2020",
  );
  I.assertDeepEqual(res.kopf, {
    abgesagt: false,
    beschreibung: "",
    confirmed: false,
    eventTyp: "",
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
    titel: "Vermietung #1",
  });
  I.assertEqual(res.startDate, "2020-03-20T17:30:00.000Z");
  I.assertEqual(res.endDate, "2020-03-20T19:00:00.000Z");

  I.amOnPage("/vue/veranstaltungen");
  I.wait(0.5);
  I.see("Vermietung #1");
});
