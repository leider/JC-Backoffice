import * as React from "react";
import { useEffect, useState } from "react";
import { App, Form, Tabs, TabsProps, Tag, theme } from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  deleteVeranstaltungWithId,
  optionen as optionenRestCall,
  orte as orteRestCall,
  saveVeranstaltung,
  veranstaltungForUrl,
} from "@/commons/loader-for-react";
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
//import { detailedDiff } from "deep-object-diff";
import { CopyButton, DeleteButton, SaveButton } from "@/components/colored/JazzButtons";
import TabPresse from "@/components/veranstaltung/presse/TabPresse";
import { PageHeader } from "@ant-design/pro-layout";

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
  const { icon, color } = useColorsAndIconsForSections("allgemeines");
  const [form] = Form.useForm<Veranstaltung>();
  const { useToken } = theme;
  const { token } = useToken();
  const [typeColor, setTypeColor] = useState<string>("");
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

  function TabLabel({ title, type }: { type: buttonType; title: string }) {
    const farbe = color(type);
    const active = activePage === type;
    return (
      <b style={{ margin: -16, padding: 16, backgroundColor: active ? farbe : "inherit", color: active ? "#FFF" : farbe }}>
        <IconForSmallBlock iconName={icon(type)} /> {title}
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
          titleAndDateCallback={updateStateStuff}
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
      children: <TabPresse optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
  ];
  const [tabs, setTabs] = useState<TabsProps["items"]>(allTabs);
  useEffect(() => {
    updateTabs(veranstaltung.artist.brauchtHotel);
  }, [veranstaltung.artist.brauchtHotel, activePage, optionen]);

  function updateTabs(brauchtHotel: boolean) {
    if (brauchtHotel) {
      setTabs(allTabs);
    } else {
      const result = [...(allTabs || [])];
      result.splice(3, 1);
      setTabs(result);
    }
  }

  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);

  function initializeForm() {
    const deepCopy = toFormObject(veranstaltung);
    form.setFieldsValue(deepCopy);
    const initial = toFormObject(veranstaltung);
    setInitialValue(initial);
    updateStateStuff();
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }

  useEffect(initializeForm, [form, veranstaltung]);

  const [title, setTitle] = useState<string>("");
  const [displayDate, setDisplayDate] = useState<string>("");
  const [isNew, setIsNew] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  function updateStateStuff() {
    const veranstaltung = fromFormObject(form);
    const localIsNew = !veranstaltung.id;

    document.title = localIsNew ? "Neue oder kopierte Veranstaltung" : veranstaltung.kopf.titel;
    setTitle(veranstaltung.kopf.titelMitPrefix);
    setDisplayDate(veranstaltung.datumForDisplayShort);
    setIsNew(localIsNew);
    const confirmed = veranstaltung.kopf.confirmed;
    setIsConfirmed(confirmed);
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
    const code = `custom-color-${fieldHelpers.cssColorCode(veranstaltung.kopf.eventTyp)}`;
    setTypeColor((token as any)[code]);

    const tags = [];
    if (!confirmed) {
      tags.push(<Tag color={"error"}>Unbestätigt</Tag>);
    } else {
      tags.push(<Tag color={"success"}>Bestätigt</Tag>);
    }
    if (veranstaltung.kopf.abgesagt) {
      tags.push(<Tag color={"error"}>ABGESAGT</Tag>);
    }
    setTagsForTitle(tags);

    form.validateFields();
  }

  function saveForm() {
    form.validateFields().then(() => {
      const veranst = fromFormObject(form);
      saveVeranstaltung(veranst);
      setVeranstaltung(veranst);
      initializeForm();
    });
  }

  const { modal } = App.useApp();
  const navigate = useNavigate();
  function deleteVeranstaltung() {
    const id = form.getFieldValue("id");
    if (!id) {
      return;
    }
    modal.confirm({
      type: "confirm",
      title: "Veranstaltung löschen",
      content: `Bist Du sicher, dass Du die Veranstaltung "${title}" löschen möchtest?`,
      onOk: async () => {
        await deleteVeranstaltungWithId(id);
        navigate("/");
      },
    });
  }

  const [tagsForTitle, setTagsForTitle] = useState<[]>([]);

  function copyVeranstaltung() {
    const url = form.getFieldValue("url");
    if (!url) {
      return;
    }
    navigate(`/veranstaltung/copy-of-${url}`);
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
        title={<span style={{ color: typeColor }}>{document.title}</span>}
        subTitle={<span style={{ color: typeColor }}>{displayDate}</span>}
        extra={[
          <DeleteButton key="delete" disabled={!(isNew || !isConfirmed)} callback={deleteVeranstaltung} />,
          <CopyButton key="copy" disabled={isNew} callback={copyVeranstaltung} />,
          <SaveButton key="save" disabled={!dirty} callback={saveForm} />,
        ]}
        tags={tagsForTitle}
      >
        {isNew && <b style={{ color: token["custom-color-ausgaben"] }}> (Denk daran, alle Felder zu überprüfen und auszufüllen)</b>}
      </PageHeader>
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
