import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Form, Tag } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { TeamFilterObject } from "./applyTeamFilter.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import isNil from "lodash/isNil";
import { withoutNullOrUndefinedStrippedBy } from "jc-shared/commons/comparingAndTransforming.ts";
import isEmpty from "lodash/isEmpty";
import { NamePath } from "rc-field-form/es/interface";
import { TeamFilterEdit } from "@/components/team/TeamFilter/TeamFilterEdit.tsx";
import { reset } from "@/components/team/TeamFilter/resetTeamFilter.ts";
import isBoolean from "lodash/isBoolean";
import find from "lodash/find";
import map from "lodash/map";
import filter from "lodash/filter";

type LabelColorProperty = {
  readonly label: string;
  readonly color: boolean | string;
  readonly prop?: NamePath;
};

export default function TeamFilter() {
  const [open, setOpen] = useState(false);

  const [form] = Form.useForm<TeamFilterObject>();

  const { filter: filterObj, setFilter, optionen } = useJazzContext();

  useEffect(() => {
    form.setFieldsValue(filterObj);
  }, [filterObj, form]);

  const closeBooleanTagForProp = useCallback(
    (prop?: NamePath) => () => {
      if (prop) {
        form.setFieldValue(prop, undefined);
        setFilter(form.getFieldsValue(true));
      }
    },
    [form, setFilter],
  );

  const closePropTag = useCallback(
    (label: string, prop?: NamePath) => () => {
      const values = filter(form.getFieldValue(prop), (value: string) => value !== label);
      form.setFieldValue(prop, values);
      setFilter(form.getFieldsValue(true));
    },
    [form, setFilter],
  );

  const eventTypTag = useCallback(
    (typ: string) => {
      const result = find(optionen.typenPlus, ["name", typ]);
      if (result) {
        return { label: result.name, color: result.color, prop: ["kopf", "eventTyp"] };
      }
      return undefined;
    },
    [optionen.typenPlus],
  );

  function headerTagsForFilters(labelsColors: LabelColorProperty[]) {
    function HeaderTag({ label, color, prop }: LabelColorProperty) {
      return isBoolean(color) ? (
        <Tag closeIcon={!!prop} color={color ? "success" : "error"} key={label} onClose={closeBooleanTagForProp(prop)}>
          {label}
        </Tag>
      ) : (
        <Tag closeIcon color={color} key={label} onClose={closePropTag(label, prop)}>
          {label}
        </Tag>
      );
    }
    return map(labelsColors, (tag) => <HeaderTag color={tag.color} key={tag.label} label={tag.label} prop={tag.prop} />);
  }

  const teamFilter = withoutNullOrUndefinedStrippedBy(filterObj);

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
    const eventTypTags = map(teamFilter.kopf?.eventTyp, (typ: string) => eventTypTag(typ)!);
    const bookerTags = map(teamFilter.booker, (booker: string) => ({ label: booker, color: "blue", prop: "booker" }));
    return tags.concat(eventTypTags).concat(bookerTags);
  }, [eventTypTag, teamFilter]);

  const result = [
    <span key="aktiveFilter">
      <ButtonWithIcon alwaysText onClick={() => setOpen(true)} size="small" text="Filter..." type="default" />
      <TeamFilterEdit form={form} open={open} setOpen={setOpen} />
    </span>,
  ];
  if (!isEmpty(taggies)) {
    result.push(
      <ButtonWithIcon
        alwaysText
        key="resetFilter"
        onClick={() => {
          reset(form);
          setFilter(form.getFieldsValue(true));
        }}
        size="small"
        text="Zurücksetzen"
        type="default"
      />,
    );
  }
  result.push(...headerTagsForFilters(taggies));
  return result;
}
