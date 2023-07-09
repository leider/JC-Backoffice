import { PageHeader } from "@ant-design/pro-layout";
import { useQuery } from "@tanstack/react-query";
import { allUsers, mailRules as mailRulesRestCall, sendMail, veranstaltungenForTeam } from "@/commons/loader-for-react";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Col, Form, Row, Tag } from "antd";
import { SendButton } from "@/components/colored/JazzButtons";
import MailRule from "jc-shared/mail/mailRule";
import User from "jc-shared/user/user";
import { useAuth } from "@/commons/auth";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import MultiSelectWithTags from "@/widgets-react/MultiSelectWithTags";
import VeranstaltungFormatter from "jc-shared/veranstaltung/veranstaltungFormatter";
import { TextField } from "@/widgets-react/TextField";
import SimpleMdeReact from "react-simplemde-editor";
import _ from "lodash";
import Users, { Mailingliste } from "jc-shared/user/users";
import UserMultiSelect, { UsersAsOption } from "@/components/team/UserMultiSelect";
import Message from "jc-shared/mail/message";

export default function SendMail() {
  const editorOptions = useMemo(
    () => ({
      status: false,
      spellChecker: false,
      sideBySideFullscreen: false,
      minHeight: "500px",
    }),
    []
  );

  const mailRuleQuery = useQuery({
    queryKey: ["mailRules"],
    queryFn: mailRulesRestCall,
  });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: allUsers });
  const veranstaltungenQuery = useQuery({
    queryKey: ["veranstaltungenZukuenftig"],
    queryFn: () => veranstaltungenForTeam("zukuenftige"),
  });
  const { context } = useAuth();

  const [rules, setRules] = useState<MailRule[]>([]);
  const [rulesDescriptions, setRulesDescriptions] = useState<string[]>([]);
  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);
  const [veranstaltungenDescriptions, setVeranstaltungenDescriptions] = useState<string[]>([]);
  const [mailingLists, setMailingLists] = useState<Mailingliste[]>([]);
  const [mailingListsDescriptions, setMailingListsDescriptions] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersAsOptions, setUsersAsOptions] = useState<UsersAsOption[]>([]);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedLists, setSelectedLists] = useState<Mailingliste[]>([]);
  const [selectedRules, setSelectedRules] = useState<MailRule[]>([]);
  const [effectiveUsers, setEffectiveUsers] = useState<{ name: string; email: string }[]>([]);

  const [currentUser, setCurrentUser] = useState<User>(new User({}));

  const [canSend, setCanSend] = useState<boolean>(false);

  document.title = "Mail Senden";

  useEffect(() => {
    if (mailRuleQuery.data) {
      setRules(mailRuleQuery.data);
      setRulesDescriptions(_.sortBy(_.uniq(mailRuleQuery.data.map((rule) => rule.name))));
    }
    if (veranstaltungenQuery.data) {
      setVeranstaltungen(veranstaltungenQuery.data);
      setVeranstaltungenDescriptions(veranstaltungenQuery.data.map((v) => new VeranstaltungFormatter(v).description));
    }
    if (usersQuery.data) {
      const mailinglisten = new Users(usersQuery.data).mailinglisten;
      setMailingLists(mailinglisten);
      setMailingListsDescriptions(_.sortBy(mailinglisten.map((liste) => liste.name)));
      setUsers(usersQuery.data);
      setUsersAsOptions(usersQuery.data.map((user) => ({ label: user.name, value: user.id })));
    }
  }, [mailRuleQuery.data, veranstaltungenQuery.data, usersQuery.data]);

  useEffect(() => {
    if (context?.currentUser) {
      setCurrentUser(context?.currentUser);
    }
  }, [context]);

  const [form] = Form.useForm<any>();

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

  function veranstaltungChanged() {
    const value = form.getFieldsValue(true);
    if (value.selectedVeranstaltungen.length > 0 && value.subject === "") {
      form.setFieldValue("subject", "[Jazzclub manuell] Veranstaltungen für ...");
    }
  }
  function rulesChanged(value: string[]) {
    setSelectedRules(rules.filter((rule) => value.includes(rule.name)));
  }
  function listsChanged(value: string[]) {
    setSelectedLists(mailingLists.filter((list) => value.includes(list.name)));
  }

  function usersChanged(value: string[]) {
    setSelectedUsers(users.filter((user) => value.includes(user.id)));
  }

  useEffect(() => {
    updateEffectiveUsers();
  }, [selectedUsers, selectedLists, selectedRules]);

  function updateEffectiveUsers() {
    const usersFromLists = selectedLists.flatMap((list) => list.users);
    const allUsersFromListsAndUsers = selectedUsers.concat(usersFromLists).map((user) => ({ name: user.name, email: user.email }));
    const allRuleUsers = selectedRules.map((rule) => ({
      name: rule.name,
      email: rule.email,
    }));
    setEffectiveUsers(_.sortBy(_.uniqBy(allRuleUsers.concat(allUsersFromListsAndUsers), "email"), "name"));
  }

  function send() {
    form.validateFields().then(async () => {
      const mail = form.getFieldsValue(true);
      const selectedVeranstaltungen = veranstaltungen.filter((ver) =>
        mail.selectedVeranstaltungen.includes(new VeranstaltungFormatter(ver).description)
      );
      const addresses = effectiveUsers.map((user) => Message.formatEMailAddress(user.name, user.email));
      const markdownToSend =
        mail.markdown +
        "\n\n---\n" +
        selectedVeranstaltungen
          .map((veranst) => new VeranstaltungFormatter(veranst).presseTextForMail(window.location.origin))
          .join("\n\n---\n");
      const result = new Message({ subject: mail.subject, markdown: markdownToSend }, currentUser.name, currentUser.email);
      result.setBcc(addresses);
      await sendMail(result);
      initializeForm();
    });
  }

  return (
    <Form
      form={form}
      onValuesChange={() => {
        form
          .validateFields()
          .then((value) => setCanSend(!!value.markdown))
          .catch((value) => setCanSend(value.errorFields.length === 0 && !!value.values.markdown));
      }}
      onFinish={send}
      layout="vertical"
    >
      <PageHeader title="Mail Senden" extra={[<SendButton key="save" disabled={!canSend || effectiveUsers.length === 0} />]}></PageHeader>
      <Row gutter={12}>
        <Col span={12}>
          <MultiSelectWithTags
            name="selectedVeranstaltungen"
            label="Veranstaltungen"
            options={veranstaltungenDescriptions}
            onChange={veranstaltungChanged}
          />
        </Col>
        <Col span={12}>
          <MultiSelectWithTags name="selectedRules" label="Empfänger (aus Regeln)" options={rulesDescriptions} onChange={rulesChanged} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <MultiSelectWithTags
            name="selectedLists"
            label="Gruppen / Mailinglisten"
            options={mailingListsDescriptions}
            onChange={listsChanged}
          />
        </Col>
        <Col span={12}>
          <UserMultiSelect name="selectedUsers" label="Users" usersAsOptions={usersAsOptions} onChange={usersChanged} />
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
    </Form>
  );
}
