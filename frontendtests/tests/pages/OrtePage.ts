export class OrtePage {
  private I = inject().I;

  private buttons = {
    addInTable: '(//button[@data-testid="add-in-table"])',
    speichern: "Speichern",
  };

  private tableCells = (column: string, index = 0): string =>
    `[data-testid="${column}${index}"]`;

  addOrt(ort: {
    name: string;
    flaeche: number;
    pressename: string;
    presseIn: string;
  }): void {
    this.I.click(this.buttons.addInTable);
    this.I.click('[data-testid="name0"]');
    this.I.fillField("#name", ort.name);
    this.I.pressKey("Tab");
    this.I.fillField("#flaeche", ort.flaeche.toString());
    this.I.pressKey("Tab");
    this.I.fillField("#pressename", ort.pressename);
    this.I.pressKey("Tab");
    this.I.fillField("#presseIn", ort.presseIn);
    this.I.pressKey("Enter");

    this.I.click(this.buttons.speichern);
  }

  async verifyOrtInStore(
    index: number,
    ort: {
      name: string;
      flaeche: number;
      pressename: string;
      presseIn: string;
    },
  ): Promise<void> {
    const resOrte = await this.I.loadObjectInCollection(
      "optionenstore",
      "orte",
    );
    this.I.assertDeepEqual(resOrte.orte[index], {
      name: ort.name,
      flaeche: ort.flaeche,
      key: "row" + index,
      pressename: ort.pressename,
      presseIn: ort.presseIn,
    });
  }

  verifyOrtInTable(
    rowNumber: number,
    ort: {
      name: string;
      flaeche: number;
      pressename: string;
      presseIn: string;
    },
  ): void {
    this.I.see(ort.name, this.tableCells("name", rowNumber));
    this.I.see(ort.flaeche.toString(), this.tableCells("flaeche", rowNumber));
    this.I.see(ort.pressename, this.tableCells("pressename", rowNumber));
    this.I.see(ort.presseIn, this.tableCells("presseIn", rowNumber));
  }

  copyOrt(newName: string) {
    this.I.click("button span .bi-files");

    this.I.click('[data-row-key="row1"] td:first-child');
    this.I.fillField("#name", newName);

    this.I.pressKey("Tab");
    this.I.click(this.buttons.speichern);
  }

  deleteOrt(number: number) {
    this.I.click('[data-row-key="row' + number + "] button span .bi-trash");

    this.I.click(this.buttons.speichern);
  }

  async verifyOrtSizeInStore(expectedLength: number) {
    const resOrte = await this.I.loadObjectInCollection(
      "optionenstore",
      "orte",
    );

    this.I.assertEqual(resOrte.orte.length, expectedLength);
  }
}
