const { I } = inject();

const buttons = {
  addInTable: '[data-testid="add-in-table"]',
  speichern: "Speichern",
};

export async function addOrt(ort: {
  name: string;
  flaeche: number;
  pressename: string;
  presseIn: string;
}) {
  const existingRows = await I.grabNumberOfVisibleElements(
    'tr[data-row-key^="row"]',
  );
  if (existingRows < 1) {
    I.waitForElement(buttons.addInTable, 5);
    I.click(buttons.addInTable);
  } else {
    I.click('[data-row-key="row0"] td:first-child');
  }

  I.waitForElement("#orte_0_name", 5);
  I.fillField("#orte_0_name", ort.name);
  I.seeInField("#orte_0_name", ort.name);
  I.pressKey("Tab");
  I.fillField("#orte_0_flaeche", ort.flaeche.toString());
  I.seeInField("#orte_0_flaeche", ort.flaeche.toString());
  I.pressKey("Tab");
  I.fillField("#orte_0_pressename", ort.pressename);
  I.seeInField("#orte_0_pressename", ort.pressename);
  I.pressKey("Tab");
  I.fillField("#orte_0_presseIn", ort.presseIn);
  I.seeInField("#orte_0_presseIn", ort.presseIn);
  I.pressKey("Tab");

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
  const resOrte = await I.loadObjectInCollection("optionenstore", "orte");
  I.assertDeepEqual(resOrte.orte[rowNumber], {
    name: ort.name,
    flaeche: ort.flaeche,
    pressename: ort.pressename,
    presseIn: ort.presseIn,
  });
}

export async function copyOrt(newName: string) {
  I.click("button span .bi-files");

  I.waitForElement("#orte_1_name", 5);
  I.fillField("#orte_1_name", newName);

  I.pressKey("Tab");
  I.click(buttons.speichern);
}

export async function deleteOrt(number: number) {
  I.click(locate(".bi-trash").at(number + 1));

  I.click(buttons.speichern);
}

export async function verifyOrtSizeInStore(expectedLength: number) {
  const resOrte = await I.loadObjectInCollection("optionenstore", "orte");

  I.assertEqual(resOrte.orte.length, expectedLength);
}
