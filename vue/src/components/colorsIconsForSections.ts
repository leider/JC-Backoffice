import { IconProps } from "@/components/Icon";
import { theme } from "antd";

export type buttonType = "allgemeines" | "technik" | "ausgaben" | "hotel" | "kasse" | "presse";

export function useColorsAndIconsForSections(type: buttonType) {
  const { useToken } = theme;
  const { token } = useToken() as any;

  const colors: { [index: string]: string } = {
    allgemeines: token["custom-color-allgemeines"],
    technik: token["custom-color-technik"],
    ausgaben: token["custom-color-ausgaben"],
    hotel: token["custom-color-hotel"],
    kasse: token["custom-color-kasse"],
    presse: token["custom-color-presse"],
  };

  const icons: { [index: string]: string } = {
    allgemeines: "Keyboard",
    technik: "Headphones",
    ausgaben: "GraphUp",
    hotel: "HouseDoor",
    kasse: "CashStack",
    presse: "Newspaper",
  };

  function color(localType = type) {
    return colors[localType];
  }

  function icon(localType = type): IconProps["iconName"] {
    return icons[localType] as IconProps["iconName"];
  }

  return { color, icon };
}
