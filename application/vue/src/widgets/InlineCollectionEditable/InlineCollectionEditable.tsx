/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Col, Form, FormInstance, Row } from "antd";
import { StoreValue } from "rc-field-form/lib/interface";
import React, { FC } from "react";

import InlineEditableActions, { ActionCallbacks } from "./InlineEditableActions.tsx";
import { HeaderColumn } from "./headerColumn/HeaderColumn";
import { calcSpans, createKey, isDuplicate } from "./inlineCollectionEditableHelpers";
import { ColDescWithIdx, CollectionColDesc } from "./types";
import { WidgetColumn } from "./widgetColumn/WidgetColumn";
import { Rule } from "antd/es/form";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { NamePath } from "rc-field-form/es/interface";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";

export interface IInlineCollectionEditable {
  /**
   * Array that describes the path in the form object
   * leading to this field.
   */
  embeddedArrayPath: NamePath;

  /**
   * Antd's form
   */
  form: FormInstance;

  /**
   * What the columns look like
   */
  columnDescriptions: CollectionColDesc[];
  usersWithKann?: UserWithKann[];
}

/**
 * An editable collection table.
 * @param {IInlineCollectionEditable} props
 * @return {*}  {React.ReactElement}
 */
const InlineCollectionEditable: FC<IInlineCollectionEditable> = ({
  form,
  embeddedArrayPath,
  columnDescriptions,
}: IInlineCollectionEditable): React.ReactElement => {
  const colDescriptors: ColDescWithIdx[] = columnDescriptions.map((d, idx) => ({ ...d, idx }));
  const actionColDesc: ColDescWithIdx = {
    width: "xs",
    type: "basic",
    fieldName: "action",
    idx: colDescriptors.length,
  };

  const colSpans = calcSpans(colDescriptors.concat(actionColDesc));

  function createCallbacks(
    name: number,
    remove: (index: number | number[]) => void,
    add: (defaultValue?: StoreValue, insertIndex?: number) => void,
  ): ActionCallbacks {
    return {
      delete: () => {
        remove(name);
      },
      copy: () => {
        const selected = form.getFieldValue(embeddedArrayPath.concat([name.toString(10)]));
        add({ ...selected, id: `${selected.id}copy` }, name);
      },
    };
  }

  return (
    <Form.List name={embeddedArrayPath}>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            <Row key={-1} gutter={8} wrap={false}>
              {colDescriptors.map((desc) => (
                <HeaderColumn desc={desc} colSpans={colSpans} key={createKey(desc, -1)} />
              ))}
              <Col key={createKey(actionColDesc, -1)} flex={"none"}>
                <ButtonWithIcon
                  testid={`${embeddedArrayPath.join("_")}_add`}
                  type="text"
                  icon="PlusLg"
                  tooltipTitle="Neue Zeile"
                  onClick={() => {
                    add({}, 0);
                  }}
                  style={{ paddingTop: 0, paddingBlock: 0, height: "initial" }}
                />
                <Button type="text" style={{ cursor: "auto", paddingTop: 0, paddingBlock: 0, height: "initial" }} disabled />
              </Col>
            </Row>

            <div
              style={{
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              {fields.map(({ key, name }) => (
                <Row
                  wrap={false}
                  key={key}
                  gutter={8}
                  style={{ marginBottom: "0.2em" }}
                  data-testid={`${embeddedArrayPath.join("_")}row-${key}`}
                >
                  {colDescriptors.map((desc) => {
                    let uniqueValuesValidator: Rule | undefined;
                    if (desc.uniqueValues) {
                      uniqueValuesValidator = {
                        validator: (_: any, value: any) => {
                          const fieldsValue = form.getFieldsValue(embeddedArrayPath);
                          const dupes = isDuplicate(embeddedArrayPath, desc.fieldName as string, fieldsValue, value);
                          return !dupes ? Promise.resolve() : Promise.reject(new Error("Doppelter Wert"));
                        },
                      };
                    }
                    return (
                      <WidgetColumn
                        desc={desc}
                        name={name}
                        embeddedArrayPath={embeddedArrayPath}
                        key={createKey(desc, name)}
                        colSpans={colSpans}
                        disabled={desc.disabled}
                        uniqueValuesValidator={uniqueValuesValidator}
                      />
                    );
                  })}
                  <Col key={createKey(actionColDesc, key)} flex={"none"}>
                    <InlineEditableActions actions={createCallbacks(name, remove, add)} />
                  </Col>
                </Row>
              ))}
            </div>
            <Form.ErrorList errors={errors} />
          </>
        );
      }}
    </Form.List>
  );
};

export default InlineCollectionEditable;
