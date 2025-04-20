import { saveWikiPage, wikiPage } from "@/rest/loader.ts";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
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
    saveFunction: (data: { content: string }) => saveWikiPage(subdir!, realPage, data),
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
  const onSearch = useCallback(
    (value: string) => {
      if (value.length < 2) {
        return;
      }
      navigate(`/wiki/searchresults/${value}`);
    },
    [navigate],
  );

  const saveForm = useCallback(
    () =>
      form.validateFields().then(async () => {
        mutateContent.mutate(form.getFieldsValue(true));
        setWikipage(form.getFieldValue("content"));
      }),
    [form, mutateContent],
  );

  const editOrUndo = useCallback(() => {
    if (!isEdit) {
      setIsEdit(true);
    } else {
      form.setFieldsValue(initialValue);
      setDirty(false);
      setIsEdit(false);
    }
  }, [isEdit, form, initialValue]);

  const onValuesChange = useCallback(() => {
    const current = form.getFieldsValue(true);
    logDiffForDirty(initialValue, current, false);
    setDirty(areDifferent(initialValue, current));
    setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
  }, [form, initialValue]);

  return (
    <Form form={form} layout="vertical" onFinish={saveForm} onValuesChange={onValuesChange}>
      <JazzPageHeader
        breadcrumb={<Link to={`/wiki/${subdir}/`}>{subdir}</Link>}
        buttons={[
          <Search key="Search" onSearch={onSearch} placeholder="Wiki durchsuchen..." style={{ width: 200 }} />,
          <Button
            disabled={!isSuperUser}
            icon={<IconForSmallBlock iconName="FileEarmarkText" />}
            key="edit"
            onClick={editOrUndo}
            type="primary"
          >
            {isEdit ? "Undo" : "Bearbeiten"}
          </Button>,
          <SaveButton disabled={!dirty} key="save" />,
        ]}
        title={`Wiki ${realPage}`}
      />
      <RowWrapper>
        <JazzRow>
          <Col span={24}>
            {isEdit ? <MarkdownEditor canImages name="content" /> : <div dangerouslySetInnerHTML={{ __html: rendered }} />}
          </Col>
        </JazzRow>
      </RowWrapper>
    </Form>
  );
}
