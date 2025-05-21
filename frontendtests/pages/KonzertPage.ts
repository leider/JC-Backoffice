const { I } = inject();

export async function createExampleKonzert(title: string) {
  I.createData("optionenstore", "optionen");
  I.createData("optionenstore", "orte");

  I.createDataWithReplacer("veranstaltungenstore", "Replacervorlage", {
    title,
  });
}

export async function goToEditKonzert(konzertTitle: string) {
  I.amOnPage("/vue/veranstaltungen");
  I.waitForText(konzertTitle);

  I.click(locate("span.ant-collapse-header-text").withText(konzertTitle));

  I.click(".bi-keyboard");
  I.waitForText("Allgemein");
}
