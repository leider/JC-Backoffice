/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Row, Tooltip } from "antd";
import { StoreValue } from "rc-field-form/lib/interface";
import React, { FunctionComponent, useEffect } from "react";

import OrrpTableActions, { ActionCallbacks } from "./OrrpTableActions";
import { addInitialValueFromObjectToColDescs, getCollectionHeightsInPixel, isDuplicate } from "./collectionHelpers";
import { HeaderColumn } from "./headerColumn/HeaderColumn";
import { calcSpans, createKey } from "./inlineCollectionEditableHelpers";
import { TOrrpInlineCollectionEditable } from "./IOrrpInlineCollectionEditable";
import { ColDescWithIdx } from "./types";
import { WidgetColumn } from "./widgetColumn/WidgetColumn";

/**
 * An editable collection table.
 * @param {TOrrpInlineCollectionEditable} props
 * @return {*}  {JSX.Element}
 */
const OrrpInlineCollectionEditable: FunctionComponent<TOrrpInlineCollectionEditable> = (
  props: TOrrpInlineCollectionEditable,
): JSX.Element => {
  if ("columnDescriptions" in props) {
    addInitialValueFromObjectToColDescs(props.columnDescriptions, props.initialValue);
  }

  const colDescriptors: ColDescWithIdx[] = props.columnDescriptions.map((d, idx) => ({ ...d, idx }));
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
        props.required && name === 0
          ? undefined
          : {
              callback: () => {
                remove(name);
                props.onChange?.("CHANGED");
              },
            },
      empty: props.required && name === 0 ? "dummy" : undefined,
      copy: () => {
        const selected = props.form.getFieldValue(props.embeddedArrayPath.concat([name.toString(10)]));
        add({ ...selected, id: `${selected.id}copy` }, name);
        props.onChange?.("CHANGED");
      },
    };
  }

  const emptyArray = props.embeddedArrayPath.reduceRight((prev: any, curr) => {
    const result: any = {};
    result[curr] = prev;
    return result;
  }, []);

  useEffect(
    () => {
      if (props.clearOnDisabled && props.disabled) {
        props.form.setFieldsValue(emptyArray);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.disabled, props.clearOnDisabled],
  );

  return (
    <Form.Item label={props.label} style={{ flexWrap: "nowrap" }}>
      <Form.List name={props.embeddedArrayPath} initialValue={props.initialValue} rules={props.rules}>
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
                          data-testid={`${props.embeddedArrayPath.join("_")}_add`}
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            add();
                            props.onChange?.("CHANGED");
                          }}
                          disabled={!!props.maxRows && fields.length >= (props.maxRows || 0)}
                        />
                      </Tooltip>
                      <Button type="text" key={"dummyHeader"} icon={<PlusOutlined style={{ color: "#FFF" }} />} />
                    </>
                  </Col>
                }
              </Row>

              <div
                style={{
                  maxHeight: props.height
                    ? // Todo: It would be great to have the top part dynamically, buut, it brings rerender issues
                      `${getCollectionHeightsInPixel(props.height) - 60}px`
                    : props.maxHeight,
                  overflowX: "hidden",
                  overflowY: props.maxHeight ? "auto" : "initial",
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
                      let uniqueValuesValidator;
                      if (desc.uniqueValues) {
                        uniqueValuesValidator = {
                          validator: (_: any, value: any) => {
                            const fieldsValue = props.form.getFieldsValue(props.embeddedArrayPath);
                            const dupes = isDuplicate(props.embeddedArrayPath, desc.fieldName, fieldsValue, value);
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
                          disabled={props.disabled || desc.disabled}
                          uniqueValuesValidator={uniqueValuesValidator}
                        />
                      );
                    })}
                    <Col key={createKey(actionColDesc, key)} flex={"none"}>
                      <OrrpTableActions
                        actions={createCallbacks(name, remove, add)}
                        testid={`${props.embeddedArrayPath.join("_")}_${key}`}
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
    </Form.Item>
  );
};

export default OrrpInlineCollectionEditable;
