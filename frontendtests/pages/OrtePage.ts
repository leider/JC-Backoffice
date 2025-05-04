const { I } = inject();

const buttons = {
  addInTable: '(//button[@data-testid="add-in-table"])',
  speichern: "Speichern",
};

const tableCells = (column: string, index = 0): string =>
  `[data-testid="${column}${index}"]`;

export function addOrt(ort: {
  name: string;
  flaeche: number;
  pressename: string;
  presseIn: string;
}): void {
  I.click(buttons.addInTable);
  I.click('[data-testid="name0"]');
  I.fillField("#name", ort.name);
  I.pressKey("Tab");
  I.fillField("#flaeche", ort.flaeche.toString());
  I.pressKey("Tab");
  I.fillField("#pressename", ort.pressename);
  I.pressKey("Tab");
  I.fillField("#presseIn", ort.presseIn);
  I.pressKey("Enter");

  I.click(buttons.speichern);
}

export async function verifyOrtInStore(
  index: number,
  ort: {
    name: string;
    flaeche: number;
    pressename: string;
    presseIn: string;
  },
): Promise<void> {
  const resOrte = await I.loadObjectInCollection("optionenstore", "orte");
  I.assertDeepEqual(resOrte.orte[index], {
    name: ort.name,
    flaeche: ort.flaeche,
    key: "row" + index,
    pressename: ort.pressename,
    presseIn: ort.presseIn,
  });
}

export function verifyOrtInTable(
  rowNumber: number,
  ort: {
    name: string;
    flaeche: number;
    pressename: string;
    presseIn: string;
  },
): void {
  I.see(ort.name, tableCells("name", rowNumber));
  I.see(ort.flaeche.toString(), tableCells("flaeche", rowNumber));
  I.see(ort.pressename, tableCells("pressename", rowNumber));
  I.see(ort.presseIn, tableCells("presseIn", rowNumber));
}

export function copyOrt(newName: string) {
  I.click("button span .bi-files");

  I.click('[data-row-key="row1"] td:first-child');
  I.fillField("#name", newName);

  I.pressKey("Tab");
  I.click(buttons.speichern);
}

export function deleteOrt(number: number) {
  I.click('[data-row-key="row' + number + '"] button span .bi-trash');

  I.click(buttons.speichern);
}

export async function verifyOrtSizeInStore(expectedLength: number) {
  const resOrte = await I.loadObjectInCollection("optionenstore", "orte");

  I.assertEqual(resOrte.orte.length, expectedLength);
}
