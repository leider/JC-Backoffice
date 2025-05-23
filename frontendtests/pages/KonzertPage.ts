const { I } = inject();

export function createExampleKonzert(title: string) {
  I.createData("optionenstore", "optionen");
  I.createData("optionenstore", "orte");

  const replacer = new Map<string, string>();
  replacer.set("title", title);

  I.createDataWithReplacer("veranstaltungenstore", "Replacervorlage", replacer);
}

export function goToEditKonzert(konzertTitle: string) {
  I.amOnPage("/vue/veranstaltungen");
  I.waitForText(konzertTitle);

  I.click(locate("span.ant-collapse-header-text").withText(konzertTitle));

  I.click(".bi-keyboard");
  I.waitForText("Allgemein");
}

export function deleteKonzert(konzertTitle: string) {
  I.deleteObjectInCollection("veranstaltungenstore", konzertTitle);
}
