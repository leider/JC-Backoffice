import { ConfigProvider, Form, theme } from "antd";
import React, { ReactNode, useEffect, useMemo } from "react";
import "@mdxeditor/editor/style.css";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  InsertThematicBreak,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  MDXEditor,
  MDXEditorMethods,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import forEach from "lodash/forEach";

function translationFunc(key: string, defaultValue: string) {
  const translations = {
    dialogControls: {
      save: "Speichern",
      cancel: "Abbruch",
    },
    linkPreview: {
      open: "URL {{url}} in neuem Fenster öffnen",
      edit: "URL bearbeiten",
      copyToClipboard: "In die Zwischenablage",
      copied: "Kopiert!",
      remove: "Linke löschen",
    },
    table: {
      deleteTable: "Delete table",
      columnMenu: "Column menu",
      textAlignment: "Text alignment",
      alignLeft: "Align left",
      alignCenter: "Align center",
      alignRight: "Align right",
      insertColumnLeft: "Insert a column to the left of this one",
      insertColumnRight: "Insert a column to the right of this one",
      deleteColumn: "Delete this column",
      rowMenu: "Row menu",
      insertRowAbove: "Insert a row above this one",
      insertRowBelow: "Insert a row below this one",
      deleteRow: "Delete this row",
    },
    toolbar: {
      blockTypes: {
        paragraph: "Absatz",
        quote: "Zitat",
        heading: "Überschrift {{level}}",
      },
      blockTypeSelect: {
        selectBlockTypeTooltip: "Überschrift / Absatz / Zitat",
        placeholder: "Art wählen",
      },
      toggleGroup: "Gruppe umschalten",
      removeBold: "Fett weg",
      bold: "Fett",
      removeItalic: "Kursiv weg",
      italic: "Kursiv",
      underline: "Unterstreichen",
      removeUnderline: "Unterstreichen weg",
      link: "Link anlegen",
      richText: "Formatiert",
      diffMode: "Vergleich (unbenutzt)",
      source: "Quelltext",
      admonition: "Insert Admonition",
      image: "Insert image",
      table: "Insert Table",
      thematicBreak: "Linie einfügen",
      bulletedList: "Bullet Liste",
      numberedList: "Numerierte Liste",
      checkList: "Check Liste",
      undo: "Rückgängig {{shortcut}}",
      redo: "Wiederherstellen {{shortcut}}",
    },
    admonitions: {
      note: "Note",
      tip: "Tip",
      danger: "Danger",
      info: "Info",
      caution: "Caution",
      changeType: "Select admonition type",
      placeholder: "Admonition type",
    },
    contentArea: {
      editableMarkdown: "Editierbarer Markdown",
    },
  };
  const parts = key.split(".");
  let current: any = translations; // eslint-disable-line
  forEach(parts, (part) => {
    current = current[part];
  });
  return current ?? defaultValue;
}

export function MarkdownEditor({ label, name }: { label?: string | ReactNode; name: string[] | string }) {
  return (
    <Form.Item label={label} name={name}>
      <InnerEditor />
    </Form.Item>
  );
}
function InnerEditor({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  const { token } = theme.useToken();
  const isDarkMode = useMemo(() => token.colorBgBase === "#101010", [token.colorBgBase]);

  const mdxEditorRef = React.useRef<MDXEditorMethods>(null);

  useEffect(() => {
    if (value) {
      mdxEditorRef.current?.setMarkdown(value);
    }
  }, [value]);

  return (
    <ConfigProvider theme={{ token: { colorText: "white" } }}>
      <MDXEditor
        className={isDarkMode ? "dark-theme" : undefined}
        ref={mdxEditorRef}
        markdown={""}
        onChange={onChange}
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <ListsToggle />
                <InsertThematicBreak />
              </DiffSourceToggleWrapper>
            ),
          }),
          listsPlugin(),
          quotePlugin(),
          linkPlugin(),
          diffSourcePlugin({ viewMode: "rich-text" }),
          headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
          listsPlugin(),
          thematicBreakPlugin(),
        ]}
        translation={translationFunc}
      />
    </ConfigProvider>
  );
}
