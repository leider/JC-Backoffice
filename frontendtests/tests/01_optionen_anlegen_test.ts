Feature("Optionen anlegen");

Before(({ I, login }) => {
  login("admin");

  I.deleteObjectInCollection("optionenstore", "instance");
  I.deleteObjectInCollection("optionenstore", "orte");
});

Scenario("Erzeuge Optionen", async ({ I }) => {
  I.amOnPage("/vue/optionen");
  I.fillField("Kooperationen", "UI Test\n");
  I.click("Speichern");

  const resOptionStore = await I.loadObjectInCollection(
    "optionenstore",
    "instance",
  );
  I.assertDeepEqual(resOptionStore.kooperationen, ["UI Test"]);
});

Scenario("Orte erzeugen, ändern und löschen", async ({ I, ortePage }) => {
  const expectedName = "Jazzclub";
  const expectedFlaeche = 300;
  const expectedPresseName = "JazzclubPresseName";
  const expectedPresseIn = "Im Jazzclub";

  const expectedOrt = {
    name: expectedName,
    flaeche: expectedFlaeche,
    pressename: expectedPresseName,
    presseIn: expectedPresseIn,
  };

  I.amOnPage("/vue/orte");
  I.waitForText("Orte", 2);

  ortePage.addOrt(expectedOrt);
  ortePage.verifyOrtInTable(0, expectedOrt);

  const expectedSecondOrtName = "Tollhaus";
  ortePage.copyOrt(expectedSecondOrtName);
  const expectedOrt2 = {
    ...expectedOrt,
    name: expectedSecondOrtName,
  };
  ortePage.verifyOrtInTable(1, expectedOrt2);
  ortePage.verifyOrtSizeInStore(2);

  ortePage.deleteOrt(1);
  ortePage.verifyOrtInStore(0, expectedOrt);
  ortePage.verifyOrtSizeInStore(1);
});
