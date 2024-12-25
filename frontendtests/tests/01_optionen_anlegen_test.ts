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
});
