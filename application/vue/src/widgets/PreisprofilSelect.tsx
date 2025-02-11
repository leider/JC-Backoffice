import { Form, Select } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import OptionValues, { Preisprofil } from "jc-shared/optionen/optionValues";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import find from "lodash/find";
import map from "lodash/map";

interface PreisprofilSelectParams {
  optionen: OptionValues;
  onChange?: (value?: Preisprofil) => void;
}

export default function PreisprofilSelect({ optionen, onChange }: PreisprofilSelectParams) {
  const form = useFormInstance();
  return (
    <Form.Item
      label={<b style={{ whiteSpace: "nowrap" }}>Preisprofil:</b>}
      name={["eintrittspreise", "preisprofil"]}
      valuePropName="valueAsObject"
      trigger="onValueAsObject"
    >
      <InternalPreisprofilSelect optionen={optionen} onChange={onChange} disabled={form.getFieldValue(["kasse", "kassenfreigabe"])} />
    </Form.Item>
  );
}

interface InternalPreisprofilSelectParams {
  id?: string;
  valueAsObject?: Preisprofil;
  optionen: OptionValues;
  onValueAsObject?: (value?: Preisprofil) => void;
  onChange?: (value?: Preisprofil) => void;
  disabled: boolean;
}

function InternalPreisprofilSelect({ id, onValueAsObject, optionen, valueAsObject, onChange, disabled }: InternalPreisprofilSelectParams) {
  function profilToDisplay(profil: Preisprofil) {
    return {
      label: (
        <span>
          {profil.name} {profil.veraltet ? "(Nicht aktuell)" : ""}
          <small>
            &nbsp;
            {`(${profil.regulaer},00, ${profil.regulaer - profil.rabattErmaessigt},00, ${profil.regulaer - profil.rabattMitglied},00)`}
          </small>
        </span>
      ),
      value: profil.name,
    };
  }

  const alleProfile = useMemo<Preisprofil[]>(() => {
    const result = [...optionen.preisprofile];
    if (valueAsObject && !find(optionen.preisprofile, { name: valueAsObject.name })) {
      result.push({ ...valueAsObject, veraltet: true });
    }
    return result.sort((a, b) => (a.regulaer > b.regulaer ? 1 : -1));
  }, [optionen, valueAsObject]);

  const displayProfile = useMemo(() => {
    return map(alleProfile, profilToDisplay);
  }, [alleProfile]);

  const [valueAsString, setValueAsString] = useState<string | undefined>();
  useEffect(() => {
    setValueAsString(valueAsObject?.name);
  }, [valueAsObject]);

  function selectedToPreisprofil(profilName: string) {
    const selectedProfil = find(alleProfile, { name: profilName });
    onValueAsObject?.(selectedProfil);
    onChange?.(selectedProfil);
  }

  return <Select id={id} options={displayProfile} value={valueAsString} onSelect={selectedToPreisprofil} disabled={disabled} />;
}
