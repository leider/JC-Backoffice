import { IconProps } from "@/components/Icon";
import { useTypeCustomColors } from "@/components/createTokenBasedStyles.ts";

export type buttonType = "allgemeines" | "technik" | "ausgaben" | "hotel" | "kasse" | "presse" | "angebot";

export function useColorsAndIconsForSections(type: buttonType = "allgemeines") {
  const { typeColors } = useTypeCustomColors();

  const icons: { [index: string]: IconProps["iconName"] } = {
    allgemeines: "Keyboard",
    technik: "Headphones",
    ausgaben: "GraphUp",
    hotel: "HouseDoor",
    kasse: "CashStack",
    presse: "Newspaper",
    staff: "People",
    angebot: "Basket",
  };

  function color(localType = type): string {
    return typeColors[localType];
  }

  function icon(localType = type): IconProps["iconName"] {
    return icons[localType] as IconProps["iconName"];
  }

  return { color, icon };
}
