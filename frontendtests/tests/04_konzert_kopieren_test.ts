Feature("Konzert kopieren");

Before(async ({ I, login }) => {
  await login("admin");
  I.createData("optionenstore", "optionen");
  I.createData("optionenstore", "orte");
  I.createData("veranstaltungenstore", "Kopiervorlage");
});

Scenario("Kopiere Konzert", async ({ I }) => {
  I.amOnPage("/vue/konzert/copy-of-Kopiervorlage?page=allgemeines");
  I.waitForText("Titel");
  I.waitForText("Weiter");
  I.click("Weiter");
  I.fillField("Titel", "Kopiertes Konzert");
  I.click("Speichern");
  I.amOnPage("/vue/veranstaltungen");
  I.waitForText("Kopiertes Konzert", 5);
});
