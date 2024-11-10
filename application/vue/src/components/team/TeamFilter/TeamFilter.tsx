import React, { useEffect, useMemo, useState } from "react";
import { Form, Tag } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { TeamFilterObject } from "./applyTeamFilter.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import isNil from "lodash/isNil";
import { withoutNullOrUndefinedStrippedBy } from "jc-shared/commons/comparingAndTransforming.ts";
import isEmpty from "lodash/isEmpty";
import { NamePath } from "rc-field-form/es/interface";
import { reset, TeamFilterEdit } from "@/components/team/TeamFilter/TeamFilterEdit.tsx";

type LabelColorProperty = {
  label: string;
  color: boolean;
  prop?: NamePath;
};

export default function TeamFilter() {
  const [open, setOpen] = useState(false);

  const [form] = Form.useForm<TeamFilterObject>();

  const { filter: filterObj, setFilter } = useJazzContext();

  useEffect(() => {
    form.setFieldsValue(filterObj);
  }, [filterObj, form]);

  function headerTagsForFilters(labelsColors: LabelColorProperty[]) {
    function HeaderTag({ label, color, prop }: LabelColorProperty) {
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
    }
    return labelsColors.map((tag) => <HeaderTag key={tag.label} label={tag.label} color={tag.color} prop={tag.prop} />);
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
    return tags;
  }, [filter]);

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
