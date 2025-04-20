import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Form, FormInstance, Tag } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { TeamFilterObject } from "./applyTeamFilter.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import isNil from "lodash/isNil";
import { NamePath } from "rc-field-form/es/interface";
import { TeamFilterEdit } from "@/components/team/TeamFilter/TeamFilterEdit.tsx";
import { reset } from "@/components/team/TeamFilter/resetTeamFilter.ts";
import isBoolean from "lodash/isBoolean";
import find from "lodash/find";
import map from "lodash/map";
import filter from "lodash/filter";
import User from "jc-shared/user/user.ts";

type LabelColorProperty = {
  readonly label: string;
  readonly color: boolean | string;
  readonly prop?: NamePath;
  readonly value?: string;
};

function HeaderTag({ label, value, color, prop, form }: LabelColorProperty & { readonly form: FormInstance }) {
  const { setTeamFilter } = useJazzContext();

  const closePropTag = useCallback(() => {
    const values = filter(form.getFieldValue(prop), (val: string) => val !== (value ?? label));
    form.setFieldValue(prop, values);
    setTeamFilter(form.getFieldsValue(true));
  }, [form, label, prop, setTeamFilter, value]);

  const closeBooleanTagForProp = useCallback(() => {
    if (prop) {
      form.setFieldValue(prop, undefined);
      setTeamFilter(form.getFieldsValue(true));
    }
  }, [form, prop, setTeamFilter]);

  return isBoolean(color) ? (
    <Tag closeIcon={!!prop} color={color ? "success" : "error"} key={label} onClose={closeBooleanTagForProp}>
      {label}
    </Tag>
  ) : (
    <Tag closeIcon color={color} key={label} onClose={closePropTag}>
      {label}
    </Tag>
  );
}

export default function TeamFilter() {
  const [open, setOpen] = useState(false);

  const [form] = Form.useForm<TeamFilterObject>();

  const { teamFilter, setTeamFilter, optionen, allUsers } = useJazzContext();

  useEffect(() => {
    form.setFieldsValue(teamFilter);
  }, [form, teamFilter]);

  const eventTypTag = useCallback(
    (typ: string) => {
      const result = find(optionen.typenPlus, ["name", typ]) ?? { name: "", color: "" };
      return { label: result.name, color: result.color, prop: ["kopf", "eventTyp"] };
    },
    [optionen.typenPlus],
  );

  function headerTagsForFilters(labelsColors: LabelColorProperty[]) {
    return map(labelsColors, (tag) => (
      <HeaderTag color={tag.color} form={form} key={tag.label} label={tag.label} prop={tag.prop} value={tag.value} />
    ));
  }

  const createBookerTag = useCallback(
    (booker: string) => {
      const bookerUser = find(allUsers, { id: booker }) ?? new User({ name: booker });
      return { label: bookerUser.name, value: booker, color: "blue", prop: "booker" };
    },
    [allUsers],
  );

  const taggies = useMemo(() => {
    function pushIfSet(att: boolean | undefined, label: string, prop?: NamePath) {
      if (!isNil(att)) {
        tags.push({ label, color: att, prop });
      }
    }
    const tags: LabelColorProperty[] = [];
    if (!isNil(teamFilter.istKonzert)) {
      tags.push(
        teamFilter.istKonzert
          ? { label: "nur Konzerte", color: true, prop: "istKonzert" }
          : { label: "nur Vermietungen", color: true, prop: "istKonzert" },
      );
    }
    pushIfSet(teamFilter.hotelBestaetigt, "Hotel bestätigt", "hotelBestaetigt");
    pushIfSet(teamFilter.kopf?.confirmed, "Ist bestätigt", ["kopf", "confirmed"]);
    pushIfSet(teamFilter.kopf?.abgesagt, "Ist abgesagt", ["kopf", "abgesagt"]);
    pushIfSet(teamFilter.presse?.checked, "Presse OK", ["presse", "checked"]);
    pushIfSet(teamFilter.kopf?.kannAufHomePage, "Ist auf Homepage", ["kopf", "kannAufHomePage"]);
    pushIfSet(teamFilter.kopf?.kannInSocialMedia, "Kann Social Media", ["kopf", "kannInSocialMedia"]);
    pushIfSet(teamFilter.presse?.text, "Text vorhanden", ["presse", "text"]);
    pushIfSet(teamFilter.presse?.originalText, "Originaltext vorhanden", ["presse", "originalText"]);
    pushIfSet(teamFilter.kopf?.fotografBestellen, "Fotograf einladen", ["kopf", "fotografBestellen"]);
    pushIfSet(teamFilter.technik?.checked, "Technik ist geklärt", ["technik", "checked"]);
    pushIfSet(teamFilter.technik?.fluegel, "Flügel stimmen", ["technik", "fluegel"]);
    const eventTypTags = map(teamFilter.kopf?.eventTyp, eventTypTag);
    const bookerTags = map(teamFilter.booker, createBookerTag);
    return tags.concat(eventTypTags).concat(bookerTags);
  }, [createBookerTag, eventTypTag, teamFilter]);

  const openClicked = useCallback(() => setOpen(true), []);
  const updateFilter = useCallback(() => setTeamFilter(form.getFieldsValue(true)), [form, setTeamFilter]);
  const resetClicked = useCallback(() => {
    reset(form);
    setTeamFilter(form.getFieldsValue(true));
  }, [form, setTeamFilter]);

  return (
    <span key="aktiveFilter">
      <ButtonWithIcon
        alwaysText
        onClick={openClicked}
        size="small"
        style={{ marginInlineEnd: "var(--ant-margin-xs)" }}
        text="Filter..."
        type="default"
      />
      <Form autoComplete="off" colon={false} form={form} onValuesChange={updateFilter} size="small" style={{ display: "inline" }}>
        <TeamFilterEdit open={open} setOpen={setOpen} />
      </Form>
      {taggies.length ? (
        <ButtonWithIcon
          alwaysText
          key="resetFilter"
          onClick={resetClicked}
          size="small"
          style={{ marginInlineEnd: "var(--ant-margin-xs)" }}
          text="Zurücksetzen"
          type="default"
        />
      ) : null}
      {headerTagsForFilters(taggies)}
    </span>
  );
}
