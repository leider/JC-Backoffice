import { icons } from "./Icons.tsx";
import { IconProps as IP } from "react-bootstrap-icons";

export interface IconProps extends IP {
  // Cannot use "name" as it is a valid SVG attribute
  // "iconName", "filename", "icon" will do it instead
  iconName: keyof typeof icons;
  size?: string | number;
}

export const IconForSmallBlock = ({ iconName, size, ...props }: IconProps) => {
  const BootstrapIcon = icons[iconName];
  return <BootstrapIcon size={size || 16} style={{ marginBottom: "-3px" }} {...props} />;
};
