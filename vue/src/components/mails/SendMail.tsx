import { PageHeader } from "@ant-design/pro-layout";
import { useQuery } from "@tanstack/react-query";
import { mailRules as mailRulesRestCall, sendMail, veranstaltungenForTeam } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Col, Form, Row, Tag } from "antd";
import { SendButton } from "@/components/colored/JazzButtons";
import MailRule from "jc-shared/mail/mailRule";
import User from "jc-shared/user/user";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import VeranstaltungVermietungFormatter from "../../../../shared/veranstaltung/VeranstaltungVermietungFormatter";
import { TextField } from "@/widgets/TextField";
import SimpleMdeReact from "react-simplemde-editor";
import Users, { Mailingliste } from "jc-shared/user/users";
import UserMultiSelect from "@/widgets/UserMultiSelect.tsx";
import Message from "jc-shared/mail/message";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import sortBy from "lodash/sortBy";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useNavigate } from "react-router-dom";
import MitarbeiterMultiSelect from "@/components/team/MitarbeiterMultiSelect.tsx";

export default function SendMail() {
  const editorOptions = useMemo(
    () => ({
      status: false,
      spellChecker: false,
      sideBySideFullscreen: false,
      minHeight: "500px",
    }),
    [],
  );

  const { showSuccess } = useJazzContext();

  const navigate = useNavigate();

  const mailRuleQuery = useQuery({
    queryKey: ["mailRules"],
    queryFn: mailRulesRestCall,
  });
  const veranstaltungenQuery = useQuery({
    queryKey: ["veranstaltungenZukuenftig"],
    queryFn: () => veranstaltungenForTeam("zukuenftige"),
  });
  const { allUsers, currentUser } = useJazzContext();

  const usersAsOptions = useMemo(() => allUsers.map((user) => ({ label: user.name, value: user.id, kann: user.kannSections })), [allUsers]);

  const mailingLists = useMemo(() => new Users(allUsers).mailinglisten, [allUsers]);

  const mailingListsDescriptions = useMemo(() => sortBy(mailingLists.map((liste) => liste.name)), [mailingLists]);

  const [rules, setRules] = useState<MailRule[]>([]);
  const [rulesDescriptions, setRulesDescriptions] = useState<string[]>([]);
  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);
  const [veranstaltungenDescriptions, setVeranstaltungenDescriptions] = useState<string[]>([]);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedLists, setSelectedLists] = useState<Mailingliste[]>([]);
  const [selectedRules, setSelectedRules] = useState<MailRule[]>([]);
  const [effectiveUsers, setEffectiveUsers] = useState<{ name: string; email: string }[]>([]);

  const [dirty, setDirty] = useState<boolean>(false);
  document.title = "Mail Senden";

  useEffect(() => {
    if (mailRuleQuery.data) {
      setRules(mailRuleQuery.data);
      setRulesDescriptions(sortBy(uniq(mailRuleQuery.data.map((rule) => rule.name))));
    }
    if (veranstaltungenQuery.data) {
      setVeranstaltungen(veranstaltungenQuery.data);
      setVeranstaltungenDescriptions(veranstaltungenQuery.data.map((v) => new VeranstaltungVermietungFormatter(v).description));
    }
  }, [mailRuleQuery.data, veranstaltungenQuery.data]);

  const [form] = Form.useForm<{
    subject: string;
    markdown: string;
    selectedRules: string[];
    selectedVeranstaltungen: string[];
    selectedLists: string[];
    selectedUsers: string[];
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
    });
    form.validateFields();
  }
  useEffect(initializeForm, [form]);

  const selectedVeranstaltungenChanged = Form.useWatch("selectedVeranstaltungen", {
    form,
  });

  const selectedRulesChanged = Form.useWatch("selectedRules", {
    form,
  });

  const selectedListsChanged = Form.useWatch("selectedLists", {
    form,
  });

  const selectedUsersChanged = Form.useWatch("selectedUsers", {
    form,
  });

  const subject = Form.useWatch("subject", {
    form,
  });

  useEffect(() => {
    setSelectedUsers(allUsers.filter((user) => (selectedUsersChanged || []).includes(user.id)));
    setSelectedLists(mailingLists.filter((list) => (selectedListsChanged || []).includes(list.name)));
    setSelectedRules(rules.filter((rule) => (selectedRulesChanged || []).includes(rule.name)));
    if (selectedVeranstaltungenChanged?.length || (0 > 0 && subject === "")) {
      form.setFieldValue("subject", "[Jazzclub manuell] Veranstaltungen für ...");
    }
  }, [
    allUsers,
    selectedUsersChanged,
    selectedRulesChanged,
    selectedListsChanged,
    mailingLists,
    rules,
    selectedVeranstaltungenChanged,
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
    setEffectiveUsers(sortBy(uniqBy(allRuleUsers.concat(allUsersFromListsAndUsers), "email"), "name"));
  }, [selectedUsers, selectedLists, selectedRules, allUsers]);

  function send() {
    form.validateFields().then(async () => {
      const mail = form.getFieldsValue(true);
      const selectedVeranstaltungen = veranstaltungen.filter((ver) =>
        mail.selectedVeranstaltungen.includes(new VeranstaltungVermietungFormatter(ver).description),
      );
      const addresses = effectiveUsers.map((user) => Message.formatEMailAddress(user.name, user.email));
      const markdownToSend =
        mail.markdown +
        "\n\n---\n" +
        selectedVeranstaltungen
          .map((veranst) => new VeranstaltungVermietungFormatter(veranst).presseTextForMail(window.location.origin))
          .join("\n\n---\n");
      const result = new Message({ subject: mail.subject, markdown: markdownToSend }, currentUser.name, currentUser.email);
      result.setBcc(addresses);
      await sendMail(result);
      initializeForm();
      showSuccess({ title: "Erfolgreich", text: "Deine Mail wurde gesendet." });
      navigate("/");
    });
  }

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
      <PageHeader title="Mail Senden" extra={[<SendButton key="save" disabled={!dirty || effectiveUsers.length === 0} />]} />
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
            {/*<UserMultiSelect*/}
            {/*  name="selectedLists"*/}
            {/*  label="Gruppen / Mailinglisten"*/}
            {/*  usersAsOptions={mailingListsDescriptions.map((s) => ({ label: s, value: s }))}*/}
            {/*/>*/}
            <MultiSelectWithTags name="selectedLists" label="Gruppen / Mailinglisten" options={mailingListsDescriptions} noAdd />
          </Col>
          <Col span={12}>
            <UserMultiSelect name="selectedUsers" label="Users" usersAsOptions={usersAsOptions} />
            <MitarbeiterMultiSelect name="selectedUsers" usersAsOptions={usersAsOptions} label="Users" />
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
            <Form.Item label={<b>Anschreiben:</b>} name="markdown" required>
              <SimpleMdeReact autoFocus options={editorOptions} />
            </Form.Item>
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
