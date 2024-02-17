import * as React from "react";
import { createContext, useCallback, useEffect, useState } from "react";
import { App, Form, FormInstance } from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { riderFor, saveOptionen, saveRider, saveVeranstaltung, veranstaltungForUrl } from "@/commons/loader.ts";
import Konzert, { ChangelistItem } from "../../../../shared/konzert/konzert.ts";
import { areDifferent, differenceFor } from "@/commons/comparingAndTransforming";
import { fromFormObject, fromFormObjectAsAny, toFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";
import VeranstaltungTabs from "@/components/veranstaltung/VeranstaltungTabs";
import VeranstaltungPageHeader from "@/components/veranstaltung/VeranstaltungPageHeader";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { Rider } from "jc-shared/rider/rider.ts";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
//import { detailedDiff } from "deep-object-diff";

export const VeranstaltungContext = createContext<{
  form: FormInstance<Konzert>;
  isDirty: boolean;
} | null>(null);

export default function VeranstaltungComp() {
  const { url } = useParams();
  const [form] = Form.useForm<Konzert>();

  const agenturauswahl = Form.useWatch("agenturauswahl", { form });

  useEffect(
    () => {
      updateDirtyIfChanged(initialValue, form.getFieldsValue(true));
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [agenturauswahl],
  );

  const veranst = useQuery({
    queryKey: ["veranstaltung", url],
    queryFn: () => veranstaltungForUrl(url || ""),
  });
  const riderQuery = useQuery({ queryKey: ["rider", "url"], queryFn: () => riderFor(url || "") });

  const [veranstaltung, setVeranstaltung] = useState<Konzert>(new Konzert({ id: "unknown" }));
  const [rider, setRider] = useState<Rider>(new Rider());
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);

  const updateDirtyIfChanged = useCallback((initial: object, current: object) => {
    setDirty(areDifferent(initial, current, ["agenturauswahl", "hotelauswahl", "endbestandEUR"]));
  }, []);
  useDirtyBlocker(dirty);

  useEffect(() => {
    if (veranst.data) {
      setVeranstaltung(veranst.data);
    }
  }, [veranst.data, form]);

  useEffect(() => {
    if (riderQuery.data) {
      setRider(riderQuery.data);
    }
  }, [riderQuery.data]);

  const queryClient = useQueryClient();

  const { notification } = App.useApp();

  const mutateVeranstaltung = useMutation({
    mutationFn: (veranst: Konzert) => {
      setDirty(false);
      return saveVeranstaltung(veranst);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung"] });
      navigate(
        {
          pathname: `/veranstaltung/${data.url}`,
          search: `page=${search.get("page")}`,
        },
        { replace: true },
      );
      showSuccess({ text: "Die Veranstaltung wurde gespeichert" });
    },
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

  const { currentUser, optionen, showSuccess } = useJazzContext();
  const navigate = useNavigate();

  const kassenfreigabe = Form.useWatch(["kasse", "kassenfreigabe"], { form });

  useEffect(() => {
    updateDirtyIfChanged(initialValue, form.getFieldsValue(true));
  }, [form, initialValue, kassenfreigabe, updateDirtyIfChanged]);

  useEffect(() => {
    const deepCopy = toFormObject(veranstaltung);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (deepCopy as any).riderBoxes = rider.boxes;
    form.setFieldsValue(deepCopy);
    const initial = toFormObject(veranstaltung);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (initial as any).riderBoxes = rider.boxes;
    setInitialValue(initial);
    updateDirtyIfChanged(initial, deepCopy);
    setIsNew(!veranstaltung.id);
    form.validateFields();
  }, [form, veranstaltung, rider, updateDirtyIfChanged]);

  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && !accessrights.isAbendkasse) {
      navigate(`/veranstaltung/preview/${url}`);
    }
  }, [currentUser.accessrights, currentUser.id, navigate, url]);

  const [isNew, setIsNew] = useState<boolean>(false);

  const [search] = useSearchParams();

  function saveForm() {
    form.validateFields().then(async () => {
      const createLogWithDiff = (diff: string): ChangelistItem => {
        return {
          zeitpunkt: new DatumUhrzeit().mitUhrzeitNumerisch,
          bearbeiter: currentUser.id,
          diff,
        };
      };

      const veranst = fromFormObject(form);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const untypedVeranstaltung = veranst as any;
      const originalVeranst = fromFormObjectAsAny(initialValue);
      if (isNew) {
        veranst.initializeIdAndUrl();
        veranst.changelist = [createLogWithDiff("Angelegt")];
      } else {
        const diff = differenceFor(originalVeranst, veranst, ["agenturauswahl", "hotelauswahl", "endbestandEUR"]);
        veranst.changelist.unshift(createLogWithDiff(diff));
      }
      if (!currentUser.accessrights.isOrgaTeam && !isNew) {
        // prevent saving of optionen
        return mutateVeranstaltung.mutate(veranst);
      }
      optionen.addOrUpdateKontakt("agenturen", veranst.agentur, untypedVeranstaltung.agenturauswahl);
      delete untypedVeranstaltung.agenturauswahl;
      if (veranst.artist.brauchtHotel) {
        optionen.addOrUpdateKontakt("hotels", veranst.hotel, untypedVeranstaltung.hotelauswahl);
        delete untypedVeranstaltung.hotelauswahl;
        if (untypedVeranstaltung.hotelpreiseAlsDefault) {
          optionen.updateHotelpreise(veranst.hotel, veranst.unterkunft.zimmerPreise);
          delete untypedVeranstaltung.hotelpreiseAlsDefault;
        }
      }
      optionen.updateBackline("Jazzclub", veranst.technik.backlineJazzclub);
      optionen.updateBackline("Rockshop", veranst.technik.backlineRockshop);
      optionen.updateCollection("artists", veranst.artist.name);
      mutateOptionen.mutate(optionen);
      const boxes = form.getFieldValue("riderBoxes");
      const newrider = new Rider({ id: url, startDate: veranstaltung.startDate, boxes });
      mutateRider.mutate(newrider);
      setRider(newrider);
      mutateVeranstaltung.mutate(veranst);
    });
  }

  return (
    <VeranstaltungContext.Provider value={{ form, isDirty: dirty }}>
      <Form
        form={form}
        onValuesChange={() => {
          // const diff = detailedDiff(initialValue, form.getFieldsValue(true));
          // console.log({ diff });
          // console.log({ initialValue });
          // console.log({ form: form.getFieldsValue(true) });
          updateDirtyIfChanged(initialValue, form.getFieldsValue(true));
        }}
        onFinishFailed={() => {
          notification.error({
            message: "Fehler",
            description: "Es gibt noch fehlerhafte Felder. Bitte prüfe alle Tabs",
            placement: "topLeft",
            duration: 5,
          });
        }}
        onFinish={saveForm}
        layout="vertical"
      >
        <VeranstaltungPageHeader isNew={isNew} dirty={dirty} />
        <VeranstaltungTabs />
      </Form>
    </VeranstaltungContext.Provider>
  );
}
