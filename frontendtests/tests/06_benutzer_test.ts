Feature("Admin Benutzer");

Before(({ login }) => {
  login("admin");
});

Scenario(
  "Erstelle Team Benutzer und weise ihn als Kasse (Verantwortlich) zu",
  async ({ I, konzertPage, loginPage, adminPage }) => {
    const konzertTitle = "TeamUserKasseKonzert1";
    konzertPage.createExampleKonzert(konzertTitle);

    konzertPage.addRequiredKassePeople(konzertTitle);

    konzertPage.setConfirmed(konzertTitle);

    adminPage.goToAdminBenutzer();

    const randomInt = Math.floor(Math.random() * 9000) + 1000;
    const userName = `AbendkasseHelfer_${randomInt}`;
    adminPage.createBenutzer(userName);

    await loginPage.logout("admin");

    await loginPage.login(userName, userName);
    I.click("Danke");

    I.waitForText(konzertTitle, 2);
    konzertPage.assignCurrentUserToRole(
      konzertTitle,
      "Kasse (Verantwortlich)",
      userName,
    );

    await loginPage.logout(userName);

    await loginPage.login("admin", "admin");

    konzertPage.openKonzertCollapsable(konzertTitle);
    konzertPage.openRequiredPeople(konzertTitle);

    I.waitForText("Kasse (Verantwortlich)", 2);
    I.see(userName);
  },
);
