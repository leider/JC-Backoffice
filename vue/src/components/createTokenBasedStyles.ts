export default function createTokenBasedStyles(document: Document, token: { [p: string]: string | number }) {
  const errorBgColor = token.colorErrorBg;
  const bgContainerDisabledColor = token.colorBgContainerDisabled;
  const colorPrimary = token.colorPrimary;

  const orrpCustomStyles = `.table-row-error {
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
.monat-header .ant-collapse-header {
  padding: 4px 8px !important;
}
.monat-header .ant-collapse-content-box {
  padding: 0 !important;
}
.team-block .ant-collapse-header {
  padding: 2px 2px !important;
}
`;

  const JC_STYLES = "JC-styles";
  const style = document.createElement("style");
  style.id = JC_STYLES;
  style.innerHTML = orrpCustomStyles;

  const head = document.getElementsByTagName("head")[0];
  for (const child of head.children) {
    if (child.tagName === "STYLE" && child.id === JC_STYLES) {
      return;
    }
  }
  document.getElementsByTagName("head")[0].appendChild(style);
}
