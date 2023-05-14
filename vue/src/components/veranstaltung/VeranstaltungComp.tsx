import * as React from "react";
import { useEffect, useState } from "react";
import { Button, Col, Form, Row, Tabs, TabsProps, theme, Typography } from "antd";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { optionen as optionenRestCall, orte as orteRestCall, veranstaltungForUrl } from "@/commons/loader-for-react";
import { buttonType, useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import { IconForSmallBlock } from "@/components/Icon";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import TabAllgemeines from "@/components/veranstaltung/allgemeines/TabAllgemeines";
import { areDifferent } from "@/commons/comparingAndTransforming";
import OptionValues from "jc-shared/optionen/optionValues";
import { fromFormObject, toFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";
import Orte from "jc-shared/optionen/orte";
import TabTechnik from "@/components/veranstaltung/technik/TabTechnik";
import TabKosten from "@/components/veranstaltung/kosten/TabKosten";
import TabKasse from "@/components/veranstaltung/kasse/TabKasse";
import TabHotel from "@/components/veranstaltung/hotel/TabHotel";
import { detailedDiff } from "deep-object-diff";

export default function VeranstaltungComp() {
  const [search, setSearch] = useSearchParams();
  const { url } = useParams();
  const veranst = useQuery({ queryKey: ["veranstaltung", url], queryFn: () => veranstaltungForUrl(url || "") });
  const opts = useQuery({ queryKey: ["optionen"], queryFn: optionenRestCall });
  const locations = useQuery({ queryKey: ["orte"], queryFn: orteRestCall });

  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(new Veranstaltung());
  const [optionen, setOptionen] = useState<OptionValues>(new OptionValues());
  const [orte, setOrte] = useState<Orte>(new Orte());
  const [activePage, setActivePage] = useState<string>("allgemeines");
  const { icon } = useColorsAndIconsForSections("allgemeines");
  const [form] = Form.useForm<Veranstaltung>();
  const { useToken } = theme;
  const { token } = useToken();
  const [typeColor, setTypeColor] = useState<string>("");
  useEffect(() => {
    const code = `custom-color-${fieldHelpers.cssColorCode(veranstaltung.kopf.eventTyp)}`;
    setTypeColor((token as any)[code]);
  }, [veranstaltung]);

  useEffect(() => {
    if (veranst.data) {
      setVeranstaltung(veranst.data);
    }
  }, [veranst.data]);

  useEffect(() => {
    if (opts.data) {
      setOptionen(opts.data);
    }
  }, [opts.data]);

  useEffect(() => {
    if (locations.data) {
      setOrte(locations.data);
    }
  }, [locations.data]);

  useEffect(() => {
    const page = search.get("page") ?? "";
    if (["allgemeines", "technik", "ausgaben", "hotel", "kasse", "presse"].includes(page)) {
      setActivePage(page);
    } else {
      setActivePage("allgemeines");
      setSearch({ page: "allgemeines" });
    }
  }, [search]);

  function TabLabel(props: { type: buttonType; title: string }) {
    return (
      <b style={{ margin: -16, padding: 16 }} className={activePage === props.type ? `${"color"}-${props.type}` : `${"tab"}-${props.type}`}>
        <IconForSmallBlock iconName={icon(props.type)} /> {props.title}
      </b>
    );
  }

  const allTabs: TabsProps["items"] = [
    {
      key: "allgemeines",
      label: <TabLabel type="allgemeines" title="Allgemeines" />,
      children: (
        <TabAllgemeines
          veranstaltung={veranstaltung}
          form={form}
          optionen={optionen}
          orte={orte}
          brauchtHotelCallback={updateTabs}
          titleAndDateCallback={updateTitleAndDate}
        />
      ),
    },
    {
      key: "technik",
      label: <TabLabel type="technik" title="Technik" />,
      children: <TabTechnik optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
    {
      key: "ausgaben",
      label: <TabLabel type="ausgaben" title="Kalkulation" />,
      children: <TabKosten optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
    {
      key: "hotel",
      label: <TabLabel type="hotel" title="Hotel" />,
      children: <TabHotel optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
    {
      key: "kasse",
      label: <TabLabel type="kasse" title="Abendkasse" />,
      children: <TabKasse optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
    {
      key: "presse",
      label: <TabLabel type="presse" title="Presse" />,
      children: `${veranst.data?.id} 6`,
    },
  ];
  const [tabs, setTabs] = useState<TabsProps["items"]>(allTabs);
  useEffect(() => {
    updateTabs(veranstaltung.artist.brauchtHotel);
  }, [veranstaltung.artist.brauchtHotel, activePage]);

  function updateTabs(brauchtHotel: boolean) {
    if (brauchtHotel) {
      setTabs(allTabs);
    } else {
      const result = [...(allTabs || [])];
      result.splice(3, 1);
      setTabs(result);
    }
  }

  const [initialValue, setInitialValue] = useState<any>({});
  const [dirty, setDirty] = useState<boolean>(false);

  useEffect(() => {
    const deepCopy = toFormObject(veranstaltung);
    form.setFieldsValue(deepCopy);
    form.validateFields();
    setInitialValue(toFormObject(veranstaltung));
    updateTitleAndDate();
  }, [form, veranstaltung]);

  const [title, setTitle] = useState<string>("");
  const [displayDate, setDisplayDate] = useState<string>("");

  function updateTitleAndDate() {
    const veranstaltung = fromFormObject(form);
    setTitle(veranstaltung.kopf.titelMitPrefix);
    setDisplayDate(veranstaltung.datumForDisplayShort);

    const selectedOrt = orte.orte.find((o) => o.name === veranstaltung.kopf.ort);
    if (selectedOrt) {
      form.setFieldsValue({
        kopf: {
          pressename: selectedOrt.pressename || veranstaltung.kopf.ort,
          presseIn: selectedOrt.presseIn || selectedOrt.pressename,
          flaeche: selectedOrt.flaeche,
        },
      });
    }
    form.validateFields();
  }

  return (
    <Form
      form={form}
      onValuesChange={() => {
        const diff = detailedDiff(initialValue, form.getFieldsValue(true));
        console.log({ diff });
        // console.log({ initialValue });
        // console.log({ form: form.getFieldsValue(true) });
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      layout="vertical"
    >
      <Row>
        <Col span={12}>
          <Typography.Title level={2} style={{ color: typeColor }}>
            {title}
            <br />
            <small>
              <small>am {displayDate}</small>
            </small>
          </Typography.Title>
        </Col>
        <Col span={12}>
          <Row justify="end">
            <Button icon={<IconForSmallBlock iconName="Trash" />} type="primary" style={{ backgroundColor: token["colorError"] }}>
              &nbsp;Löschen
            </Button>
            <Button icon={<IconForSmallBlock iconName="Files" />} type="primary" style={{ backgroundColor: token["colorTextTertiary"] }}>
              &nbsp;Kopieren
            </Button>
            <Button
              htmlType="submit"
              icon={<IconForSmallBlock iconName="CheckSquare" />}
              type="primary"
              style={{ backgroundColor: token["colorSuccess"] }}
              disabled={!dirty}
            >
              &nbsp;Speichern
            </Button>
          </Row>
        </Col>
      </Row>
      <Tabs
        type="card"
        activeKey={activePage}
        items={tabs}
        onChange={(newPage) => {
          setSearch({ page: newPage });
        }}
      />
    </Form>
  );
}
