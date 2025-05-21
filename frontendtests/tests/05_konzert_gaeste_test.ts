Feature("Konzert Gäste");

Before(({ login }) => {
  login("admin");
});

Scenario(
  "Erstelle Gast in Gästeliste und setze alreadyIn",
  async ({ konzertPage, konzertGaestePage }) => {
    const konzertTitle = "GaesteCreate";
    await konzertPage.createExampleKonzert(konzertTitle);
    await konzertPage.goToEditKonzert(konzertTitle);

    await konzertGaestePage.goToGaestePage();

    const guest = {
      name: "Stefan Rinderle",
      comment: "Kommt später",
      number: 2,
      alreadyIn: 0,
    };

    await konzertGaestePage.addGaesteListe(guest);

    await konzertGaestePage.verifyGuestInStore(konzertTitle, guest);

    await konzertGaestePage.setAlreadyIn(0, 1);

    await konzertGaestePage.verifyGuestInStore(konzertTitle, {
      ...guest,
      alreadyIn: 1,
    });
  },
);

Scenario(
  "Erstelle Gast danach kopieren und löschen",
  async ({ konzertPage, konzertGaestePage }) => {
    const konzertTitle = "GaesteCopyDelete";
    await konzertPage.createExampleKonzert(konzertTitle);
    await konzertPage.goToEditKonzert(konzertTitle);

    await konzertGaestePage.goToGaestePage();

    const guest = {
      name: "Stefan Rinderle",
      comment: "Kommt später",
      number: 2,
      alreadyIn: 0,
    };

    await konzertGaestePage.addGaesteListe(guest);
    await konzertGaestePage.verifyGuestInStore(konzertTitle, guest);

    await konzertGaestePage.copyGuest(0);

    const expectedChangedName = "Mario Rinderle";
    await konzertGaestePage.changeGuestName(1, expectedChangedName);

    const changedGuest = {
      ...guest,
      name: expectedChangedName,
    };
    await konzertGaestePage.verifyGuestInStore(konzertTitle, changedGuest, 1);

    await konzertGaestePage.deleteRow(0);

    await konzertGaestePage.verifyGuestInStore(konzertTitle, changedGuest, 0);

    await konzertGaestePage.deleteRow(0);

    await konzertGaestePage.verifyGuestStoreEmpty(konzertTitle);
  },
);
