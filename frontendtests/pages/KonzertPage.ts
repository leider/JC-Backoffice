const { I } = inject();

export function createExampleKonzert(title: string): void {
  I.createData("optionenstore", "optionen");
  I.createData("optionenstore", "orte");

  I.amOnPage("/vue/konzert/new");
  I.wait(0.5);
  I.see("Typ");
  I.fillField('//input[@placeholder="Startdatum"]', "200320 18:30\t");
  I.click("OK");
  I.fillField('//input[@placeholder="Enddatum"]', "200320 20:00\t");
  I.click("OK");
  I.fillField("Titel", title);
  I.fillField("Typ", "Club Konzert\n");
  I.click("Speichern");
}
