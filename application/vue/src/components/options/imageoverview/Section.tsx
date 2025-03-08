import { NamePath } from "rc-field-form/es/interface";
import { Link } from "react-router";
import FormItem from "antd/es/form/FormItem";
import * as React from "react";
import { Button, Col, ConfigProvider, Form, Popover } from "antd";
import { TextField } from "@/widgets/TextField.tsx";
import { ImageOverviewVeranstaltung } from "jc-shared/konzert/konzert.ts";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import Collapsible from "@/widgets/Collapsible.tsx";
import JazzImage from "@/widgets/JazzImage.tsx";

export type kindOfSection = "with" | "unused" | "notFound";

function VeranstaltungenRenderer({ name }: { readonly name: NamePath }) {
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
        </b>
        ({v.startDate}){index !== veranstaltungen!.length - 1 ? ", " : ""}
      </span>
    ));
  }

  return (
    <ConfigProvider theme={{ components: { Form: { itemMarginBottom: 0 } } }}>
      <FormItem name={name} trigger="onText" valuePropName="veranstaltungen">
        <InnerVeranstaltungenRenderer />
      </FormItem>
    </ConfigProvider>
  );
}

function ImagePreview({ value }: { readonly value?: string }) {
  return (
    <Popover content={<JazzImage img={value ?? ""} width="400px" />} placement="rightTop" trigger="click">
      <Button type="dashed">Vorschau</Button>
    </Popover>
  );
}

export function Section({
  prefix,
  title,
  noOfImages,
}: {
  readonly prefix: kindOfSection;
  readonly title: string;
  readonly noOfImages: number;
}) {
  return (
    <Collapsible amount={noOfImages ?? "..."} label={title} noMoneySign noTopBorder suffix="gaeste" uncollapsed>
      <ConfigProvider theme={{ components: { Form: { itemMarginBottom: 0 } } }}>
        <Form.List name={prefix}>
          {(fields) =>
            map(fields, (field) => {
              return (
                <JazzRow key={field.key}>
                  <Col span={10}>
                    <TextField label={undefined} name={[field.name.toString(), "newname"]} />
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
