const { I } = inject();

const buttons = {
  addInTable: '[data-testid="add-in-table"]',
  speichern: "Speichern",
};

const tableCells = (column: string, index = 0): string =>
  `[data-testid="${column}${index}"]`;

export async function addOrt(ort: {
  name: string;
  flaeche: number;
  pressename: string;
  presseIn: string;
}) {
  I.waitForElement(buttons.addInTable, 5);
  I.click(buttons.addInTable);

  // EditableTable now uses inline fields with generated ids like "orte_0_name".
  I.waitForElement('input[id$="_name"]', 5);
  I.fillField(locate('input[id$="_name"]').first(), ort.name);
  I.fillField('input[id$="_flaeche"]', ort.flaeche.toString());
  I.fillField('input[id$="_pressename"]', ort.pressename);
  I.fillField('input[id$="_presseIn"]', ort.presseIn);
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

export async function verifyOrtInTable(
  rowNumber: number,
  ort: {
    name: string;
    flaeche: number;
    pressename: string;
    presseIn: string;
  },
) {
  I.see(ort.name, tableCells("name", rowNumber));
  I.see(ort.flaeche.toString(), tableCells("flaeche", rowNumber));
  I.see(ort.pressename, tableCells("pressename", rowNumber));
  I.see(ort.presseIn, tableCells("presseIn", rowNumber));
}

export async function copyOrt(newName: string) {
  I.click("button span .bi-files");

  I.click('[data-row-key="row1"] td:first-child');
  I.fillField("#name", newName);

  I.pressKey("Tab");
  I.click(buttons.speichern);
}

export async function deleteOrt(number: number) {
  I.click('[data-row-key="row' + number + '"] button span .bi-trash');

  I.click(buttons.speichern);
}

export async function verifyOrtSizeInStore(expectedLength: number) {
  const resOrte = await I.loadObjectInCollection("optionenstore", "orte");

  I.assertEqual(resOrte.orte.length, expectedLength);
}
