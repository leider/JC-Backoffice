import { ConfigProvider, Form } from "antd";
import React, { ReactNode, useCallback, useEffect } from "react";
import "@mdxeditor/editor/style.css";
import "./markdwon-editor.css";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  imagePlugin,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  MDXEditorMethods,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import forEach from "lodash/forEach";
import { translations } from "@/widgets/markdown/markdown-translations.ts";
import { uploadWikiImage } from "@/rest/loader.ts";
import { NamePath } from "rc-field-form/es/interface";
import reduce from "lodash/reduce";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import isNil from "lodash/isNil";

function translationFunc(key: string, defaultValue: string, more?: { [idx: string]: string }) {
  const parts = key.split(".");
  let current: any = translations; // eslint-disable-line
  forEach(parts, (part) => {
    current = current[part];
  });
  const result: string = current ?? defaultValue;

  return reduce(
    result.match(/{{.+?}}/g), // search for inline stuff with "{{<text>}} to replace"
    (all, part) => {
      const core = part.replace("{{", "").replace("}}", "");
      return result.replace(part, (more ?? {})[core]);
    },
    result,
  );
}

async function imageUploadHandler(datei: File) {
  const formData = new FormData();
  formData.append("datei", datei);
  // send the file to your server and return
  // the URL of the uploaded image in the response
  const { url } = await uploadWikiImage(formData);
  return url;
}

export function MarkdownEditor({
  label,
  name,
  canImages = false,
}: {
  readonly label?: string | ReactNode;
  readonly name: NamePath;
  readonly canImages?: boolean;
}) {
  return (
    <Form.Item label={label} name={name}>
      <InnerEditor canImages={canImages} />
    </Form.Item>
  );
}

function InnerEditor({
  value,
  onChange,
  canImages,
}: {
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly canImages: boolean;
}) {
  const { isDarkMode } = useJazzContext();

  const mdxEditorRef = React.useRef<MDXEditorMethods>(null);

  useEffect(() => {
    if (!isNil(value)) {
      mdxEditorRef.current?.setMarkdown(value);
    }
  }, [value]);

  const toolbarContents = useCallback(
    () => (
      <DiffSourceToggleWrapper options={["rich-text", "source"]}>
        <UndoRedo />
        <BlockTypeSelect />
        <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
        <ListsToggle options={["bullet", "number"]} />
        <CreateLink />
        <InsertTable />
        <InsertThematicBreak />
        {canImages ? <InsertImage /> : undefined}
      </DiffSourceToggleWrapper>
    ),
    [canImages],
  );

  return (
    <ConfigProvider theme={{ token: { colorText: "white" } }}>
      <MDXEditor
        className={isDarkMode ? "dark-theme markdown-border" : "markdown-border"}
        markdown=""
        onChange={onChange}
        plugins={[
          toolbarPlugin({ toolbarContents }),
          listsPlugin(),
          quotePlugin(),
          linkPlugin(),
          diffSourcePlugin({ viewMode: "rich-text" }),
          headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
          listsPlugin(),
          thematicBreakPlugin(),
          tablePlugin(),
          linkDialogPlugin(),
          imagePlugin({ imageUploadHandler }),
          markdownShortcutPlugin(),
        ]}
        ref={mdxEditorRef}
        translation={translationFunc}
      />
    </ConfigProvider>
  );
}
