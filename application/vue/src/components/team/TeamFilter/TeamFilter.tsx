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

type LabelColorProperty = {
  label: string;
  color: boolean | string;
  prop?: NamePath;
};

export default function TeamFilter() {
  const [open, setOpen] = useState(false);

  const [form] = Form.useForm<TeamFilterObject>();

  const { filter: filterObj, setFilter, optionen } = useJazzContext();

  useEffect(() => {
    form.setFieldsValue(filterObj);
  }, [filterObj, form]);

  const eventTypTag = useCallback(
    (typ: string) => {
      const result = find(optionen.typenPlus, ["name", typ]);
      if (result) {
        return { label: result.name, color: result.color };
      }
      return undefined;
    },
    [optionen.typenPlus],
  );

  function headerTagsForFilters(labelsColors: LabelColorProperty[]) {
    function HeaderTag({ label, color, prop }: LabelColorProperty) {
      if (isBoolean(color)) {
        return (
          <Tag
            key={label}
            color={color ? "success" : "error"}
            closeIcon={!!prop}
            onClose={() => {
              if (prop) {
                form.setFieldValue(prop, undefined);
                setFilter(form.getFieldsValue(true));
              }
            }}
          >
            {label}
          </Tag>
        );
      } else {
        return (
          <Tag
            key={label}
            color={color}
            closeIcon
            onClose={() => {
              const typen = form.getFieldValue(["kopf", "eventTyp"]).filter((typ: string) => typ !== label);
              form.setFieldValue(["kopf", "eventTyp"], typen);
              setFilter(form.getFieldsValue(true));
            }}
          >
            {label}
          </Tag>
        );
      }
    }
    return map(labelsColors, (tag) => <HeaderTag key={tag.label} label={tag.label} color={tag.color} prop={tag.prop} />);
  }

  const filter = withoutNullOrUndefinedStrippedBy(filterObj);

  const taggies = useMemo(() => {
    function pushIfSet(att: boolean | undefined, label: string, prop?: NamePath) {
      if (!isNil(att)) {
        tags.push({ label, color: att, prop });
      }
    }
    const tags: LabelColorProperty[] = [];
    if (!isNil(filter.istKonzert)) {
      tags.push(
        filter.istKonzert
          ? { label: "nur Konzerte", color: true, prop: "istKonzert" }
          : { label: "nur Vermietungen", color: true, prop: "istKonzert" },
      );
    }
    pushIfSet(filter.hotelBestaetigt, "Hotel bestätigt", "hotelBestaetigt");
    pushIfSet(filter.kopf?.confirmed, "Ist bestätigt", ["kopf", "confirmed"]);
    pushIfSet(filter.kopf?.abgesagt, "Ist abgesagt", ["kopf", "abgesagt"]);
    pushIfSet(filter.presse?.checked, "Presse OK", ["presse", "checked"]);
    pushIfSet(filter.kopf?.kannAufHomePage, "Kann Homepage", ["kopf", "kannAufHomePage"]);
    pushIfSet(filter.kopf?.kannInSocialMedia, "Kann Social Media", ["kopf", "kannInSocialMedia"]);
    pushIfSet(filter.presse?.text, "Text vorhanden", ["presse", "text"]);
    pushIfSet(filter.presse?.originalText, "Originaltext vorhanden", ["presse", "originalText"]);
    pushIfSet(filter.kopf?.fotografBestellen, "Fotograf einladen", ["kopf", "fotografBestellen"]);
    pushIfSet(filter.technik?.checked, "Technik ist geklärt", ["technik", "checked"]);
    pushIfSet(filter.technik?.fluegel, "Flügel stimmen", ["technik", "fluegel"]);
    (filter.kopf?.eventTyp ?? []).forEach((typ: string) => {
      tags.push(eventTypTag(typ)!);
    });
    return tags;
  }, [eventTypTag, filter]);

  const result = [
    <span key="aktiveFilter">
      <ButtonWithIcon alwaysText type="default" size="small" text="Filter..." onClick={() => setOpen(true)} />
      <TeamFilterEdit form={form} setOpen={setOpen} open={open} />
    </span>,
  ];
  if (!isEmpty(taggies)) {
    result.push(
      <ButtonWithIcon
        alwaysText
        type="default"
        size="small"
        key="resetFilter"
        text="Zurücksetzen"
        onClick={() => {
          reset(form);
          setFilter(form.getFieldsValue(true));
        }}
      />,
    );
  }
  result.push(...headerTagsForFilters(taggies));
  return result;
}
