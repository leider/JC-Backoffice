import { IconProps } from "@/components/Icon";
import { theme } from "antd";

export type buttonType = "allgemeines" | "technik" | "ausgaben" | "hotel" | "kasse" | "presse";

export function useColorsAndIconsForSections(type: buttonType) {
  const { useToken } = theme;
  const { token } = useToken() as any;

  const icons: { [index: string]: string } = {
    allgemeines: "Keyboard",
    technik: "Headphones",
    ausgaben: "GraphUp",
    hotel: "HouseDoor",
    kasse: "CashStack",
    presse: "Newspaper",
  };

  function color(localType = type) {
    return token[`custom-color-${localType}`];
  }

  function icon(localType = type): IconProps["iconName"] {
    return icons[localType] as IconProps["iconName"];
  }

  return { color, icon };
}
