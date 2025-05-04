const { OrtePage } = require("./pages/OrtePage");

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

Scenario("Orte erzeugen, ändern und löschen", async ({ I }) => {
  const ortePage = new OrtePage();

  const expectedName = "Jazzclub";
  const expectedFlaeche = 300;
  const expectedPresseName = "JazzclubPresseName";
  const expectedPresseIn = "Im Jazzclub";

  let expectedOrt = {
    name: expectedName,
    flaeche: expectedFlaeche,
    pressename: expectedPresseName,
    presseIn: expectedPresseIn,
  };

  I.amOnPage("/vue/orte");

  ortePage.addOrt(expectedOrt);

  await ortePage.verifyOrtInStore(0, expectedOrt);
  ortePage.verifyOrtInTable(0, expectedOrt);

  let expectedSecondOrtName = "Tollhaus";
  ortePage.copyOrt(expectedSecondOrtName);

  const expectedOrt2 = {
    ...expectedOrt,
    name: expectedSecondOrtName,
  };
  ortePage.verifyOrtInTable(1, expectedOrt2);
  await ortePage.verifyOrtInStore(1, expectedOrt2);

  ortePage.deleteOrt(1);
  await ortePage.verifyOrtInStore(0, expectedOrt);
  await ortePage.verifyOrtSizeInStore(1);
});
