import empty from "../data/veranstaltungenstore/Empty.json";

Feature("Konzert anlegen");

Before(({ I, login }) => {
  login("admin");
  I.createData("optionenstore", "optionen");
  I.createData("optionenstore", "orte");
  const konzert = empty as any;
  konzert.kopf.titel = "Kopiervorlage";
  konzert.id = "Kopiervorlage";
  konzert.url = "Kopiervorlage";
  I.createObject("veranstaltungenstore", konzert);
});

Scenario("Erzeuge neues Konzert", async ({ I }) => {
  I.amOnPage("/vue/konzert/copy-of-Kopiervorlage?page=allgemeines");
  I.click("Speichern");
  I.click("Veranstaltungen");
  I.see("Kopie von Kopiervorlage");
});
