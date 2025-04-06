Feature("Optionen anlegen");

Before(({ login }) => {
  login("admin");
});

Scenario("Erzeuge Typen und Orte", ({ I }) => {
  I.deleteObjectInCollection("optionenstore", "instance");
  I.deleteObjectInCollection("optionenstore", "orte");
  I.amOnPage("/vue/optionen");
  I.fillField("Kooperationen", "UI Test\n");
  I.click("Speichern");

  I.amOnPage("/vue/orte");
  I.click(`(//button[@data-testid="add-in-table"])`);
  I.click('div[data-testid="name0"]');
  I.fillField("#name", "Jazzclub");
  I.pressKey("Tab");
  I.fillField("#flaeche", "300");
  I.pressKey("Tab");
  I.fillField("#pressename", "Jazzclub");
  I.pressKey("Tab");
  I.fillField("#presseIn", "Im Jazzclub");
  I.pressKey("Enter");
  I.click("Speichern");
});
