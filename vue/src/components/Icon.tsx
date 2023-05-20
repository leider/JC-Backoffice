import * as icons from "react-bootstrap-icons";

export interface IconProps extends icons.IconProps {
  // Cannot use "name" as it is a valid SVG attribute
  // "iconName", "filename", "icon" will do it instead
  iconName: keyof typeof icons;
  size?: string | number;
}

export const IconForSmallBlock = ({ iconName, size, ...props }: IconProps) => {
  const BootstrapIcon = icons[iconName];
  return <BootstrapIcon size={size || 16} style={{ marginBottom: "-2px" }} {...props} />;
};
