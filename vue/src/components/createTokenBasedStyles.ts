import cssColor from "jc-shared/commons/fieldHelpers.ts";
import { GlobalToken, theme } from "antd";

function jazzColors(colorCopy: string) {
  return {
    allgemeines: "#05498c",
    angebot: "#328300",
    ausgaben: "#d50f36",
    classix: "#4faee3",
    concert: "#6c757d",
    copy: colorCopy,
    festival: "#9fc442",
    homegrown: "#24719d",
    hotel: "#66267b",
    kasse: "#9185be",
    kooperation: "#9185be",
    livestream: "#ff29ac",
    presse: "#95c22e",
    session: "#dea71f",
    soulcafe: "#f07f31",
    staff: "#dea71f",
    technik: "#009285",
    vermietung: "#f6eee1",
  };
}

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

export function useTypeCustomColors() {
  const { useToken } = theme;
  const { token } = useToken();
  const typeColors = jazzColors(token.colorFillSecondary);
  const keyType = Object.keys(typeColors) as unknown as keyof typeof typeColors;

  function colorForEventTyp(typ: string): string {
    return typeColors[cssColor(typ) as typeof keyType];
  }

  return { colorForEventTyp, typeColors };
}

export function createTokenBasedStyles(document: Document, token: GlobalToken) {
  const jazzColor = jazzColors(token.colorFillSecondary);

  const errorBgColor = token.colorErrorBg;
  const bgContainerDisabledColor = token.colorBgContainerDisabled;
  const colorPrimary = customColors.colorPrimary;

  const colorClasses = (Object.keys(jazzColor) as (keyof typeof jazzColor)[]).map(
    (key) =>
      `.color-${key}{
      background-color: ${jazzColor[key]};
      border-color: ${jazzColor[key]};
      color: ${key === "vermietung" ? token.colorText : "#fff"} !important;
      overflow: hidden;
    }
    
    .text-${key}{
      color: ${jazzColor[key]};
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

.ical-event {
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
