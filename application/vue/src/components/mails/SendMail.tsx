import { useQueries } from "@tanstack/react-query";
import { konzerteForTeam, mailRules as mailRulesRestCall, sendMail } from "@/rest/loader.ts";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Form, Row, Tag, Typography, UploadFile } from "antd";
import { SendButton } from "@/components/colored/JazzButtons";
import MailRule from "jc-shared/mail/mailRule";
import User, { ABENDKASSE, BOOKING, KannSection, ORGA, SUPERUSERS, userGruppen } from "jc-shared/user/user";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import VeranstaltungFormatter from "jc-shared/veranstaltung/VeranstaltungFormatter.ts";
import { TextField } from "@/widgets/TextField";
import Users, { Mailingliste } from "jc-shared/user/users";
import uniqBy from "lodash/uniqBy";
import sortBy from "lodash/sortBy";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useNavigate } from "react-router";
import { MarkdownEditor } from "@/widgets/markdown/MarkdownEditor.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import UploaderForMail from "@/widgets/UploaderForMail.tsx";
import { RcFile } from "antd/es/upload";
import { useWatch } from "antd/es/form/Form";
import MitarbeiterMultiSelect from "@/widgets/MitarbeiterMultiSelect.tsx";
import MailMessage from "jc-shared/mail/mailMessage.ts";
import isString from "lodash/isString";
import map from "lodash/map";
import sortedUniq from "lodash/sortedUniq";
import forEach from "lodash/forEach";
import filter from "lodash/filter";
import Konzert from "jc-shared/konzert/konzert.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import "./sendmail.css";
import ScrollingContent from "@/components/content/ScrollingContent.tsx";

function mailAddressOrStringAsText(addressOrString: string | { name: string; address: string }) {
  if (isString(addressOrString)) {
    return addressOrString;
  }
  return addressOrString.name ?? addressOrString.address;
}

