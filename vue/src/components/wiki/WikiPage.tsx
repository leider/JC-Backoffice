import { PageHeader } from "@ant-design/pro-layout";
import { saveWikiPage, wikiPage } from "@/commons/loader-for-react";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Input, Row } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import Renderer from "jc-shared/commons/renderer";
import { areDifferent } from "@/commons/comparingAndTransforming";
import SimpleMdeReact from "react-simplemde-editor";
import { SaveButton } from "@/components/colored/JazzButtons";
import { IconForSmallBlock } from "@/components/Icon";

export default function WikiPage() {
  const { subdir, page } = useParams();
  const realPage = page || "index";
  const { data } = useQuery({ queryKey: ["wiki", `${subdir}-${realPage}`], queryFn: () => wikiPage(subdir!, realPage) });
  const [wikipage, setWikipage] = useState<string>("");
  const [rendered, setRendered] = useState<string>("");
  const [initialValue, setInitialValue] = useState<object>({});
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [dirty, setDirty] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  document.title = `Wiki | ${realPage}`;

  useEffect(() => {
    if (data) {
      setWikipage(data);
    }
  }, [data]);

  const mutateContent = useMutation({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mutationFn: (content) => saveWikiPage(subdir!, realPage, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wiki"] });
    },
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
  const editorOptions = useMemo(() => ({ status: false, spellChecker: false, sideBySideFullscreen: false, minHeight: "500px" }), []);
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
        // const diff = detailedDiff(initialValue, form.getFieldsValue(true));
        // console.log({ diff });
        // console.log({ initialValue });
        // console.log({ form: form.getFieldsValue(true) });
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <PageHeader
        title="Wiki"
        subTitle={realPage}
        breadcrumb={{ items: [{ title: <Link to={`/wiki/${subdir}/`}>{subdir}</Link> }] }}
        extra={[
          <Search key="Search" placeholder="Wiki durchsuchen..." onSearch={onSearch} style={{ width: 200 }} />,
          <Button key="edit" icon={<IconForSmallBlock iconName="FileEarmarkText" />} type="primary" onClick={editOrUndo}>
            {isEdit ? "Undo" : "Bearbeiten"}
          </Button>,
          <SaveButton key="save" disabled={!dirty} />,
        ]}
      />
      <Row gutter={12}>
        <Col span={24}>
          {isEdit ? (
            <Form.Item name={["content"]}>
              <SimpleMdeReact autoFocus options={editorOptions} />
            </Form.Item>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: rendered }} />
          )}
        </Col>
      </Row>
    </Form>
  );
}
