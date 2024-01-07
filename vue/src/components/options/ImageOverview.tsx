import { PageHeader } from "@ant-design/pro-layout";
import * as React from "react";
import { useEffect, useState } from "react";
import { App, Col, Form, Row } from "antd";
import { SaveButton } from "@/components/colored/JazzButtons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { imagenames as imagenamesQuery, saveImagenames, veranstaltungenForTeam } from "@/commons/loader.ts";
import Veranstaltung, { ImageOverviewRow, ImageOverviewVeranstaltung } from "jc-shared/veranstaltung/veranstaltung";
import uniq from "lodash/uniq";
import flatten from "lodash/flatten";
import intersection from "lodash/intersection";
import differenceBy from "lodash/differenceBy";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { TextField } from "@/widgets/TextField";
import { Link } from "react-router-dom";
import FormItem from "antd/es/form/FormItem";
import { NamePath } from "rc-field-form/es/interface";

export default function ImageOverview() {
  const imagesQuery = useQuery({
    queryKey: ["imagenames"],
    queryFn: imagenamesQuery,
  });
  const veranstaltungenQuery = useQuery({
    queryKey: ["veranstaltungenAlle"],
    queryFn: () => veranstaltungenForTeam("alle"),
  });
  const [imagenames, setImagenames] = useState<string[]>([]);
  const [veranstaltungen, setVeranstaltungen] = useState<ImageOverviewVeranstaltung[]>([]);
  const [form] = Form.useForm<{
    with: ImageOverviewRow[];
    notFound: ImageOverviewRow[];
    unused: ImageOverviewRow[];
  }>();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const mutateImages = useMutation({
    mutationFn: saveImagenames,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imagenames"] });
      notification.success({
        message: "Speichern erfolgreich",
        description: "Die Änderungen wurden gespeichert",
        placement: "topLeft",
        duration: 3,
      });
    },
  });

  document.title = "Bilder bearbeiten";
  function suitableForImageOverview(veranstaltung: Veranstaltung): ImageOverviewVeranstaltung {
    return {
      id: veranstaltung.id || "",
      startDate: veranstaltung.startDatumUhrzeit.tagMonatJahrKompakt,
      titel: veranstaltung.kopf.titel,
      url: veranstaltung.url ?? "",
      images: veranstaltung.presse.image,
    };
  }

  useEffect(() => {
    if (imagesQuery.data) {
      setImagenames(imagesQuery.data);
    }
  }, [imagesQuery.data]);

  useEffect(() => {
    if (veranstaltungenQuery.data) {
      setVeranstaltungen(veranstaltungenQuery.data.map(suitableForImageOverview));
    }
  }, [veranstaltungenQuery.data]);

  useEffect(
    () => {
      function convertString(a: string): string {
        return a.replace(/\s/g, "_");
      }
      if (veranstaltungenQuery.data) {
        const elementsWithImage = (imageName: string): ImageOverviewVeranstaltung[] => {
          return veranstaltungen.filter((each) => each.images.find((i) => i.localeCompare(imageName) === 0));
        };

        const imagenamesOfVeranstaltungen = uniq(flatten(veranstaltungen.map((each) => each.images))).sort();

        const imagesWithVeranstaltungen: ImageOverviewRow[] = intersection(imagenames, imagenamesOfVeranstaltungen).map((im) => {
          return {
            image: im,
            newname: im,
            veranstaltungen: elementsWithImage(im),
          };
        });
        const imagesWithVeranstaltungenUnused: ImageOverviewRow[] = differenceBy(
          imagenames,
          imagenamesOfVeranstaltungen,
          convertString,
        ).map((im) => {
          return {
            image: im,
            newname: im,
            veranstaltungen: elementsWithImage(im),
          };
        });
        const imagesWithVeranstaltungenNotFound: ImageOverviewRow[] = differenceBy(
          imagenamesOfVeranstaltungen,
          imagenames,
          convertString,
        ).map((im) => {
          return {
            image: im,
            newname: im,
            veranstaltungen: elementsWithImage(im),
          };
        });
        form.setFieldsValue({
          with: imagesWithVeranstaltungen,
          notFound: imagesWithVeranstaltungenNotFound,
          unused: imagesWithVeranstaltungenUnused,
        });
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, veranstaltungen],
  );

  function saveForm() {
    const formValues = form.getFieldsValue(true);
    const changedRows = formValues.with
      .filter((v: ImageOverviewRow) => v.newname !== v.image)
      .concat(formValues.notFound.filter((v: ImageOverviewRow) => v.newname !== v.image))
      .concat(formValues.unused.filter((v: ImageOverviewRow) => v.newname !== v.image));
    form.validateFields().then(async () => {
      mutateImages.mutate(changedRows);
    });
  }

  return (
    <Form form={form} onFinish={saveForm}>
      <PageHeader title="Bilder bearbeiten" extra={[<SaveButton key="save" />]} />
      <Row gutter={12}>
        <Col span={24}>
          <Section prefix="with" title="Bilder ohne Probleme" />
          <Section prefix="unused" title="Unbenutzte Bilder" />
          <Section prefix="notFound" title="Nicht gefundene Bilder" />
        </Col>
      </Row>
    </Form>
  );

  function Section({ prefix, title }: { prefix: string; title: string }) {
    return (
      <CollapsibleForVeranstaltung suffix="allgemeines" label={title}>
        <Form.List name={prefix}>
          {(fields) => (
            <>
              {fields.map((field) => {
                return (
                  <Row key={field.key} gutter={12}>
                    <Col span={12}>
                      <TextField name={[field.name.toString(), "newname"]} label={undefined} />
                    </Col>

                    <Col span={12}>
                      <VeranstaltungenRenderer name={[field.name.toString(), "veranstaltungen"]} />
                    </Col>
                  </Row>
                );
              })}
            </>
          )}
        </Form.List>
      </CollapsibleForVeranstaltung>
    );
  }

  function VeranstaltungenRenderer({ name }: { name: NamePath }) {
    function InnerVeranstaltungenRenderer({ veranstaltungen }: { veranstaltungen?: ImageOverviewVeranstaltung[] }) {
      return veranstaltungen!.map((v) => (
        <p key={v.id}>
          <b>
            <Link
              to={{
                pathname: `/veranstaltung/${v.url}`,
                search: "page=presse",
              }}
            >
              {v.titel}
            </Link>
          </b>{" "}
          {v.startDate}
        </p>
      ));
    }

    return (
      <FormItem name={name} valuePropName="veranstaltungen" trigger={"onText"}>
        <InnerVeranstaltungenRenderer />
      </FormItem>
    );
  }
}
