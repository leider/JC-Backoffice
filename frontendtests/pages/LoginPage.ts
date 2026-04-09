const { I } = inject();

export async function login(userName: string, password: string) {
  I.amOnPage("/vue/login");
  I.waitForText("Benutzername");
  I.waitForElement("#login_username", 10);
  I.fillField("#login_username", userName);
  I.fillField("#login_password", password);
  I.click("Anmelden");
  // Wait until login form is gone; destination page/modal can vary by user state.
  I.waitForInvisible("#login_username", 10);
}

export async function logout(userName: string) {
  I.click(locate(".ant-menu-submenu-title").withText(userName));

  I.waitForText("Abmelden");
  I.click("Abmelden");

  I.waitForText("Benutzername");
}
