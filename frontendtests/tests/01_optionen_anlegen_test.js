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
  I.click(`(//button[@data-testid="orte_add"])`);
  I.click("#orte_0_name");
  I.fillField("#orte_0_name", "Jazzclub");
  I.fillField("#orte_0_flaeche", "300");
  I.fillField("#orte_0_pressename", "Jazzclub");
  I.fillField("#orte_0_presseIn", "Im Jazzclub");
  I.click("Speichern");
});
