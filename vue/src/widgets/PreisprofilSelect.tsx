import { Form, FormInstance, Select } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import OptionValues, { Preisprofil } from "jc-shared/optionen/optionValues";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

interface PreisprofilSelectParams {
  optionen: OptionValues;
  onChange?: (value?: Preisprofil) => void;
  form: FormInstance<Veranstaltung>;
}

export default function PreisprofilSelect({ optionen, onChange, form }: PreisprofilSelectParams) {
  return (
    <Form.Item
      label={<b>Preisprofil:</b>}
      name={["eintrittspreise", "preisprofil"]}
      valuePropName="valueAsObject"
      trigger="onValueAsObject"
    >
      <InternalPreisprofilSelect optionen={optionen} onChange={onChange} disabled={form.getFieldValue(["kasse", "kassenfreigabe"])} />
    </Form.Item>
  );
}

interface InternalPreisprofilSelectParams {
  valueAsObject?: Preisprofil;
  optionen: OptionValues;
  onValueAsObject?: (value?: Preisprofil) => void;
  onChange?: (value?: Preisprofil) => void;
  disabled: boolean;
}

function InternalPreisprofilSelect({ onValueAsObject, optionen, valueAsObject, onChange, disabled }: InternalPreisprofilSelectParams) {
  const [preisprofile, setPreisprofile] = useState<{ label: React.ReactElement; value: string }[]>([]);
  useEffect(() => {
    const localPreisprofile = optionen.preisprofile().map((profil) => ({
      label: (
        <span>
          {profil.name}
          <small>
            &nbsp;
            {`(${profil.regulaer},00, ${profil.regulaer - profil.rabattErmaessigt},00, ${profil.regulaer - profil.rabattMitglied},00)`}
          </small>
        </span>
      ),
      value: profil.name,
    }));
    setPreisprofile(localPreisprofile);
  }, [optionen]);

  const [valueAsString, setValueAsString] = useState<string | undefined>();
  useEffect(() => {
    setValueAsString(valueAsObject?.name);
  }, [valueAsObject]);

  const alleProfile = useMemo<Preisprofil[]>(() => optionen.preisprofile(), [optionen]);
  function selectedToPreisprofil(profilName: string) {
    const selectedProfil = alleProfile.find((profil) => profil.name === profilName);
    onValueAsObject?.(selectedProfil);
    onChange?.(selectedProfil);
  }

  return <Select options={preisprofile} value={valueAsString} onSelect={selectedToPreisprofil} disabled={disabled} />;
}
