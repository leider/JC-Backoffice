const { I } = inject();

export function createExampleKonzert(title: string) {
  I.createData("optionenstore", "optionen");
  I.createData("optionenstore", "orte");

  const replacer = new Map<string, string>();
  replacer.set("title", title);

  I.createDataWithReplacer("veranstaltungenstore", "Replacervorlage", replacer);
}

export function goToEditKonzert(konzertTitle: string) {
  waitForVeranstaltungenReady();
  I.waitForText(konzertTitle, 5);

  this.openKonzertCollapsable(konzertTitle);

  I.waitForElement(".bi-keyboard", 5);
  I.click(".bi-keyboard");
  I.waitForText("Allgemein", 5);
}

export function openKonzertCollapsable(konzertTitle: string) {
  I.waitForInvisible(".ant-modal-wrap", 5);
  // Ant Design Collapse no longer wraps label text in .ant-collapse-header-text.
  const header = locate(".ant-collapse-header").withText(konzertTitle);
  I.waitForElement(header, 5);
  I.scrollTo(header);
  I.click(header);
}

export function setConfirmed(konzertTitle: string) {
  this.goToEditKonzert(konzertTitle);

  setCheckboxByLabel("Ist bestätigt");

  I.click("Speichern");
  I.waitForText("Speichern erfolgreich");
}

export function deleteKonzert(konzertTitle: string) {
  I.deleteObjectInCollection("veranstaltungenstore", konzertTitle);
}

export function openRequiredPeople() {
  I.waitForElement(".bi-universal-access", 5);
  I.click(".bi-universal-access");
  I.waitForElement(
    locate(".ant-form-item").withDescendant(
      locate("b").withText("Kasse (Verantwortlich)"),
    ),
    5,
  );
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
  I.waitForElement(formItem, 5);
  const addButton = formItem.find(".bi-plus-circle-fill");
  I.waitForElement(addButton, 5);
  I.click(addButton);

  I.waitForText(userName, 5, formItem);
}

function setRequiredPeople(identifier: string) {
  setCheckboxByLabel(identifier);
}

function setCheckboxByLabel(identifier: string) {
  I.waitForText(identifier, 5);

  const formItem = locate(".ant-form-item").withDescendant(
    locate("label").withText(identifier),
  );
  I.scrollTo(formItem);
  I.click(formItem.find(".ant-checkbox"));
}

function waitForVeranstaltungenReady() {
  I.amOnPage("/vue/veranstaltungen");
  I.waitForInvisible(".ant-modal-wrap", 5);
}
