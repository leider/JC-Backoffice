const { I } = inject();

const buttons = {
  addInTable: '(//button[@data-testid="add-in-table"])',
  speichern: "Speichern",
};

export async function goToGaestePage() {
  I.click(locate('div[role="tab"]').withText("Gäste am Abend"));

  I.waitForText("Gästeliste");
}

export async function addGaesteListe(guest: {
  name: string;
  comment: string;
  number: number;
  alreadyIn: number;
}) {
  I.click(buttons.addInTable);
  I.click('[data-testid="name0"]');
  I.fillField("#name", guest.name);
  I.pressKey("Tab");
  I.fillField("#comment", guest.comment);
  I.pressKey("Tab");
  I.fillField("#number", guest.number);

  I.click(buttons.speichern);
}

export async function setAlreadyIn(row: number, value: number) {
  I.click('[data-testid="alreadyIn' + row + '"]');
  I.fillField("#alreadyIn", value);

  I.pressKey("Tab");

  I.click(buttons.speichern);
}

export async function changeGuestName(row: number, value: string) {
  I.click('[data-testid="name' + row + '"]');
  I.fillField("#name", value);

  I.pressKey("Tab");

  I.click(buttons.speichern);
}

export async function copyGuest(row: number) {
  I.click('[data-row-key="row' + row + '"] .bi-files');

  I.click(buttons.speichern);
}

export async function deleteRow(row: number) {
  I.click('[data-row-key="row' + row + '"] .bi-trash');

  I.click(buttons.speichern);
}

export async function verifyGuestInStore(
  title: string,
  guest: {
    name: string;
    comment: string;
    number: number;
    alreadyIn: number;
  },
  index: number = 0,
) {
  const res = await I.loadObjectInCollection("veranstaltungenstore", title);

  I.assertDeepEqual(res.gaesteliste[index], {
    name: guest.name,
    comment: guest.comment,
    number: guest.number,
    alreadyIn: guest.alreadyIn,
    key: "row" + index,
  });
}

export async function verifyGuestStoreEmpty(konzertTitle: string) {
  const res = await I.loadObjectInCollection(
    "veranstaltungenstore",
    konzertTitle,
  );

  I.assertEmpty(res.gaesteliste);
}
