import { GlobalToken } from "antd";

export default function createTokenBasedStyles(document: Document, token: GlobalToken) {
  const errorBgColor = token.colorErrorBg;
  const bgContainerDisabledColor = token.colorBgContainerDisabled;
  const errorColor = token.colorError;
  const successColor = token.colorSuccess;
  const processingColor = token.colorPrimary;
  const highlightColor = token.colorHighlight;
  const borderColor = token.colorBorder;

  const orrpCustomStyles = `.table-row-error {
  background-color: ${errorBgColor};
}

/*This ensures the filter icon and the table header column text don't*/
/*flow into each other when the column is too small to contain both.*/
.ant-table-thead > tr > th .ant-table-filter-trigger-container {
  background: ${bgContainerDisabledColor};
}

.collection-import-feedback-modal .import-status-failed {
  color: ${errorColor};
}
.collection-import-feedback-modal .import-status-success {
  color: ${successColor};
}
.collection-import-feedback-modal .import-status-pending {
  color: ${processingColor};
}
.collection-import-feedback-modal .failed-imports-section .failed-imports-title .warning-prefix {
  color: ${errorColor};
}

.resizable-drawer-dragger::after {
  background: ${borderColor};
}
.resizable-drawer-dragger:hover {
  background: ${borderColor};
}
.resizable-drawer-dragger:hover::after {
  background: ${highlightColor};
}`;

  const ORRP_STYLES = "ORRP-styles";
  const style = document.createElement("style");
  style.id = ORRP_STYLES;
  style.innerHTML = orrpCustomStyles;

  const head = document.getElementsByTagName("head")[0];
  for (const child of head.children) {
    if (child.tagName === "STYLE" && child.id === ORRP_STYLES) {
      return;
    }
  }
  document.getElementsByTagName("head")[0].appendChild(style);
}
