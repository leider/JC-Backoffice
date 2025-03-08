import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { icons } from "@/widgets/buttonsAndIcons/Icons";

export function MenuIcon({ name }: { readonly name: keyof typeof icons }) {
  return <IconForSmallBlock iconName={name} style={{ marginBottom: -3 }} />;
}
