import { IconProps } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { colorVermietung } from "jc-shared/optionen/optionValues.ts";

export type ButtonType = "allgemeines" | "gaeste" | "technik" | "ausgaben" | "hotel" | "kasse" | "presse" | "angebot";

const jazzColors = {
  allgemeines: "#05498c",
  gaeste: "#834a00",
  angebot: "#328300",
  ausgaben: "#d50f36",
  concert: "#6c757d",
  hotel: "#66267b",
  kasse: "#9185be",
  presse: "#95c22e",
  staff: "#dea71f",
  technik: "#009285",
  vermietung: colorVermietung,
};

const icons: { [index: string]: IconProps["iconName"] } = {
  allgemeines: "Keyboard",
  gaeste: "People",
  technik: "Headphones",
  ausgaben: "GraphUp",
  hotel: "HouseDoor",
  kasse: "CashStack",
  presse: "Newspaper",
  staff: "People",
  angebot: "Basket",
};

function color(localType: ButtonType): string {
  return jazzColors[localType];
}

function icon(localType: ButtonType): IconProps["iconName"] {
  return icons[localType] as IconProps["iconName"];
}
export const colorsAndIconsForSections = { color, icon };
