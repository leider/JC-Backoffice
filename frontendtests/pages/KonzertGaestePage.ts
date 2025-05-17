const { I } = inject();

const buttons = {
  addInTable: '(//button[@data-testid="add-in-table"])',
  speichern: "Speichern",
};

export function goToGaestePage(dateString: string, konzertTitle: string) {
  I.amOnPage(
    "/vue/konzert/" + dateString + "-" + konzertTitle + "?page=gaeste",
  );
}

export function addGaesteListe(guest: {
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

// export async function verifyGuestInStore(
//   title: string,
//   guest: {
//     name: string;
//     comment: string;
//     number: number;
//     alreadyIn: number;
//   },
// ): Promise<void> {
//   const res = await I.loadObjectInCollection(
//     "veranstaltungenstore",
//     title + " am 20. März 2020",
//   );
//
//   I.assertDeepEqual(res.gaesteliste, [
//     {
//       name: guest.name,
//       comment: guest.comment,
//       number: guest.number,
//       alreadyIn: guest.alreadyIn,
//     },
//   ]);
// }
