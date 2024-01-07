import { PageHeader } from "@ant-design/pro-layout";
import { kalenderFor, saveProgrammheft, veranstaltungenBetweenYYYYMM } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { App, Button, Col, Collapse, Form, Row, Typography } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { areDifferent } from "@/commons/comparingAndTransforming";
import SimpleMdeReact from "react-simplemde-editor";
import { SaveButton } from "@/components/colored/JazzButtons";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Kalender from "jc-shared/programmheft/kalender";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import HeftCalendar from "@/components/programmheft/HeftCalendar";
import groupBy from "lodash/groupBy";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";

export default function Programmheft() {
  const { year, month } = useParams();

  const defaultYear = new DatumUhrzeit().naechsterUngeraderMonat.format("YYYY");
  const defaultMonth = new DatumUhrzeit().naechsterUngeraderMonat.format("MM");
  const realYear = year || defaultYear;
  const realMonth = month || defaultMonth;
  const start = (DatumUhrzeit.forYYYYMM(`${realYear}${realMonth}`) || new DatumUhrzeit()).vorigerOderAktuellerUngeraderMonat;

  const { data: dataKalender } = useQuery({
    queryKey: ["kalender", `${year}-${month}`],
    queryFn: () =>
      kalenderFor(
        `${year ?? new DatumUhrzeit().naechsterUngeraderMonat.format("YYYY")}/${
          month ?? new DatumUhrzeit().naechsterUngeraderMonat.format("MM")
        }`,
      ),
  });
  const { data: dataveranstaltungen } = useQuery({
    queryKey: ["veranstaltung", `${start.yyyyMM}`],
    queryFn: () => veranstaltungenBetweenYYYYMM(start.yyyyMM, start.plus({ monate: 2 }).yyyyMM),
  });
  const [kalender, setKalender] = useState<Kalender>(new Kalender());
  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);
  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{
    [index: string]: Veranstaltung[];
  }>({});
  const [monate, setMonate] = useState<string[]>([]);
  const [unbestaetigte, setUnbestaetigte] = useState<Veranstaltung[]>([]);

  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty);

  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const { notification } = App.useApp();

  document.title = "Programmheft";

  useEffect(() => {
    if (dataKalender) {
      setKalender(dataKalender);
    }
    if (dataveranstaltungen) {
      setVeranstaltungen(dataveranstaltungen);
    }
  }, [dataKalender, dataveranstaltungen, start]);

  useEffect(() => {
    const filteredVeranstaltungen = veranstaltungen.filter((v) => v.kopf.confirmed);
    const result = groupBy(filteredVeranstaltungen, (veranst) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setUnbestaetigte(veranstaltungen.filter((v) => !v.kopf.confirmed));
    setMonate(Object.keys(result));
  }, [veranstaltungen]);

  const mutateContent = useMutation({
    mutationFn: saveProgrammheft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kalender"] });
      notification.success({
        message: "Speichern erfolgreich",
        description: "Das Programmheft wurde gespeichert",
        placement: "topLeft",
        duration: 3,
      });
    },
  });

  const [form] = Form.useForm<Kalender>();

  function initializeForm() {
    const deepCopy = { ...kalender };
    const initial = { ...kalender };
    setInitialValue(initial);
    form.setFieldsValue(deepCopy);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, kalender]);

  const editorOptions = useMemo(
    () => ({
      status: false,
      spellChecker: false,
      sideBySideFullscreen: false,
      minHeight: "500px",
    }),
    [],
  );
  function saveForm() {
    form.validateFields().then(async () => {
      const kalenderNew = new Kalender(form.getFieldsValue(true));
      mutateContent.mutate(kalenderNew);
      setKalender(kalenderNew);
    });
  }

  function previous() {
    navigate(`/programmheft/${start.minus({ monate: 2 }).fuerKalenderViews}`);
  }

  function next() {
    navigate(`/programmheft/${start.plus({ monate: 2 }).fuerKalenderViews}`);
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
        title="Programmheft"
        subTitle={`${start.monatJahrKompakt} - ${start.plus({ monate: 1 }).monatJahrKompakt}`}
        extra={[
          <Button key="prev" icon={<IconForSmallBlock iconName="ArrowBarLeft" onClick={previous} />} />,
          <Button key="next" icon={<IconForSmallBlock iconName="ArrowBarRight" onClick={next} />} />,
          <SaveButton key="save" disabled={!dirty} />,
        ]}
      />
      <RowWrapper>
        <Row gutter={12}>
          <Col xs={24} lg={16}>
            <Row gutter={12}>
              <Col span={12} style={{ zIndex: 0 }}>
                <HeftCalendar initialDate={start.minus({ monate: 2 }).fuerCalendarWidget} events={kalender.asEvents()} />
              </Col>
              <Col span={12} style={{ zIndex: 0 }}>
                <HeftCalendar initialDate={start.minus({ monate: 1 }).fuerCalendarWidget} events={kalender.asEvents()} />
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <h4>Farben Hilfe</h4>
                <p>
                  Du kannst entweder eine{" "}
                  <a href="https://www.w3schools.com/colors/colors_names.asp" target="_blank">
                    Farbe mit Namen eintragen
                  </a>{" "}
                  oder einen HEX-Code als "#RGB" oder "#RRGGBB".
                </p>
              </Col>
            </Row>
          </Col>
          <Col xs={24} lg={8}>
            <Form.Item name={"text"}>
              <SimpleMdeReact autoFocus options={editorOptions} />
            </Form.Item>
          </Col>
        </Row>
        {unbestaetigte.length > 0 && <h2>Es gibt noch unbestätigte Veranstaltungen</h2>}
        {unbestaetigte.map((veranst) => (
          <Link
            key={veranst.id}
            to={{
              pathname: `/veranstaltung/${encodeURIComponent(veranst.url || "")}`,
              search: "page=allgemeines",
            }}
          >
            {veranst.kopf.titelMitPrefix}
          </Link>
        ))}
        {monate.map((monat) => (
          <div key={monat}>
            <Row gutter={12}>
              <Col span={24}>
                <Collapse.Panel
                  key={monat}
                  header={
                    <Typography.Title level={4} style={{ margin: 0, color: "#FFF" }}>
                      {monat}
                    </Typography.Title>
                  }
                  className="monat-header"
                ></Collapse.Panel>
              </Col>
            </Row>
            <Row gutter={[8, 8]}>
              {veranstaltungenNachMonat[monat].map((veranst) => (
                <Col key={veranst.id} xs={24} sm={12} md={8} xxl={6}>
                  <PressePreview veranstVermiet={veranst} />
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </RowWrapper>
    </Form>
  );
}
