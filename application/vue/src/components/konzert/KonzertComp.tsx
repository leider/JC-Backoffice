import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Form, Modal } from "antd";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { konzertForUrl, riderFor, saveKonzert, saveOptionen, saveRider } from "@/commons/loader.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import { areDifferent } from "@/commons/comparingAndTransforming";
import KonzertTabs from "@/components/konzert/KonzertTabs";
import KonzertPageHeader from "@/components/konzert/KonzertPageHeader";
import { BoxParams, Rider } from "jc-shared/rider/rider.ts";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { useWatch } from "antd/es/form/Form";
import { KonzertContext } from "./KonzertContext";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import { TextField } from "@/widgets/TextField.tsx";
import StartEndPickers from "@/widgets/StartEndPickers.tsx";

export default function KonzertComp() {
  const { url } = useParams();
  const [form] = Form.useForm<Konzert & { riderBoxes?: BoxParams[] }>();
  const [isKasseHelpOpen, setIsKasseHelpOpen] = useState(false);
  const agenturauswahl = useWatch("agenturauswahl", { form });

  useEffect(
    () => {
      updateDirtyIfChanged(initialValue, form.getFieldsValue(true));
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [agenturauswahl],
  );

  const konzertQueryData = useQuery({
    queryKey: ["konzert", url],
    queryFn: () => konzertForUrl(url || ""),
  });
  const riderQuery = useQuery({ queryKey: ["rider", "url"], queryFn: () => riderFor(url || "") });

  const [konzert, setKonzert] = useState<Konzert>(new Konzert({ id: "unknown" }));
  const [rider, setRider] = useState<Rider>(new Rider());
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);

  const updateDirtyIfChanged = useCallback((initial: object, current: object) => {
    logDiffForDirty(initial, current, false);
    setDirty(areDifferent(initial, current, ["agenturauswahl", "hotelauswahl", "endbestandEUR"]));
  }, []);

  useDirtyBlocker(dirty);

  useEffect(() => {
    if (konzertQueryData.data) {
      setKonzert(konzertQueryData.data);
    }
  }, [konzertQueryData.data]);

  useEffect(() => {
    if (riderQuery.data) {
      setRider(riderQuery.data);
    }
  }, [riderQuery.data]);

  useEffect(() => {
    form.setFieldsValue({});
    setInitialValue({});
    setKonzert(new Konzert({ id: "unknown" }));
  }, [form, url]);

  const queryClient = useQueryClient();

  const mutateKonzert = useJazzMutation<Konzert>({
    saveFunction: saveKonzert,
    queryKey: "konzert",
    successMessage: "Das Konzert wurde gespeichert",
    setDirty,
    setResult: setKonzert,
  });

  const mutateOptionen = useMutation({
    mutationFn: saveOptionen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optionen"] });
    },
  });

  const mutateRider = useMutation({
    mutationFn: saveRider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider", url] });
    },
  });

  const { currentUser, optionen, showError } = useJazzContext();
  const navigate = useNavigate();

  const kassenfreigabe = useWatch(["kasse", "kassenfreigabe"], { form });

  const [openCopyModal, setOpenCopyModal] = useState(false);

  useEffect(() => {
    updateDirtyIfChanged(initialValue, form.getFieldsValue(true));
  }, [form, initialValue, kassenfreigabe, updateDirtyIfChanged]);

  useEffect(() => {
    const deepCopy = konzert.toJSON();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (deepCopy as any).riderBoxes = rider.boxes;
    form.setFieldsValue(deepCopy);
    const initial = konzert.toJSON();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (initial as any).riderBoxes = rider.boxes;
    setInitialValue(initial);
    updateDirtyIfChanged(initial, deepCopy);
    if (!konzert.id && url?.includes("copy-of") && konzert.startDate) {
      setOpenCopyModal(true);
    }
    setIsNew(!konzert.id);
    form.validateFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, konzert, updateDirtyIfChanged, url]); // rider must not be part of the dependencies

  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && !accessrights.isAbendkasse) {
      navigate(`/konzert/preview/${url}`);
    }
  }, [currentUser.accessrights, currentUser.id, navigate, url]);

  const [isNew, setIsNew] = useState<boolean>(false);

  function saveForm() {
    form.validateFields().then(async () => {
      const konzert = new Konzert(form.getFieldsValue(true));
      if (isNew) {
        konzert.initializeIdAndUrl();
      }
      if (!currentUser.accessrights.isOrgaTeam && !isNew) {
        // prevent saving of optionen for Kasse updates
        return mutateKonzert.mutate(konzert);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const untypedKonzert = konzert as any;
      optionen.addOrUpdateKontakt("agenturen", konzert.agentur, untypedKonzert.agenturauswahl);
      delete untypedKonzert.agenturauswahl;
      if (konzert.artist.brauchtHotel) {
        optionen.addOrUpdateKontakt("hotels", konzert.hotel, untypedKonzert.hotelauswahl);
        delete untypedKonzert.hotelauswahl;
        if (untypedKonzert.hotelpreiseAlsDefault) {
          optionen.updateHotelpreise(konzert.hotel, konzert.unterkunft.zimmerPreise);
          delete untypedKonzert.hotelpreiseAlsDefault;
        }
      }
      optionen.updateBackline("Jazzclub", konzert.technik.backlineJazzclub);
      optionen.updateBackline("Rockshop", konzert.technik.backlineRockshop);
      optionen.updateCollection("artists", konzert.artist.name);
      mutateOptionen.mutate(optionen);
      const boxes = form.getFieldValue("riderBoxes");
      const newrider = new Rider({ id: url, startDate: konzert.startDate, boxes });
      mutateRider.mutate(newrider);
      setRider(newrider);
      mutateKonzert.mutate(konzert);
    });
  }

  function resetChanges() {
    konzertQueryData.refetch();
  }

  return (
    <KonzertContext.Provider value={{ form, isDirty: dirty, isKasseHelpOpen, setKasseHelpOpen: setIsKasseHelpOpen, resetChanges }}>
      <Form
        form={form}
        onValuesChange={() => {
          updateDirtyIfChanged(initialValue, form.getFieldsValue(true));
        }}
        onFinishFailed={() => {
          showError({ text: "Es gibt noch fehlerhafte Felder. Bitte prüfe alle Tabs" });
        }}
        onFinish={saveForm}
        layout="vertical"
        colon={false}
      >
        <Modal
          title="Kopiertes Konzert"
          open={openCopyModal}
          onOk={() => {
            setOpenCopyModal(false);
          }}
          okText="Weiter"
          closable={false}
          footer={(_, { OkBtn }) => <OkBtn />}
        >
          <p>Du möchtest sicher Titel und Datum anpassen.</p>
          <TextField name={["kopf", "titel"]} label="Titel" required />
          <StartEndPickers />
        </Modal>
        <KonzertPageHeader isNew={isNew} dirty={dirty} />
        <KonzertTabs />
      </Form>
    </KonzertContext.Provider>
  );
}
