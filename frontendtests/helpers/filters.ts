const { I } = inject();

export const setCheck = async (name, jaNein, expand = false) => {
  I.click(locate("button").withText("Zurücksetzen").inside(".ant-space-item"));
  if (expand) {
    I.click(locate("#Filter-Öffentlichkeit"));
    I.click(locate("#Filter-Technik"));
  }
  I.click(name);
  if (!jaNein) {
    I.click(name);
  }
};

export const setAndCheck = async (name, title, expand = false) => {
  I.waitForText("Neutral");
  I.see(title);

  if (expand) {
    I.click("Filter...");
  }
  setCheck(name, true, expand);
  I.see(title);
  I.dontSee("Neutral");

  setCheck(name, false);
  I.dontSee(title);
  I.see("Neutral");
};