export default function SendMail() {
  const { showSuccess } = useJazzContext();

  const navigate = useNavigate();

  const { mailRules, veranstaltungen } = useQueries({
    queries: [
      { queryKey: ["konzert", "zukuenftige"], queryFn: () => konzerteForTeam("zukuenftige") },
      { queryKey: ["mailRules"], queryFn: mailRulesRestCall },
    ],
    combine: ([a, b]) => {
      if (a?.data && b?.data) {
        return { mailRules: b.data, veranstaltungen: a.data };
      }
      return { mailRules: [], veranstaltungen: [] };
    },
  });

  const { allUsers } = useJazzContext();

  const users = useMemo(() => new Users(allUsers), [allUsers]);

  const usersAsOptions = useMemo(() => map(allUsers, "asUserAsOption"), [allUsers]);

  const mailingLists = useMemo(() => users.mailinglisten, [users]);

  const mailingListsDescriptions = useMemo(() => sortBy(map(mailingLists, "name")), [mailingLists]);

  const rulesDescriptions = useMemo(() => sortedUniq(map(mailRules, "name")), [mailRules]);

  const kannFilter = useMemo(() => ["Kasse", "Ton", "Licht", "Master", "Ersthelfer"], []);

  const veranstaltungenDescriptions = useMemo(
    () => map(veranstaltungen, (v) => new VeranstaltungFormatter(v).description),
    [veranstaltungen],
  );

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedLists, setSelectedLists] = useState<Mailingliste[]>([]);
  const [selectedRules, setSelectedRules] = useState<MailRule[]>([]);

  const [effectiveUsers, setEffectiveUsers] = useState<{ name: string; email: string }[]>([]);

  const [dirty, setDirty] = useState<boolean>(false);
  document.title = "Mail Senden";

  const [form] = Form.useForm<{
    subject: string;
    markdown: string;
    selectedRules: string[];
    selectedVeranstaltungen: string[];
    selectedLists: string[];
    selectedUsers: string[];
    selectedUserGruppen: string[];
    selectedKann: string[];
  }>();

  const initializeForm = useCallback(() => {
    document.title = "Manuelle Nachricht";
    form.setFieldsValue({
      subject: "",
      markdown: "",
      selectedRules: [],
      selectedVeranstaltungen: [],
      selectedLists: [],
      selectedUsers: [],
      selectedUserGruppen: [],
      selectedKann: [],
    });
    form.validateFields();
  }, [form]);

  useEffect(initializeForm, [initializeForm]);

  const selectedVeranstaltungenInForm = useWatch("selectedVeranstaltungen", { form });
  const selectedRulesInForm = useWatch("selectedRules", { form });
  const selectedListsInForm = useWatch("selectedLists", { form });
  const selectedUsersInForm = useWatch("selectedUsers", { form });
  const selectedUserGruppenInForm = useWatch("selectedUserGruppen", { form }) as (
    | typeof SUPERUSERS
    | typeof ORGA
    | typeof BOOKING
    | typeof ABENDKASSE
  )[];
  const selectedKannInForm = useWatch("selectedKann", { form }) as KannSection[];
  const subject = useWatch("subject", { form });

  useEffect(() => {
    setSelectedUsers(filter(allUsers, (user) => selectedUsersInForm?.includes(user.id)));
    setSelectedLists(filter(mailingLists, (list) => selectedListsInForm?.includes(list.name)));
    setSelectedRules(filter(mailRules, (rule) => selectedRulesInForm?.includes(rule.name)));
    if ((selectedVeranstaltungenInForm?.length || 0) > 0 && subject === "") {
      form.setFieldValue("subject", "Veranstaltungen für ...");
    }
  }, [
    allUsers,
    selectedUsersInForm,
    selectedRulesInForm,
    selectedListsInForm,
    mailingLists,
    mailRules,
    selectedVeranstaltungenInForm,
    subject,
    form,
  ]);

  useEffect(() => {
    const userIdsFromLists = selectedLists.flatMap((list) => list.users);
    const usersFromLists = filter(allUsers, (user) => userIdsFromLists.includes(user.id));
    const allUsersFromListsAndUsers = map(selectedUsers.concat(usersFromLists), (user) => ({ name: user.name, email: user.email }));
    const allRuleUsers = map(selectedRules, (rule) => ({
      name: rule.name,
      email: rule.email,
    }));
    const usersFromKann = users.getUsersKannOneOf(selectedKannInForm);
    const usersFromUserGruppen = users.getUsersInGruppenExact(selectedUserGruppenInForm);
    setEffectiveUsers(
      sortBy(uniqBy(allRuleUsers.concat(allUsersFromListsAndUsers).concat(usersFromKann).concat(usersFromUserGruppen), "email"), "name"),
    );
  }, [selectedUsers, selectedLists, selectedRules, allUsers, selectedKannInForm, selectedUserGruppenInForm, users]);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const send = useCallback(() => {
    form.validateFields().then(async () => {
      const mail = form.getFieldsValue(true);
      const selectedVeranstaltungen = filter(veranstaltungen, (ver) =>
        mail.selectedVeranstaltungen.includes(new VeranstaltungFormatter(ver).description),
      ) as Konzert[];
      const addresses = map(effectiveUsers, (user) => MailMessage.formatEMailAddress(user.name, user.email));
      const markdownToSend =
        mail.markdown +
        "\n\n---\n" +
        map(selectedVeranstaltungen, (veranst) => new VeranstaltungFormatter(veranst).presseTextForMail(window.location.origin)).join(
          "\n\n---\n",
        );
      const result = new MailMessage({ subject: `[Jazzclub manuell] ${mail.subject}` });
      result.body = markdownToSend;
      result.bcc = addresses;
      const formData = new FormData();
      formData.append("message", JSON.stringify(result));
      forEach(fileList, (file) => {
        formData.append("dateien", file as RcFile, file.name);
      });
      const response = await sendMail(formData);

      const successMessage = (
        <>
          <p>Deine Mail wurde gesendet an:</p>
          <ul>
            {map(response.accepted, (each) => (
              <li key={mailAddressOrStringAsText(each)}>{mailAddressOrStringAsText(each)}</li>
            ))}
          </ul>
        </>
      );

      initializeForm();
      showSuccess({
        duration: 10,
        title: "Erfolgreich",
        text: successMessage,
      });
      navigate("/");
    });
  }, [form, veranstaltungen, effectiveUsers, fileList, initializeForm, showSuccess, navigate]);

  const onValuesChange = useCallback(() => {
    form
      .validateFields()
      .then((value) => setDirty(!!value.markdown))
      .catch((value) => setDirty(value.errorFields.length === 0 && !!value.values.markdown));
  }, [form]);

  return (
    <Form form={form} layout="vertical" onFinish={send} onValuesChange={onValuesChange}>
      <JazzPageHeader buttons={[<SendButton disabled={!dirty || effectiveUsers.length === 0} key="save" />]} title="Mail Senden" />
      <ScrollingContent>
        <RowWrapper>
          <JazzRow>
            <Col span={12}>
              <MultiSelectWithTags label="Veranstaltungen" name="selectedVeranstaltungen" noAdd options={veranstaltungenDescriptions} />
            </Col>
            <Col span={12}>
              <MultiSelectWithTags label="Empfänger (aus Regeln)" name="selectedRules" noAdd options={rulesDescriptions} />
            </Col>
          </JazzRow>
          <JazzRow>
            <Col span={12}>
              <MultiSelectWithTags label="Mailinglisten" name="selectedLists" noAdd options={mailingListsDescriptions} />
            </Col>
            <Col span={12}>
              <MitarbeiterMultiSelect label="Users" name="selectedUsers" usersAsOptions={usersAsOptions} />
            </Col>
          </JazzRow>
          <JazzRow>
            <Col span={12}>
              <MultiSelectWithTags label="Benutzer mit Typ" name="selectedUserGruppen" noAdd options={userGruppen} />
            </Col>
            <Col span={12}>
              <MultiSelectWithTags label="User kann..." name="selectedKann" noAdd options={kannFilter} />
            </Col>
          </JazzRow>
          <Row gutter={12} style={{ marginBottom: 12 }}>
            <Col span={24}>
              <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 0 }}>
                Effektive Adressen:
              </Typography.Title>
              {map(effectiveUsers, (u) => (
                <Tag color="purple" key={u.email}>
                  <b>{u.name}</b> ({u.email})
                </Tag>
              ))}
            </Col>
          </Row>
          <JazzRow>
            <Col span={24}>
              <TextField label="Subject" name="subject" required />
            </Col>
            <Col span={24}>
              <MarkdownEditor label={<b>Anschreiben:</b>} name="markdown" />
            </Col>
            <Col span={24}>
              <UploaderForMail fileList={fileList} setFileList={setFileList} />
            </Col>
          </JazzRow>
        </RowWrapper>
      </ScrollingContent>
    </Form>
  );
}
