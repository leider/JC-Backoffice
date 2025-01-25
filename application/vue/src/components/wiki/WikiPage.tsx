import { saveWikiPage, wikiPage } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Button, Col, Form, Input } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import Renderer from "jc-shared/commons/renderer";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { RowWrapper } from "@/widgets/RowWrapper";
import { MarkdownEditor } from "@/widgets/markdown/MarkdownEditor.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function WikiPage() {
  useDirtyBlocker(false);
  const { currentUser } = useJazzContext();
  const isSuperUser = currentUser.accessrights.isSuperuser;

  const { subdir, page } = useParams();
  const realPage = page || "index";
  const { data } = useQuery({
    queryKey: ["wiki", `${subdir}-${realPage}`],
    queryFn: () => wikiPage(subdir!, realPage),
  });
  const [wikipage, setWikipage] = useState<string>("");
  const [rendered, setRendered] = useState<string>("");
  const [initialValue, setInitialValue] = useState<object>({});
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [dirty, setDirty] = useState<boolean>(false);

  const navigate = useNavigate();

  document.title = `Wiki | ${realPage}`;

  useEffect(() => {
    if (data) {
      setWikipage(data);
    }
  }, [data]);

  const mutateContent = useJazzMutation({
    saveFunction: (content: string) => saveWikiPage(subdir!, realPage, content),
    queryKey: "wiki",
    successMessage: "Die Seite wurde gespeichert",
  });

  const [form] = Form.useForm<{ content: string }>();

  function initializeForm() {
    setRendered(Renderer.render(wikipage));
    const deepCopy = { content: wikipage };
    form.setFieldsValue(deepCopy);
    const initial = { content: wikipage };
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    setIsEdit(false);
    form.validateFields();
  }
  useEffect(initializeForm, [form, wikipage]);

  const { Search } = Input;
  function onSearch(value: string) {
    if (value.length < 2) {
      return;
    }
    navigate(`/wiki/searchresults/${value}`);
  }
  function saveForm() {
    form.validateFields().then(async () => {
      mutateContent.mutate(form.getFieldValue("content"));
      setWikipage(form.getFieldValue("content"));
    });
  }

  function editOrUndo() {
    if (!isEdit) {
      setIsEdit(true);
    } else {
      form.setFieldsValue(initialValue);
      setDirty(false);
      setIsEdit(false);
    }
  }

  return (
    <Form
      form={form}
      onValuesChange={() => {
        const current = form.getFieldsValue(true);
        logDiffForDirty(initialValue, current, false);
        setDirty(areDifferent(initialValue, current));
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <JazzPageHeader
        title={`Wiki ${realPage}`}
        breadcrumb={<Link to={`/wiki/${subdir}/`}>{subdir}</Link>}
        buttons={[
          <Search key="Search" placeholder="Wiki durchsuchen..." onSearch={onSearch} style={{ width: 200 }} />,
          <Button
            key="edit"
            icon={<IconForSmallBlock iconName="FileEarmarkText" />}
            type="primary"
            onClick={editOrUndo}
            disabled={!isSuperUser}
          >
            {isEdit ? "Undo" : "Bearbeiten"}
          </Button>,
          <SaveButton key="save" disabled={!dirty} />,
        ]}
      />
      <RowWrapper>
        <JazzRow>
          <Col span={24}>
            {isEdit ? <MarkdownEditor name="content" canImages /> : <div dangerouslySetInnerHTML={{ __html: rendered }} />}
          </Col>
        </JazzRow>
      </RowWrapper>
    </Form>
  );
}
