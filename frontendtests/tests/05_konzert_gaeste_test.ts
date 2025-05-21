Feature("Konzert Gäste");

Before(({ login }) => {
  login("admin");
});

Scenario(
  "Erstelle Gast in Gästeliste und setze alreadyIn",
  async ({ konzertPage, konzertGaestePage }) => {
    const konzertTitle = "GaesteBeispiel";
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
