import { GlobalToken } from "antd";

export const customColors: { [index: string]: string | number } = {
  colorPrimary: "#337ab7",
  colorLink: "#337ab7",
  colorTextDisabled: "#333333",
  borderRadius: 0,
  fontSize: 12,
  fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
  colorError: "#c71c2c",
  colorSuccess: "#28a745",
  colorLinkActive: "#2c4862",
  colorLinkHover: "#2c4862",
  linkHoverDecoration: "underline",
};

export function createTokenBasedStyles(document: Document, token: GlobalToken) {
  const errorBgColor = token.colorErrorBg;
  const bgContainerDisabledColor = token.colorBgContainerDisabled;
  const colorPrimary = customColors.colorPrimary;

  const jcCustomStyles = `
 .no-overflow {
  overflow: hidden;
 }
 
.table-row-error {
  background-color: ${errorBgColor};
}

/*This ensures the filter icon and the table header column text don't*/
/*flow into each other when the column is too small to contain both.*/
.ant-table-thead > tr > th .ant-table-filter-trigger-container {
  background: ${bgContainerDisabledColor};
}
.monat-header {
  background-color: ${colorPrimary};
}
`;

  const JC_STYLES = "JC-styles";
  const style = document.createElement("style");
  style.id = JC_STYLES;
  style.innerHTML = jcCustomStyles;

  const head = document.getElementsByTagName("head")[0];
  for (const child of head.children) {
    if (child.tagName === "STYLE" && child.id === JC_STYLES) {
      return;
    }
  }
  document.getElementsByTagName("head")[0].appendChild(style);
}
