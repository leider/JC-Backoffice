const { I } = inject();

export async function login(userName: string, password: string) {
  I.amOnPage("/");
  I.waitForText("Benutzername");
  I.fillField("Benutzername", userName);
  I.fillField("Passwort", password);
  I.click("Anmelden");
  I.wait(0.5);
}

export async function logout(userName: string) {
  I.click(locate(".ant-menu-submenu-title").withText(userName));

  I.waitForText("Abmelden");
  I.click("Abmelden");

  I.waitForText("Benutzername");
}
