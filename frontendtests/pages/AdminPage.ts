import { fillDropdown } from "../helpers/PageHelper";

const { I } = inject();

export function goToAdminBenutzer() {
  I.amOnPage("/vue/users");

  I.waitForText("Übersicht über die User");
}

export function createBenutzer(identifier: string) {
  I.click("Neuer Benutzer");

  I.fillField("#id", identifier);
  I.fillField("#password", identifier);

  I.fillField("#name", "Testuser " + identifier);
  I.fillField("#email", "Testuser_" + identifier + "@google.com");

  // TODO funktioniert noch nicht
  I.click("Kasse");

  I.fillField("#tel", "01797591061");

  fillDropdown("T-Shirt", "M");
  fillDropdown("Rechte", "abendkasse");

  I.click("Kassenfreigabe");

  I.click("OK");

  I.waitForText("Speichern erfolgreich");
}
