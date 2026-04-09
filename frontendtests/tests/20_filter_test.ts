let count = 0;
const start = new Date("2020-03-20T17:30:00.000Z");
const end = new Date("2020-03-20T19:00:00.000Z");

function addDaysTo(date, days) {
  const result = new Date(date.valueOf());
  result.setDate(result.getDate() + days);
  return result;
}
function konzertHaving(object, name) {
  count++;
  const empty = {
    startDate: addDaysTo(start, count).toISOString(),
    endDate: addDaysTo(end, count).toISOString(),
    kopf: {
      beschreibung: "",
      eventTyp: "Club Konzert",
      flaeche: 100,
      kooperation: "",
      ort: "Jazzclub",
      pressename: "Jazzclub Karlsruhe",
      presseIn: "im Jazzclub Karlsruhe",
      genre: "",
      confirmed: false,
      rechnungAnKooperation: false,
      abgesagt: false,
      fotografBestellen: false,
      kannAufHomePage: false,
      kannInSocialMedia: false,
    },
    artist: {},
    presse: {},
    technik: {},
    unterkunft: {},
  };
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

const konzerte = [
  [{}, "Neutral"],
  [{ kopf: { confirmed: true } }, "Bestätigt"],
  [{ kopf: { abgesagt: true } }, "Cancelled"],
  [{ presse: { checked: true } }, "PresseOK"],
  [{ kopf: { kannAufHomePage: true } }, "KannAufHomepage"],
  [{ kopf: { kannInSocialMedia: true } }, "KannAufSocialMedia"],
  [{ presse: { text: "Text" } }, "TextVorhanden"],
  [{ presse: { originalText: "Original Text" } }, "OriginaltextVorhanden"],
  [{ kopf: { fotografBestellen: true } }, "FotografEinladen"],
  [{ technik: { checked: true } }, "TechnikChecked"],
  [{ technik: { fluegel: true } }, "Fluegel"],
  [
    { artist: { brauchtHotel: true }, unterkunft: { bestaetigt: true } },
    "HotelBestatigt",
  ],
  [
    { artist: { brauchtHotel: true }, unterkunft: { bestaetigt: false } },
    "HotelNichtBestatigt",
  ],
];

Feature("Filter in der Übersicht (Veranstaltungen) funktioniert für");

BeforeSuite(({ I }) => {
  konzerte.forEach((k) => {
    I.createObject("veranstaltungenstore", konzertHaving(k[0], k[1]));
  });
});

Before(async ({ login }) => {
  await login("admin");
});

const menuToClick = new DataTable(["menu"]);
menuToClick.add(["Team"]);
menuToClick.add(["Veranstaltungen"]);

Data(menuToClick).Scenario("Viele'", async ({ I, current, filters }) => {
  // Menu click is unreliable (horizontal overflow). Direct routes avoid that.
  // Login check already lands on /vue/veranstaltungen; goto same URL again triggers Playwright
  // "Navigation … is interrupted by another navigation to the same URL".

  const path =
    new URL(await I.grabCurrentUrl()).pathname.replace(/\/$/, "") || "/";
  const target = current.menu === "Team" ? "/vue/team" : "/vue/veranstaltungen";
  if (path !== target) {
    I.amOnPage(target);
  }
  I.wait(1);
  filters.setAndCheck("Ist bestätigt", "Bestätigt", true);
  filters.setAndCheck("Ist abgesagt", "Cancelled");
  filters.setAndCheck("Presse OK", "PresseOK");
  filters.setAndCheck("Ist auf Homepage", "KannAufHomepage");
  filters.setAndCheck("Kann Social Media", "KannAufSocialMedia");
  filters.setAndCheck("Text vorhanden", "TextVorhanden");
  filters.setAndCheck("Originaltext vorhanden", "OriginaltextVorhanden");
  filters.setAndCheck("Fotograf einladen", "FotografEinladen");
  filters.setAndCheck("Technik ist geklärt", "TechnikChecked");
  filters.setAndCheck("Flügel stimmen", "Fluegel");

  I.see("Neutral");
  I.see("HotelBestatigt");
  I.see("HotelNichtBestatigt");

  filters.setCheck("Hotel bestätigt", true);
  I.see("HotelBestatigt");
  I.dontSee("HotelNichtBestatigt");
  I.dontSee("Neutral");

  filters.setCheck("Hotel bestätigt", false);
  I.see("HotelNichtBestatigt");
  I.dontSee("HotelBestaetigt");
  I.dontSee("Neutral");

  I.click(locate("button").withText("Zurücksetzen").inside(".ant-space-item"));
});
