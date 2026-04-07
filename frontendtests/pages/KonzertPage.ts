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

  this.openKonzertCollapsable(konzertTitle);

  I.click(".bi-keyboard");
  I.waitForText("Allgemein");
}

export function openKonzertCollapsable(konzertTitle: string) {
  I.waitForInvisible(".ant-modal-wrap", 5);
  // Ant Design Collapse no longer wraps label text in .ant-collapse-header-text.
  I.click(locate(".ant-collapse-header").withText(konzertTitle));
}

export function setConfirmed(konzertTitle: string) {
  this.goToEditKonzert(konzertTitle);

  I.click("Ist bestätigt");

  I.click("Speichern");
  I.waitForText("Speichern erfolgreich");
}

export function deleteKonzert(konzertTitle: string) {
  I.deleteObjectInCollection("veranstaltungenstore", konzertTitle);
}

export function openRequiredPeople() {
  I.click(".bi-universal-access");
}

export function addRequiredKassePeople(konzertTitle: string) {
  // Open full edit mode first; preview mode has no save button.
  this.goToEditKonzert(konzertTitle);

  setRequiredPeople("Kasse (Verantwortlich)");
  setRequiredPeople("Kasse (Unterstützung)");

  I.click("Speichern");
  I.waitForText("Speichern erfolgreich");
}

export function assignCurrentUserToRole(
  konzertTitle: string,
  role: string,
  userName: string,
) {
  this.openKonzertCollapsable(konzertTitle);

  const formItem = locate(".ant-list-item").withDescendant(
    locate(".ant-list-item-meta-title").withText(role),
  );
  I.click(formItem.find(".bi-plus-circle-fill"));

  I.waitForText(userName, 1, formItem);
}

function setRequiredPeople(identifier: string) {
  I.waitForText(identifier);

  const formItem = locate(".ant-form-item").withDescendant(
    locate("label").withText(identifier),
  );
  I.click(formItem.find(".ant-checkbox"));
}
