Feature("Konzert kopieren");

Before(({ I, login }) => {
  login("admin");
  I.createData("optionenstore", "optionen");
  I.createData("optionenstore", "orte");
  I.createData("veranstaltungenstore", "Kopiervorlage");
});

Scenario("Kopiere Konzert", async ({ I }) => {
  I.amOnPage("/vue/konzert/copy-of-Kopiervorlage?page=allgemeines");
  I.click("Speichern");
  I.click("Veranstaltungen");
  I.see("Kopie von Kopiervorlage");
});
