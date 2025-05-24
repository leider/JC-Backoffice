const { I } = inject();

const guestTabIdentifier = "Gästeliste";
const reservationTabIdentifier = "Reservierungen";

const buttons = {
  speichern: "Speichern",
  addInTable: locate("button").withAttr({ "data-testid": "add-in-table" }),
};

async function executeActionInTab(tabIdentifier: string, action: () => void) {
  await within(locate(".ant-collapse-item").withText(tabIdentifier), action);
}

export function goToGaestePage() {
  I.click(locate('div[role="tab"]').withText("Gäste am Abend"));

  I.waitForText(guestTabIdentifier);
}

export async function addGaesteListe(guest: {
  name: string;
  comment: string;
  number: number;
  alreadyIn: number;
}) {
  await executeActionInTab(guestTabIdentifier, () => {
    I.click(buttons.addInTable);
  });

  fillGuestDataInRow(guest);
}

export async function addReservation(guest: {
  name: string;
  comment: string;
  number: number;
  alreadyIn: number;
}) {
  await executeActionInTab(reservationTabIdentifier, () => {
    I.click(buttons.addInTable);
  });

  fillGuestDataInRow(guest);
}

function fillGuestDataInRow(guest: {
  name: string;
  comment: string;
  number: number;
  alreadyIn: number;
}) {
  I.click('[data-testid="name0"]');
  I.fillField("#name", guest.name);
  I.pressKey("Tab");
  I.fillField("#comment", guest.comment);
  I.pressKey("Tab");
  I.fillField("#number", guest.number);

  I.click(buttons.speichern);
}

export async function setGuestAlreadyIn(row: number, value: number) {
  await executeActionInTab(guestTabIdentifier, () => {
    I.click('[data-testid="alreadyIn' + row + '"]');
  });

  I.fillField("#alreadyIn", value);
  I.pressKey("Tab");

  I.click(buttons.speichern);
}

export async function setReservationAlreadyIn(row: number, value: number) {
  await executeActionInTab(reservationTabIdentifier, () => {
    I.click('[data-testid="alreadyIn' + row + '"]');
  });

  I.fillField("#alreadyIn", value);
  I.pressKey("Tab");

  I.click(buttons.speichern);
}

export async function changeGuestName(row: number, value: string) {
  await executeActionInTab(guestTabIdentifier, () => {
    I.click('[data-testid="name' + row + '"]');
  });

  changeName(value);
}

export async function changeReservationName(row: number, value: string) {
  await executeActionInTab(reservationTabIdentifier, () => {
    I.click('[data-testid="name' + row + '"]');
  });

  changeName(value);
}

function changeName(value: string) {
  I.fillField("#name", value);

  I.pressKey("Tab");

  I.click(buttons.speichern);
}

export async function copyGuest(row: number) {
  await executeActionInTab(guestTabIdentifier, () => {
    I.click('[data-row-key="row' + row + '"] .bi-files');
  });

  I.click(buttons.speichern);
}

export async function copyReservation(row: number) {
  await executeActionInTab(reservationTabIdentifier, () => {
    I.click('[data-row-key="row' + row + '"] .bi-files');
  });

  I.click(buttons.speichern);
}

export async function deleteGuestRow(row: number) {
  await executeActionInTab(guestTabIdentifier, () => {
    I.click('[data-row-key="row' + row + '"] .bi-trash');
  });

  I.click(buttons.speichern);
}

export async function deleteReservationRow(row: number) {
  await executeActionInTab(reservationTabIdentifier, () => {
    I.click('[data-row-key="row' + row + '"] .bi-trash');
  });

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
  const res = await loadKonzertStoreData(title);

  I.assertDeepEqual(res.gaesteliste[index], {
    name: guest.name,
    comment: guest.comment,
    number: guest.number,
    alreadyIn: guest.alreadyIn,
    key: "row" + index,
  });
}

export async function verifyReservationInStore(
  title: string,
  guest: {
    name: string;
    comment: string;
    number: number;
    alreadyIn: number;
  },
  index: number = 0,
) {
  const res = await loadKonzertStoreData(title);

  I.assertDeepEqual(res.reservierungen[index], {
    name: guest.name,
    comment: guest.comment,
    number: guest.number,
    alreadyIn: guest.alreadyIn,
    key: "row" + index,
  });
}

export async function verifyGuestStoreEmpty(konzertTitle: string) {
  const res = await loadKonzertStoreData(konzertTitle);

  I.assertEmpty(res.gaesteliste);
}

export async function verifyReservationStoreEmpty(konzertTitle: string) {
  const res = await loadKonzertStoreData(konzertTitle);

  I.assertEmpty(res.reservierungen);
}

async function loadKonzertStoreData(konzertTitle: string) {
  return await I.loadObjectInCollection("veranstaltungenstore", konzertTitle);
}
