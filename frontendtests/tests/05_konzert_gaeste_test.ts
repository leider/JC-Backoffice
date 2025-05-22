Feature("Konzert Gäste");

Before(({ login }) => {
  login("admin");
});

Scenario(
  "Erstelle Gast in Gästeliste und setze alreadyIn",
  async ({ konzertPage, konzertGaestePage }) => {
    const konzertTitle = "GaesteCreate";
    konzertPage.createExampleKonzert(konzertTitle);
    konzertPage.goToEditKonzert(konzertTitle);

    konzertGaestePage.goToGaestePage();

    const guest = {
      name: "Stefan Rinderle",
      comment: "Kommt später",
      number: 2,
      alreadyIn: 0,
    };

    await konzertGaestePage.addGaesteListe(guest);

    await konzertGaestePage.verifyGuestInStore(konzertTitle, guest);

    await konzertGaestePage.setGuestAlreadyIn(0, 1);

    await konzertGaestePage.verifyGuestInStore(konzertTitle, {
      ...guest,
      alreadyIn: 1,
    });

    konzertPage.deleteKonzert(konzertTitle);
  },
);

Scenario(
  "Erstelle Gast danach kopieren und löschen",
  async ({ konzertPage, konzertGaestePage }) => {
    const konzertTitle = "GaesteCopyDelete";
    konzertPage.createExampleKonzert(konzertTitle);
    konzertPage.goToEditKonzert(konzertTitle);

    konzertGaestePage.goToGaestePage();

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

    await konzertGaestePage.deleteGuestRow(0);

    await konzertGaestePage.verifyGuestInStore(konzertTitle, changedGuest, 0);

    await konzertGaestePage.deleteGuestRow(0);

    await konzertGaestePage.verifyGuestStoreEmpty(konzertTitle);

    konzertPage.deleteKonzert(konzertTitle);
  },
);

Scenario(
  "Erstelle Reservierung und setze alreadyIn",
  async ({ konzertPage, konzertGaestePage }) => {
    const konzertTitle = "ReservationCreate";
    konzertPage.createExampleKonzert(konzertTitle);
    konzertPage.goToEditKonzert(konzertTitle);

    konzertGaestePage.goToGaestePage();

    const guest = {
      name: "Stefan Rinderle",
      comment: "Freund von Schlagzeuger",
      number: 12,
      alreadyIn: 0,
    };

    await konzertGaestePage.addReservation(guest);

    await konzertGaestePage.verifyReservationInStore(konzertTitle, guest);

    await konzertGaestePage.setReservationAlreadyIn(0, 10);

    await konzertGaestePage.verifyReservationInStore(konzertTitle, {
      ...guest,
      alreadyIn: 10,
    });

    konzertPage.deleteKonzert(konzertTitle);
  },
);

Scenario(
  "Erstelle Reservierung danach kopieren und löschen",
  async ({ konzertPage, konzertGaestePage }) => {
    const konzertTitle = "ReservationCopyDelete";
    konzertPage.createExampleKonzert(konzertTitle);
    konzertPage.goToEditKonzert(konzertTitle);

    konzertGaestePage.goToGaestePage();

    const guest = {
      name: "Stefan Rinderle",
      comment: "Kommt später",
      number: 2,
      alreadyIn: 0,
    };

    await konzertGaestePage.addReservation(guest);
    await konzertGaestePage.verifyReservationInStore(konzertTitle, guest);

    await konzertGaestePage.copyReservation(0);

    const expectedChangedName = "Mario Rinderle";
    await konzertGaestePage.changeReservationName(1, expectedChangedName);

    const changedGuest = {
      ...guest,
      name: expectedChangedName,
    };
    await konzertGaestePage.verifyReservationInStore(
      konzertTitle,
      changedGuest,
      1,
    );

    await konzertGaestePage.deleteReservationRow(0);

    await konzertGaestePage.verifyReservationInStore(
      konzertTitle,
      changedGuest,
      0,
    );

    await konzertGaestePage.deleteReservationRow(0);

    await konzertGaestePage.verifyReservationStoreEmpty(konzertTitle);

    konzertPage.deleteKonzert(konzertTitle);
  },
);
