import * as React from "react";
import { useEffect, useState } from "react";
import { App, Form } from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  optionen as optionenRestCall,
  orte as orteRestCall,
  saveOptionen,
  saveVeranstaltung,
  veranstaltungForUrl,
} from "@/commons/loader-for-react";
import Veranstaltung, { ChangelistItem } from "jc-shared/veranstaltung/veranstaltung";
import { areDifferent } from "@/commons/comparingAndTransforming";
import OptionValues from "jc-shared/optionen/optionValues";
import { fromFormObject, fromFormObjectAsAny, toFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";
import Orte from "jc-shared/optionen/orte";
import VeranstaltungTabs from "@/components/veranstaltung/VeranstaltungTabs";
import VeranstaltungPageHeader from "@/components/veranstaltung/VeranstaltungPageHeader";
import { differenceFor } from "jc-shared/commons/compareObjects";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { useAuth } from "@/commons/auth";

export default function VeranstaltungComp() {
  const { url } = useParams();
  const veranst = useQuery({ queryKey: ["veranstaltung", url], queryFn: () => veranstaltungForUrl(url || "") });
  const opts = useQuery({ queryKey: ["optionen"], queryFn: optionenRestCall });
  const locations = useQuery({ queryKey: ["orte"], queryFn: orteRestCall });

  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(new Veranstaltung());
  const [optionen, setOptionen] = useState<OptionValues>(new OptionValues());
  const [orte, setOrte] = useState<Orte>(new Orte());

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

  const queryClient = useQueryClient();

  const { notification } = App.useApp();

  // When this mutation succeeds, invalidate any queries with the `todos` or `reminders` query key
  const mutateVeranstaltung = useMutation({
    mutationFn: saveVeranstaltung,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung", url] });
      navigate({ pathname: `/veranstaltung/${data.url}`, search: `page=${search.get("page")}` }, { replace: true });
      notification.open({
        message: "Speichern erfolgreich",
        description: "Die Veranstaltung wurde gespeichert",
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

  const [form] = Form.useForm<Veranstaltung>();

  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  const { context } = useAuth();
  function initializeForm() {
    const deepCopy = toFormObject(veranstaltung);
    form.setFieldsValue(deepCopy);
    const initial = toFormObject(veranstaltung);
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    setIsNew(!veranstaltung.id);
    form.validateFields();
  }

  useEffect(initializeForm, [form, veranstaltung]);

  const [isNew, setIsNew] = useState<boolean>(false);

  const navigate = useNavigate();
  const [search] = useSearchParams();
  function saveForm() {
    form.validateFields().then(async () => {
      const createLogWithDiff = (diff: string): ChangelistItem => {
        return { zeitpunkt: new DatumUhrzeit().mitUhrzeitNumerisch, bearbeiter: context?.currentUser?.id || "", diff };
      };

      const veranst = fromFormObject(form);

      const untypedVeranstaltung = veranst as any;
      const originalVeranst = fromFormObjectAsAny(initialValue);
      if (isNew) {
        veranst.initializeIdAndUrl();
        veranst.changelist = [createLogWithDiff("Angelegt")];
      } else {
        const diff = differenceFor(originalVeranst, veranst);
        veranst.changelist.unshift(createLogWithDiff(diff));
      }
      if (!context?.currentUser.accessrights?.isOrgaTeam && !isNew) {
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
      mutateVeranstaltung.mutate(veranst);
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
        setDirty(areDifferent(initialValue, form.getFieldsValue(true), ["agenturauswahl", "hotelauswahl", "endbestandEUR"]));
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <VeranstaltungPageHeader isNew={isNew} dirty={dirty} form={form} />
      <VeranstaltungTabs veranstaltung={veranstaltung} optionen={optionen} orte={orte} form={form} />
    </Form>
  );
}
