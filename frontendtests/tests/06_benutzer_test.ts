Feature("Admin Benutzer");

Before(async ({ login }) => {
  await login("admin");
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
    I.waitForText("Kleine Bitte", 5);
    I.click("Ersthelfer");
    I.click("Kasse");
    I.click("Danke");
    I.waitForInvisible(".ant-modal-wrap", 5);

    I.amOnPage("/vue/veranstaltungen");
    I.waitForText(konzertTitle, 5);
    konzertPage.assignCurrentUserToRole(
      konzertTitle,
      "Kasse (Verantwortlich)",
      userName,
    );

    await loginPage.logout(userName);

    await loginPage.login("admin", "admin");

    I.amOnPage("/vue/veranstaltungen");
    I.waitForText(konzertTitle, 5);

    konzertPage.openKonzertCollapsable(konzertTitle);
    konzertPage.openRequiredPeople();

    const kasseVerantwortlichRow = locate(".ant-form-item").withDescendant(
      locate("b").withText("Kasse (Verantwortlich)"),
    );
    I.waitForElement(kasseVerantwortlichRow, 5);
    I.waitForText(`Testuser ${userName}`, 5, kasseVerantwortlichRow);
  },
);
