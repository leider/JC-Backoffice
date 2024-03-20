export type Category = "Keys" | "Drums" | "Bass" | "Guitar" | "Extra";

export interface InventoryElement {
  id: string;
  title: string;
  width: number;
  height: number;
  level: number;
  img?: { src: string; width?: number; height?: number };
  photo?: { src: string; width?: number; height?: number };
  category: Category;
}

export const Inventory: InventoryElement[] = [
  {
    category: "Keys",
    id: "Flügel",
    title: "Flügel (Yamaha)",
    width: 150,
    height: 200,
    level: 0,
    img: { src: "pianoschema.png", width: 150, height: 200 },
    photo: { src: "yamaha.jpg", width: 150, height: 200 },
  },
  { category: "Keys", id: "Klavierbank", title: "Klavierbank", width: 65, height: 33, level: 0, photo: { src: "Bench.png" } },
  {
    category: "Keys",
    id: "Rhodes",
    title: "Rhodes Mark I",
    width: 115,
    height: 60,
    level: 0,
    img: { src: "Rhodes.png", width: 115 },
    photo: { src: "RhodesMark1.png", width: 115 },
  },
  {
    category: "Keys",
    id: "NordStage",
    title: "Nord Stage 4 compact",
    width: 107,
    height: 32,
    level: 1,
    img: { src: "Nord.png" },
    photo: { src: "NordStage.png" },
  },
  {
    category: "Drums",
    id: "DrumsYamaha",
    title: "Drums (Yamaha)",
    width: 200,
    height: 200,
    level: 0,
    img: { src: "Drums.png", width: 200, height: 200 },
  },
  {
    category: "Drums",
    id: "DrumsGretsch",
    title: "Drums (Gretsch)",
    width: 200,
    height: 200,
    level: 0,
    img: { src: "Drums.png", width: 200, height: 200 },
  },
  { category: "Bass", id: "Markbass", title: 'Bass Amp Markbass 4x10"', width: 60, height: 48, level: 0, photo: { src: "Markbass.png" } },
  {
    category: "Bass",
    id: "GallienKrueger",
    title: "Bass Amp Gallien-Krueger Combo MB150",
    width: 35,
    height: 22,
    level: 0,
    photo: { src: "GallienKrueger.png" },
  },
  {
    category: "Guitar",
    id: "Fender",
    title: "Fender Twin Reverb",
    width: 68,
    height: 27,
    level: 0,
    photo: { src: "Fender.png" },
  },
  { category: "Guitar", id: "Jazzchorus", title: "Roland Jazzchorus", width: 55, height: 24, level: 0, photo: { src: "Roland.png" } },
  { category: "Guitar", id: "Polytone 12", title: 'Polytone Amp 12"', width: 40, height: 35, level: 0, photo: { src: "Polytone.png" } },
  { category: "Extra", id: "Extra", title: "Eigener Inhalt", width: 50, height: 50, level: 0 },
];
