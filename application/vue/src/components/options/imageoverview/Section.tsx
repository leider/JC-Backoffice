import { NamePath } from "rc-field-form/es/interface";
import { Link } from "react-router";
import FormItem from "antd/es/form/FormItem";
import * as React from "react";
import { Button, Col, ConfigProvider, Form, Image, Popover, Space } from "antd";
import { TextField } from "@/widgets/TextField.tsx";
import ButtonForImagePreview from "@/components/veranstaltung/presse/ButtonForImagePreview.tsx";
import { imgFullsize } from "@/commons/loader.ts";
import { ImageOverviewVeranstaltung } from "jc-shared/konzert/konzert.ts";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import Collapsible from "@/widgets/Collapsible.tsx";

export type kindOfSection = "with" | "unused" | "notFound";

function VeranstaltungenRenderer({ name }: { name: NamePath }) {
  function InnerVeranstaltungenRenderer({ veranstaltungen }: { veranstaltungen?: ImageOverviewVeranstaltung[] }) {
    return map(veranstaltungen, (v, index) => (
      <span key={v.id}>
        <b>
          <Link
            to={{
              pathname: `/konzert/${v.url}`,
              search: "page=presse",
            }}
          >
            {v.titel}
          </Link>
        </b>{" "}
        ({v.startDate}){index !== veranstaltungen!.length - 1 ? ", " : ""}
      </span>
    ));
  }

  return (
    <ConfigProvider theme={{ components: { Form: { itemMarginBottom: 0 } } }}>
      <FormItem name={name} valuePropName="veranstaltungen" trigger="onText">
        <InnerVeranstaltungenRenderer />
      </FormItem>
    </ConfigProvider>
  );
}

export function Section({ prefix, title, noOfImages }: { prefix: kindOfSection; title: string; noOfImages: number }) {
  function ImagePreview({ value }: { value?: string }) {
    return (
      <Popover
        trigger="click"
        placement="rightTop"
        content={
          <Image
            key={value}
            src={`/imagepreview/${value}`}
            width="400px"
            preview={{
              src: `/upload/${value}`,
              toolbarRender: (_, { transform: { scale }, actions: { onZoomOut, onZoomIn } }) => (
                <Space size={12} className="toolbar-wrapper">
                  <ButtonForImagePreview icon="Download" onClick={() => imgFullsize(value)} />
                  <ButtonForImagePreview icon="ZoomOut" onClick={onZoomOut} disabled={scale === 1} />
                  <ButtonForImagePreview icon="ZoomIn" onClick={onZoomIn} disabled={scale === 50} />
                </Space>
              ),
            }}
          />
        }
      >
        <Button type="dashed">Vorschau</Button>
      </Popover>
    );
  }

  return (
    <Collapsible suffix="gaeste" label={title} noTopBorder uncollapsed amount={noOfImages ?? "..."} noMoneySign>
      <ConfigProvider theme={{ components: { Form: { itemMarginBottom: 0 } } }}>
        <Form.List name={prefix}>
          {(fields) =>
            map(fields, (field) => {
              return (
                <JazzRow key={field.key}>
                  <Col span={10}>
                    <TextField name={[field.name.toString(), "newname"]} label={undefined} />
                  </Col>
                  <Col span={2}>
                    {prefix !== "notFound" && (
                      <FormItem name={[field.name.toString(), "newname"]}>
                        <ImagePreview />
                      </FormItem>
                    )}
                  </Col>
                  <Col span={12}>
                    <VeranstaltungenRenderer name={[field.name.toString(), "veranstaltungen"]} />
                  </Col>
                </JazzRow>
              );
            })
          }
        </Form.List>
      </ConfigProvider>
    </Collapsible>
  );
}
