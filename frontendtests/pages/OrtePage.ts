export class OrtePage {
  private I = inject().I;

  private fields = {
    name: "#name",
    flaeche: "#flaeche",
    pressename: "#pressename",
    presseIn: "#presseIn",
  };

  private buttons = {
    addInTable: '(//button[@data-testid="add-in-table"])',
    speichern: "Speichern",
  };

  private tableCells = (column: string, index = 0): string =>
    `[data-testid="${column}${index}"][tabindex="0"]`;

  addOrt(ort: {
    name: string;
    flaeche: number;
    pressename: string;
    presseIn: string;
  }): void {
    this.I.click(this.buttons.addInTable);
    this.I.click('[data-testid="name0"]');
    this.I.fillField(this.fields.name, ort.name);
    this.I.pressKey("Tab");
    this.I.fillField(this.fields.flaeche, ort.flaeche.toString());
    this.I.pressKey("Tab");
    this.I.fillField(this.fields.pressename, ort.pressename);
    this.I.pressKey("Tab");
    this.I.fillField(this.fields.presseIn, ort.presseIn);
    this.I.pressKey("Enter");

    this.I.click(this.buttons.speichern);
  }

  async verifyOrtInStore(ort: {
    name: string;
    flaeche: number;
    pressename: string;
    presseIn: string;
  }): Promise<void> {
    const resOrte = await this.I.loadObjectInCollection(
      "optionenstore",
      "orte",
    );
    this.I.assertDeepEqual(resOrte, {
      id: "orte",
      orte: [
        {
          name: ort.name,
          flaeche: ort.flaeche,
          key: "row0",
          pressename: ort.pressename,
          presseIn: ort.presseIn,
        },
      ],
    });
  }

  verifyOrtInTable(ort: {
    name: string;
    flaeche: number;
    pressename: string;
    presseIn: string;
  }): void {
    this.I.see(ort.name, this.tableCells("name"));
    this.I.see(ort.flaeche.toString(), this.tableCells("flaeche"));
    this.I.see(ort.pressename, this.tableCells("pressename"));
    this.I.see(ort.presseIn, this.tableCells("presseIn"));
  }
}
