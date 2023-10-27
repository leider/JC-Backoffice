const cssMap: { [index: string]: string } = {
  "Club Konzert": "classix",
  Homegrown: "homegrown",
  "Jazz und Literatur": "kooperation",
  "JC im Kunstverein": "kooperation",
  JazzClassix: "classix",
  JazzFestival: "festival",
  Kino: "kooperation",
  Kooperation: "kooperation",
  Livestream: "livestream",
  JamSession: "session",
  Soulcafé: "soulcafe",
};

export default function cssColor(typ: string): string {
  return (cssMap[typ] as string) || "concert";
}
