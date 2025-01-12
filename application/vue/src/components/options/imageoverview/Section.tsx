import { NamePath } from "rc-field-form/es/interface";
import { Link } from "react-router";
import FormItem from "antd/es/form/FormItem";
import * as React from "react";
import { useState } from "react";
import { Button, Col, Collapse, Form, Image, Popover, Row, Space, theme, Typography } from "antd";
import { TextField } from "@/widgets/TextField.tsx";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import ButtonForImagePreview from "@/components/veranstaltung/presse/ButtonForImagePreview.tsx";
import { imgFullsize } from "@/commons/loader.ts";
import { ImageOverviewVeranstaltung } from "jc-shared/konzert/konzert.ts";
import map from "lodash/map";

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
    <FormItem name={name} valuePropName="veranstaltungen" trigger={"onText"} style={{ marginBottom: 0 }}>
      <InnerVeranstaltungenRenderer />
    </FormItem>
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

  const { token } = theme.useToken();

  const [expanded, setExpanded] = useState<boolean>(false);
  return (
    <Collapse
      className="monat-header"
      style={{ backgroundColor: token.colorPrimary }}
      activeKey={expanded ? prefix : undefined}
      onChange={() => {
        setExpanded(!expanded);
      }}
      expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
      items={[
        {
          key: prefix,
          label: (
            <Typography.Title level={4} style={{ margin: 0, color: "#FFF" }}>
              {title}
            </Typography.Title>
          ),
          extra: (
            <Typography.Title level={4} style={{ margin: 0, color: "#FFF" }}>
              ({noOfImages || "..."})
            </Typography.Title>
          ),
          children: (
            <Form.List name={prefix}>
              {(fields) =>
                map(fields, (field) => {
                  return (
                    <Row key={field.key} gutter={12}>
                      <Col span={10}>
                        <TextField name={[field.name.toString(), "newname"]} label={undefined} />
                      </Col>
                      <Col span={2}>
                        {prefix !== "notFound" && (
                          <FormItem name={[field.name.toString(), "newname"]} style={{ marginBottom: 0 }}>
                            <ImagePreview />
                          </FormItem>
                        )}
                      </Col>
                      <Col span={12}>
                        <VeranstaltungenRenderer name={[field.name.toString(), "veranstaltungen"]} />
                      </Col>
                    </Row>
                  );
                })
              }
            </Form.List>
          ),
        },
      ]}
    />
  );
}
