import { useQueries } from "@tanstack/react-query";
import { konzerteForTeam, mailRules as mailRulesRestCall, sendMail } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Col, Form, Row, Tag, UploadFile } from "antd";
import { SendButton } from "@/components/colored/JazzButtons";
import MailRule from "jc-shared/mail/mailRule";
import User, { ABENDKASSE, BOOKING, KannSection, ORGA, SUPERUSERS, userGruppen } from "jc-shared/user/user";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import VeranstaltungFormatter from "jc-shared/veranstaltung/VeranstaltungFormatter.ts";
import { TextField } from "@/widgets/TextField";
import Users, { Mailingliste } from "jc-shared/user/users";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import sortBy from "lodash/sortBy";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useNavigate } from "react-router";
import { MarkdownEditor } from "@/widgets/MarkdownEditor.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import UploaderForMail from "@/widgets/UploaderForMail.tsx";
import { RcFile } from "antd/es/upload";
import { useWatch } from "antd/es/form/Form";
import MitarbeiterMultiSelect from "@/widgets/MitarbeiterMultiSelect.tsx";
import MailMessage from "jc-shared/mail/mailMessage.ts";

function mailAddressOrStringAsText(addressOrString: string | { name: string; address: string }) {
  if (typeof addressOrString === "string") {
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

  const usersAsOptions = useMemo(() => allUsers.map((user) => ({ label: user.name, value: user.id, kann: user.kannSections })), [allUsers]);

  const mailingLists = useMemo(() => new Users(allUsers).mailinglisten, [allUsers]);

  const mailingListsDescriptions = useMemo(() => sortBy(mailingLists.map((liste) => liste.name)), [mailingLists]);

  const rulesDescriptions = useMemo(() => sortBy(uniq(mailRules.map((rule) => rule.name))), [mailRules]);

  const kannFilter = useMemo(() => ["Kasse", "Ton", "Licht", "Master", "Ersthelfer"], []);

  const veranstaltungenDescriptions = useMemo(
    () => veranstaltungen.map((v) => new VeranstaltungFormatter(v).description),
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

  function initializeForm() {
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
  }
  useEffect(initializeForm, [form]);

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
    setSelectedUsers(allUsers.filter((user) => (selectedUsersInForm || []).includes(user.id)));
    setSelectedLists(mailingLists.filter((list) => (selectedListsInForm || []).includes(list.name)));
    setSelectedRules(mailRules.filter((rule) => (selectedRulesInForm || []).includes(rule.name)));
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
    const usersFromLists = allUsers.filter((user) => userIdsFromLists.includes(user.id));
    const allUsersFromListsAndUsers = selectedUsers.concat(usersFromLists).map((user) => ({ name: user.name, email: user.email }));
    const allRuleUsers = selectedRules.map((rule) => ({
      name: rule.name,
      email: rule.email,
    }));
    const usersFromKann = new Users(allUsers).getUsersKannOneOf(selectedKannInForm);
    const usersFromUserGruppen = new Users(allUsers).getUsersInGruppenExact(selectedUserGruppenInForm);
    setEffectiveUsers(
      sortBy(uniqBy(allRuleUsers.concat(allUsersFromListsAndUsers).concat(usersFromKann).concat(usersFromUserGruppen), "email"), "name"),
    );
  }, [selectedUsers, selectedLists, selectedRules, allUsers, selectedKannInForm, selectedUserGruppenInForm]);

  function send() {
    form.validateFields().then(async () => {
      const mail = form.getFieldsValue(true);
      const selectedVeranstaltungen = veranstaltungen.filter((ver) =>
        mail.selectedVeranstaltungen.includes(new VeranstaltungFormatter(ver).description),
      );
      const addresses = effectiveUsers.map((user) => MailMessage.formatEMailAddress(user.name, user.email));
      const markdownToSend =
        mail.markdown +
        "\n\n---\n" +
        selectedVeranstaltungen
          .map((veranst) => new VeranstaltungFormatter(veranst).presseTextForMail(window.location.origin))
          .join("\n\n---\n");
      const result = new MailMessage({ subject: `[Jazzclub manuell] ${mail.subject}` });
      result.body = markdownToSend;
      result.bcc = addresses;
      const formData = new FormData();
      formData.append("message", JSON.stringify(result));
      if (fileList.length > 0) {
        fileList.forEach((file) => {
          formData.append("dateien", file as RcFile, file.name);
        });
      }
      const response = await sendMail(formData);

      const successMessage = (
        <>
          <p>Deine Mail wurde gesendet an:</p>
          <ul>
            {response.accepted.map((each) => (
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
  }
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  return (
    <Form
      form={form}
      onValuesChange={() => {
        form
          .validateFields()
          .then((value) => setDirty(!!value.markdown))
          .catch((value) => setDirty(value.errorFields.length === 0 && !!value.values.markdown));
      }}
      onFinish={send}
      layout="vertical"
    >
      <JazzPageHeader title="Mail Senden" buttons={[<SendButton key="save" disabled={!dirty || effectiveUsers.length === 0} />]} />
      <RowWrapper>
        <Row gutter={12}>
          <Col span={12}>
            <MultiSelectWithTags name="selectedVeranstaltungen" label="Veranstaltungen" options={veranstaltungenDescriptions} noAdd />
          </Col>
          <Col span={12}>
            <MultiSelectWithTags name="selectedRules" label="Empfänger (aus Regeln)" options={rulesDescriptions} noAdd />
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <MultiSelectWithTags name="selectedLists" label="Mailinglisten" options={mailingListsDescriptions} noAdd />
          </Col>
          <Col span={12}>
            <MitarbeiterMultiSelect name="selectedUsers" usersAsOptions={usersAsOptions} label="Users" />
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <MultiSelectWithTags name="selectedUserGruppen" label="Benutzer mit Typ" options={userGruppen} noAdd />
          </Col>
          <Col span={12}>
            <MultiSelectWithTags name="selectedKann" label="User kann..." options={kannFilter} noAdd />
          </Col>
        </Row>
        <Row gutter={12} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <h4 style={{ marginTop: 0 }}>Effektive Adressen:</h4>
            {effectiveUsers.map((u) => (
              <Tag key={u.email} color={"purple"}>
                <b>{u.name}</b> ({u.email})
              </Tag>
            ))}
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={24}>
            <TextField name="subject" label="Subject" required />
          </Col>
          <Col span={24}>
            <UploaderForMail fileList={fileList} setFileList={setFileList} />
          </Col>
          <Col span={24}>
            <MarkdownEditor label={<b>Anschreiben:</b>} name="markdown" />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
