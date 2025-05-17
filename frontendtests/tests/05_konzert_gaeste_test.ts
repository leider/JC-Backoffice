Feature("Konzert Gäste");

Before(({ login }) => {
  login("admin");
});

Scenario("Kopiere Konzert", async ({ I, konzertPage, konzertGaestePage }) => {
  let konzertTitle = "GaesteBeispiel";
  konzertPage.createExampleKonzert(konzertTitle);

  konzertGaestePage.goToGaestePage("2020-03-20", konzertTitle);

  const guest = {
    name: "Stefan Rinderle",
    comment: "Kommt später",
    number: 1,
    alreadyIn: 0,
  };

  konzertGaestePage.addGaesteListe(guest);

  // konzertGaestePage.verifyGuestInStore(konzertTitle, guest);
});
