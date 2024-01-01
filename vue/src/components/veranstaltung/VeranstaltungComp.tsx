import * as React from "react";
import { createContext, useEffect, useState } from "react";
import { App, Form, FormInstance } from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  optionen as optionenRestCall,
  orte as orteRestCall,
  riderFor,
  saveOptionen,
  saveRider,
  saveVeranstaltung,
  veranstaltungForUrl,
} from "@/commons/loader.ts";
import Veranstaltung, { ChangelistItem } from "jc-shared/veranstaltung/veranstaltung";
import { areDifferent } from "@/commons/comparingAndTransforming";
import OptionValues from "jc-shared/optionen/optionValues";
import { fromFormObject, fromFormObjectAsAny, toFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";
import Orte from "jc-shared/optionen/orte";
import VeranstaltungTabs from "@/components/veranstaltung/VeranstaltungTabs";
import VeranstaltungPageHeader from "@/components/veranstaltung/VeranstaltungPageHeader";
import { differenceFor } from "jc-shared/commons/compareObjects";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { useAuth } from "@/commons/authConsts.ts";
import { Rider } from "jc-shared/rider/rider.ts";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
//import { detailedDiff } from "deep-object-diff";

export const VeranstaltungContext = createContext<{
  form: FormInstance<Veranstaltung>;
  optionen: OptionValues;
  orte: Orte;
} | null>(null);

export default function VeranstaltungComp() {
  const { url } = useParams();
  const [form] = Form.useForm<Veranstaltung>();

  const veranst = useQuery({
    queryKey: ["veranstaltung", url],
    queryFn: () => veranstaltungForUrl(url || ""),
  });
  const opts = useQuery({ queryKey: ["optionen"], queryFn: optionenRestCall });
  const locations = useQuery({ queryKey: ["orte"], queryFn: orteRestCall });
  const riderQuery = useQuery({ queryKey: ["rider", "url"], queryFn: () => riderFor(url || "") });

  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(new Veranstaltung({ id: "unknown" }));
  const [optionen, setOptionen] = useState<OptionValues>(new OptionValues());
  const [orte, setOrte] = useState<Orte>(new Orte());
  const [rider, setRider] = useState<Rider>(new Rider());
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty, true);

  useEffect(() => {
    if (veranst.data) {
      setVeranstaltung(veranst.data);
    }
  }, [veranst.data, form]);

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
    if (riderQuery.data) {
      setRider(riderQuery.data);
    }
  }, [riderQuery.data]);

  const queryClient = useQueryClient();

  const { notification } = App.useApp();

  const mutateVeranstaltung = useMutation({
    mutationFn: (veranst: Veranstaltung) => {
      setDirty(false);
      return saveVeranstaltung(veranst);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung", url] });
      navigate(
        {
          pathname: `/veranstaltung/${data.url}`,
          search: `page=${search.get("page")}`,
        },
        { replace: true },
      );
      notification.success({
        message: "Speichern erfolgreich",
        description: "Die Veranstaltung wurde gespeichert",
        placement: "topLeft",
        duration: 5,
      });
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

  const { context } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const deepCopy = toFormObject(veranstaltung);
    form.setFieldsValue(deepCopy);
    form.setFieldValue("riderBoxes", rider.boxes);
    const initial = toFormObject(veranstaltung);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (initial as any).riderBoxes = rider.boxes;
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    setIsNew(!veranstaltung.id);
    form.validateFields();
  }, [form, veranstaltung, rider]);

  useEffect(() => {
    const accessrights = context.currentUser.accessrights;
    if (!accessrights.isAbendkasse) {
      navigate(`/veranstaltung/preview/${url}`);
    }
  }, [context, navigate, url]);

  const [isNew, setIsNew] = useState<boolean>(false);

  const [search] = useSearchParams();

  function saveForm() {
    form.validateFields().then(async () => {
      const createLogWithDiff = (diff: string): ChangelistItem => {
        return {
          zeitpunkt: new DatumUhrzeit().mitUhrzeitNumerisch,
          bearbeiter: context.currentUser.id,
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
        const diff = differenceFor(originalVeranst, veranst);
        veranst.changelist.unshift(createLogWithDiff(diff));
      }
      if (!context.currentUser.accessrights.isOrgaTeam && !isNew) {
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
    <VeranstaltungContext.Provider value={{ form, optionen, orte }}>
      <Form
        form={form}
        onValuesChange={() => {
          // const diff = detailedDiff(initialValue, form.getFieldsValue(true));
          // console.log({ diff });
          // console.log({ initialValue });
          // console.log({ form: form.getFieldsValue(true) });
          setDirty(areDifferent(initialValue, form.getFieldsValue(true), ["agenturauswahl", "hotelauswahl", "endbestandEUR"]));
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
