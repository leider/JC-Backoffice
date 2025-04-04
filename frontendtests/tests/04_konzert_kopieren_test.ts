Feature("Konzert kopieren");

Before(({ I, login }) => {
  login("admin");
  I.createData("optionenstore", "optionen");
  I.createData("optionenstore", "orte");
  I.createData("veranstaltungenstore", "Kopiervorlage");
});

Scenario("Kopiere Konzert", async ({ I }) => {
  I.amOnPage("/konzert/copy-of-Kopiervorlage?page=allgemeines");
  I.wait(0.5);
  I.click("Weiter");
  I.fillField("Titel", "Kopiertes Konzert");
  I.click("Speichern");
  I.click("Veranstaltungen");
  I.wait(0.5);
  I.see("Kopiertes Konzert");
});
