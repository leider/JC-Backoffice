export const veranstaltungTypeColors: { [index: string]: string } = {
  classix: "#4faee3",
  homegrown: "#24719d",
  concert: "#6c757d",
  festival: "#9fc442",
  kooperation: "#9185be",
  livestream: "#ff29ac",
  session: "#dea71f",
  soulcafe: "#f07f31",
};

export function createTokenBasedStyles(document: Document, token: { [p: string]: string | number }) {
  const errorBgColor = token.colorErrorBg;
  const bgContainerDisabledColor = token.colorBgContainerDisabled;
  const colorPrimary = token.colorPrimary;

  const colorClasses = Object.keys(veranstaltungTypeColors).map(
    (key) =>
      `.color-${key}{
      background-color: ${veranstaltungTypeColors[key]};
      border-color: ${veranstaltungTypeColors[key]};
      color: #fff !important;
      overflow: hidden;
    }
    
    .text-${key}{
      color: ${veranstaltungTypeColors[key]};
    }`,
  );

  const orrpCustomStyles =
    colorClasses.join("\n") +
    `
.color-geplant {
  border-style: solid;
  border-width: 3px;
  border-color: #f8500d !important;
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
.monat-header .ant-collapse-header {
  padding: 4px 8px !important;
}
.monat-header .ant-collapse-content-box {
  padding: 0 !important;
}
.team-block .ant-collapse-header {
  padding: 2px 2px !important;
}
.ant-collapse-header {
  padding: 4px 8px !important;
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
