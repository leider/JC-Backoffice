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
  I.waitForElement('[id$="-tab-gaeste"]', 5);
  I.click('[id$="-tab-gaeste"]');
  I.waitForText(guestTabIdentifier, 5);
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

  fillGuestDataInRow(guest, "gaesteliste");
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

  fillGuestDataInRow(guest, "reservierungen");
}

function fillGuestDataInRow(
  guest: {
    name: string;
    comment: string;
    number: number;
    alreadyIn: number;
  },
  path: "gaesteliste" | "reservierungen",
) {
  I.waitForElement(`#${path}_0_name`, 5);
  I.fillField(`#${path}_0_name`, guest.name);
  I.seeInField(`#${path}_0_name`, guest.name);
  I.pressKey("Tab");
  I.fillField(`#${path}_0_comment`, guest.comment);
  I.seeInField(`#${path}_0_comment`, guest.comment);
  I.pressKey("Tab");
  I.fillField(`#${path}_0_number`, guest.number.toString());
  I.seeInField(`#${path}_0_number`, guest.number.toString());

  I.click(buttons.speichern);
}

export async function setGuestAlreadyIn(row: number, value: number) {
  I.fillField(`#gaesteliste_${row}_alreadyIn`, value.toString());
  I.pressKey("Tab");

  I.click(buttons.speichern);
}

export async function setReservationAlreadyIn(row: number, value: number) {
  I.fillField(`#reservierungen_${row}_alreadyIn`, value.toString());
  I.pressKey("Tab");

  I.click(buttons.speichern);
}

export async function changeGuestName(row: number, value: string) {
  changeName(value, `#gaesteliste_${row}_name`);
}

export async function changeReservationName(row: number, value: string) {
  changeName(value, `#reservierungen_${row}_name`);
}

function changeName(value: string, fieldId: string) {
  I.fillField(fieldId, value);

  I.pressKey("Tab");

  I.click(buttons.speichern);
}

export async function copyGuest(row: number) {
  await executeActionInTab(guestTabIdentifier, () => {
    I.click(locate(".bi-files").at(row + 1));
  });

  I.click(buttons.speichern);
}

export async function copyReservation(row: number) {
  await executeActionInTab(reservationTabIdentifier, () => {
    I.click(locate(".bi-files").at(row + 1));
  });

  I.click(buttons.speichern);
}

export async function deleteGuestRow(row: number) {
  await executeActionInTab(guestTabIdentifier, () => {
    I.click(locate(".bi-trash").at(row + 1));
  });

  I.click(buttons.speichern);
}

export async function deleteReservationRow(row: number) {
  await executeActionInTab(reservationTabIdentifier, () => {
    I.click(locate(".bi-trash").at(row + 1));
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
