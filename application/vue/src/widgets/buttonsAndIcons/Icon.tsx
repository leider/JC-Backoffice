import { icons } from "./Icons.tsx";
import { IconProps as IP } from "react-bootstrap-icons";

export interface IconProps extends IP {
  // Cannot use "name" as it is a valid SVG attribute
  // "iconName", "filename", "icon" will do it instead
  readonly iconName: keyof typeof icons;
  readonly size?: string | number;
}

export function IconForSmallBlock({ iconName, size, ...props }: IconProps) {
  const BootstrapIcon = icons[iconName];
  return <BootstrapIcon size={size ?? 16} {...props} />;
}
