const fs = require("fs");

function konzertHaving(object, name) {
  const empty = JSON.parse(
    fs.readFileSync(
      `${__dirname}/../data/veranstaltungenstore/Empty.json`,
      "utf8",
    ),
  );
  const { kopf, technik, presse, artist, unterkunft, directAtts } = object;
  Object.assign(empty.kopf, kopf, {
    titel: name,
  });
  Object.assign(empty.technik, technik);
  Object.assign(empty.presse, presse);
  Object.assign(empty.artist, artist);
  Object.assign(empty.unterkunft, unterkunft);
  return Object.assign(empty, directAtts, {
    id: name,
    url: name,
  });
}

async function setCheck(I, name, jaNein) {
  I.click("Filter...");
  I.click(locate("button").withText("Zurücksetzen").inside(".ant-space-item"));
  if (jaNein) {
    I.click(locate("#Filter-Öffentlichkeit"));
    I.click(locate("#Filter-Technik"));
  }
  I.click(name);
  if (!jaNein) {
    I.click(name);
  }
  I.click("Anwenden");
}

async function setAndCheck(I, name, title, menu) {
  I.click(menu);
  I.see("Neutral");
  I.see(title);

  setCheck(I, name, true);
  I.see(title);
  I.dontSee("Neutral");

  setCheck(I, name, false);
  I.dontSee(title);
  I.see("Neutral");
}

Feature("Filter in der Übersicht (Veranstaltungen) funktioniert für");

BeforeSuite(({ I }) => {
  I.createObject("veranstaltungenstore", konzertHaving({}, "Neutral"));
  I.createObject(
    "veranstaltungenstore",
    konzertHaving({ kopf: { confirmed: true } }, "Bestätigt"),
  );
  I.createObject(
    "veranstaltungenstore",
    konzertHaving({ kopf: { abgesagt: true } }, "Cancelled"),
  );
  I.createObject(
    "veranstaltungenstore",
    konzertHaving({ presse: { checked: true } }, "PresseOK"),
  );
  I.createObject(
    "veranstaltungenstore",
    konzertHaving({ kopf: { kannAufHomePage: true } }, "KannAufHomepage"),
  );
  I.createObject(
    "veranstaltungenstore",
    konzertHaving({ kopf: { kannInSocialMedia: true } }, "KannAufSocialMedia"),
  );
  I.createObject(
    "veranstaltungenstore",
    konzertHaving({ presse: { text: "Text" } }, "TextVorhanden"),
  );
  I.createObject(
    "veranstaltungenstore",
    konzertHaving(
      { presse: { originalText: "Original Text" } },
      "OriginaltextVorhanden",
    ),
  );
  I.createObject(
    "veranstaltungenstore",
    konzertHaving({ kopf: { fotografBestellen: true } }, "FotografEinladen"),
  );
  I.createObject(
    "veranstaltungenstore",
    konzertHaving({ technik: { checked: true } }, "TechnikChecked"),
  );
  I.createObject(
    "veranstaltungenstore",
    konzertHaving({ technik: { fluegel: true } }, "Fluegel"),
  );
  I.createObject(
    "veranstaltungenstore",
    konzertHaving(
      { artist: { brauchtHotel: true }, unterkunft: { bestaetigt: true } },
      "HotelBestatigt",
    ),
  );
  I.createObject(
    "veranstaltungenstore",
    konzertHaving(
      { artist: { brauchtHotel: true }, unterkunft: { bestaetigt: false } },
      "HotelNichtBestatigt",
    ),
  );
});

Before(({ login }) => {
  login("admin");
});

const menuToClick = new DataTable(["menu"]);
menuToClick.add(["Veranstaltungen"]);
menuToClick.add(["Team"]);

Data(menuToClick).Scenario("Allgemein 'bestätigt'", async ({ I, current }) => {
  setAndCheck(I, "Ist bestätigt", "Bestätigt", current.menu);
});

Data(menuToClick).Scenario("Allgemein 'abgesagt'", async ({ I, current }) => {
  setAndCheck(I, "Ist abgesagt", "Cancelled", current.menu);
});

Data(menuToClick).Scenario(
  "Öffentlichkeit 'Presse OK'",
  async ({ I, current }) => {
    setAndCheck(I, "Presse OK", "PresseOK", current.menu);
  },
);

Data(menuToClick).Scenario(
  "Öffentlichkeit 'Ist auf Homepage'",
  async ({ I, current }) => {
    setAndCheck(I, "Ist auf Homepage", "KannAufHomepage", current.menu);
  },
);

Data(menuToClick).Scenario(
  "Öffentlichkeit 'Kann Social Media'",
  async ({ I, current }) => {
    setAndCheck(I, "Kann Social Media", "KannAufSocialMedia", current.menu);
  },
);

Data(menuToClick).Scenario(
  "Öffentlichkeit 'Text vorhanden'",
  async ({ I, current }) => {
    setAndCheck(I, "Text vorhanden", "TextVorhanden", current.menu);
  },
);

Data(menuToClick).Scenario(
  "Öffentlichkeit 'Originaltext vorhanden'",
  async ({ I, current }) => {
    setAndCheck(
      I,
      "Originaltext vorhanden",
      "OriginaltextVorhanden",
      current.menu,
    );
  },
);

Data(menuToClick).Scenario(
  "Öffentlichkeit 'Fotograf einladen'",
  async ({ I, current }) => {
    setAndCheck(I, "Fotograf einladen", "FotografEinladen", current.menu);
  },
);

Data(menuToClick).Scenario(
  "Technik 'Technik ist geklärt'",
  async ({ I, current }) => {
    setAndCheck(I, "Technik ist geklärt", "TechnikChecked", current.menu);
  },
);

Data(menuToClick).Scenario(
  "Technik 'Flügel stimmen'",
  async ({ I, current }) => {
    setAndCheck(I, "Flügel stimmen", "Fluegel", current.menu);
  },
);

Data(menuToClick).Scenario(
  "Allgemein 'Hotel bestätigt'",
  async ({ I, current }) => {
    I.click(current.menu);
    I.see("Neutral");
    I.see("HotelBestatigt");
    I.see("HotelNichtBestatigt");

    setCheck(I, "Hotel bestätigt", true);
    I.see("HotelBestatigt");
    I.dontSee("HotelNichtBestatigt");
    I.dontSee("Neutral");

    setCheck(I, "Hotel bestätigt", false);
    I.see("HotelNichtBestatigt");
    I.dontSee("HotelBestaetigt");
    I.dontSee("Neutral");
  },
);
