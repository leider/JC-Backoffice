import { OrtePage } from "../pages/OrtePage";

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

Scenario("Orte erzeugen und ändern", async ({ I }) => {
  const page = new OrtePage();

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

  page.addOrt(expectedOrt);

  await page.verifyOrtInStore(expectedOrt);
  page.verifyOrtInTable(expectedOrt);
});
