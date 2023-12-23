/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Row, Tooltip } from "antd";
import { StoreValue, ValidatorRule } from "rc-field-form/lib/interface";
import React, { FC, useEffect } from "react";

import InlineEditableActions, { ActionCallbacks } from "./InlineEditableActions.tsx";
import { HeaderColumn } from "./headerColumn/HeaderColumn";
import {
  addInitialValueFromObjectToColDescs,
  calcSpans,
  createKey,
  getCollectionHeightsInPixel,
  isDuplicate,
} from "./inlineCollectionEditableHelpers";
import { ColDescWithIdx, CollectionColDesc, CollectionHeight } from "./types";
import { WidgetColumn } from "./widgetColumn/WidgetColumn";
import { Rule } from "antd/es/form";

interface IInlineCollectionEditable {
  /**
   * Array that describes the path in the form object
   * leading to this field.
   */
  embeddedArrayPath: string[];

  /**
   * Antd's form
   */
  form: FormInstance;

  /**
   * The initial value of the field
   */
  initialValue?: any;

  /**
   * The text label of the field
   */
  label?: string;

  /**
   * Whether or not this field is required
   */
  required?: boolean;

  /**
   * number of allowed columns
   */
  maxRows?: number;

  /**
   * Whether or not this field is disabled (no plus sign)
   */
  disabled?: boolean;

  /**
   * Whether or not this field will be emptied on disable
   */
  clearOnDisabled?: boolean;

  /**
   * A fixed max height
   */
  maxHeight?: string;

  /**
   * The standardized height of the component
   */
  height?: CollectionHeight;

  /**
   * optional callback for changes;
   * @param value
   */
  onChange?: (value: any) => void;

  /**
   * List of rules to be checked on "submit". Example see "HaircutModal.tsx"
   * @type {ValidatorRule[]}
   * @memberof CommonParams
   */
  rules?: ValidatorRule[] /**
   * What the columns look like
   */;
  columnDescriptions: CollectionColDesc[];
}

/**
 * An editable collection table.
 * @param {IInlineCollectionEditable} props
 * @return {*}  {React.ReactElement}
 */
const InlineCollectionEditable: FC<IInlineCollectionEditable> = ({
  initialValue,
  disabled,
  clearOnDisabled,
  label,
  form,
  onChange,
  embeddedArrayPath,
  height,
  maxHeight,
  maxRows,
  required,
  rules,
  columnDescriptions,
}: IInlineCollectionEditable): React.ReactElement => {
  addInitialValueFromObjectToColDescs(columnDescriptions, initialValue);

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
      delete:
        required && name === 0
          ? undefined
          : {
              callback: () => {
                remove(name);
                onChange?.("CHANGED");
              },
            },
      empty: required && name === 0 ? "dummy" : undefined,
      copy: () => {
        const selected = form.getFieldValue(embeddedArrayPath.concat([name.toString(10)]));
        add({ ...selected, id: `${selected.id}copy` }, name);
        onChange?.("CHANGED");
      },
    };
  }

  const emptyArray = embeddedArrayPath.reduceRight((prev: any, curr) => {
    const result: any = {};
    result[curr] = prev;
    return result;
  }, []);

  useEffect(
    () => {
      if (clearOnDisabled && disabled) {
        form.setFieldsValue(emptyArray);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, clearOnDisabled],
  );

  return (
    <>
      {label && <Form.Item label={label} style={{ flexWrap: "nowrap" }} />}
      <Form.List name={embeddedArrayPath} initialValue={initialValue} rules={rules}>
        {(fields, { add, remove }, { errors }) => {
          return (
            <>
              <Row key={-1} gutter={8} wrap={false}>
                {colDescriptors.map((desc) => (
                  <HeaderColumn desc={desc} colSpans={colSpans} key={createKey(desc, -1)} />
                ))}
                {
                  <Col key={createKey(actionColDesc, -1)} flex={"none"}>
                    <>
                      <Tooltip title="Neu">
                        <Button
                          data-testid={`${embeddedArrayPath.join("_")}_add`}
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            add({}, 0);
                            onChange?.("CHANGED");
                          }}
                          disabled={!!maxRows && fields.length >= (maxRows || 0)}
                        />
                      </Tooltip>
                      <Button type="text" key={"dummyHeader"} icon={<PlusOutlined style={{ color: "#FFF" }} />} />
                    </>
                  </Col>
                }
              </Row>

              <div
                style={{
                  maxHeight: height
                    ? // Todo: It would be great to have the top part dynamically, buut, it brings rerender issues
                      `${getCollectionHeightsInPixel(height) - 60}px`
                    : maxHeight,
                  overflowX: "hidden",
                  overflowY: maxHeight ? "auto" : "initial",
                }}
              >
                {fields.map(({ key, name }) => (
                  <Row
                    wrap={false}
                    key={key}
                    gutter={8}
                    style={{ marginBottom: "0.2em" }}
                    data-testid={`orp-inline-collection-editable-row-${key}`}
                  >
                    {colDescriptors.map((desc) => {
                      let uniqueValuesValidator: Rule | undefined;
                      if (desc.uniqueValues) {
                        uniqueValuesValidator = {
                          validator: (_: any, value: any) => {
                            const fieldsValue = form.getFieldsValue(embeddedArrayPath);
                            const dupes = isDuplicate(embeddedArrayPath, desc.fieldName, fieldsValue, value);
                            return !dupes ? Promise.resolve() : Promise.reject(new Error("Doppelter Wert"));
                          },
                        };
                      }
                      return (
                        <WidgetColumn
                          desc={desc}
                          name={name}
                          key={createKey(desc, name)}
                          colSpans={colSpans}
                          disabled={disabled || desc.disabled}
                          uniqueValuesValidator={uniqueValuesValidator}
                        />
                      );
                    })}
                    <Col key={createKey(actionColDesc, key)} flex={"none"}>
                      <InlineEditableActions
                        actions={createCallbacks(name, remove, add)}
                        testid={`${embeddedArrayPath.join("_")}_${key}`}
                      />
                    </Col>
                  </Row>
                ))}
              </div>
              <Form.ErrorList errors={errors} />
            </>
          );
        }}
      </Form.List>
    </>
  );
};

export default InlineCollectionEditable;
