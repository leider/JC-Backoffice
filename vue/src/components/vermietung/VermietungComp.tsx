import * as React from "react";
import { useEffect, useState } from "react";
import { App, Col, Form, Row } from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saveVermietung, vermietungForUrl } from "@/commons/loader.ts";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { useAuth } from "@/commons/auth";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import VermietungPageHeader from "@/components/vermietung/VermietungPageHeader.tsx";
import { fromFormObject, toFormObject } from "@/components/vermietung/vermietungCompUtils.ts";
import CheckItem from "@/widgets/CheckItem.tsx";
import { TextField } from "@/widgets/TextField.tsx";
import StartEndPickers from "@/widgets/StartEndPickers.tsx";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung.tsx";
import SimpleMdeReact from "react-simplemde-editor";

export default function VermietungComp() {
  const { url } = useParams();

  const vermiet = useQuery({
    queryKey: ["vermietung", url],
    queryFn: () => vermietungForUrl(url || ""),
  });

  const [vermietung, setVermietung] = useState<Vermietung>(new Vermietung());

  useEffect(() => {
    if (vermiet.data) {
      setVermietung(vermiet.data);
    }
  }, [vermiet.data]);

  const queryClient = useQueryClient();

  const { notification } = App.useApp();

  // When this mutation succeeds, invalidate any queries with the `todos` or `reminders` query key
  const mutateVermietung = useMutation({
    mutationFn: saveVermietung,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vermietung", url] });
      navigate(
        {
          pathname: `/vermietung/${data.url}`,
          search: `page=${search.get("page")}`,
        },
        { replace: true },
      );
      notification.open({
        message: "Speichern erfolgreich",
        description: "Die Vermietung wurde gespeichert",
        duration: 5,
      });
    },
  });

  const [form] = Form.useForm<Vermietung>();

  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  const { context } = useAuth();
  const navigate = useNavigate();
  function initializeForm() {
    const deepCopy = toFormObject(vermietung);
    form.setFieldsValue(deepCopy);
    const initial = toFormObject(vermietung);
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    setIsNew(!vermietung.id);
    form.validateFields();
  }

  useEffect(initializeForm, [form, vermietung]);
  useEffect(() => {
    const accessrights = context?.currentUser.accessrights;
    if (accessrights !== undefined && !accessrights?.isOrgaTeam) {
      navigate(`/team`);
    }
  }, [context, navigate, url]);

  const [isNew, setIsNew] = useState<boolean>(false);

  const [search] = useSearchParams();
  function saveForm() {
    form.validateFields().then(async () => {
      const vermiet = fromFormObject(form);

      if (isNew) {
        vermiet.initializeIdAndUrl();
      }
      mutateVermietung.mutate(vermiet);
    });
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
      <VermietungPageHeader isNew={isNew} dirty={dirty} form={form} />
      <Col xs={24} lg={12}>
        <CollapsibleForVeranstaltung suffix="allgemeines" label="Event" noTopBorder>
          <Row gutter={12}>
            <Col span={8}>
              <CheckItem name={["confirmed"]} label="Ist bestätigt" />
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <TextField name={["titel"]} label="Titel" required />
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={24}>
              <StartEndPickers />
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item label={<b>Zusätzliche Infos:</b>} name={["kopf", "beschreibung"]}>
                <SimpleMdeReact options={{ status: false, spellChecker: false }} />
              </Form.Item>
            </Col>
          </Row>
        </CollapsibleForVeranstaltung>
      </Col>
    </Form>
  );
}
