import { ConfigProvider, Form, theme } from "antd";
import React, { ReactNode, useEffect, useMemo } from "react";
import "@mdxeditor/editor/style.css";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  imagePlugin,
  InsertImage,
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
import { translations } from "@/widgets/markdown/markdown-translations.ts";
import { uploadWikiImage } from "@/commons/loader.ts";

function translationFunc(key: string, defaultValue: string) {
  const parts = key.split(".");
  let current: any = translations; // eslint-disable-line
  forEach(parts, (part) => {
    current = current[part];
  });
  return current ?? defaultValue;
}

async function imageUploadHandler(image: File) {
  const formData = new FormData();
  formData.append("image", image);
  // send the file to your server and return
  // the URL of the uploaded image in the response
  const { url } = await uploadWikiImage(formData);
  return url;
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
                <InsertImage />
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
          imagePlugin({ imageUploadHandler }),
        ]}
        translation={translationFunc}
      />
    </ConfigProvider>
  );
}
