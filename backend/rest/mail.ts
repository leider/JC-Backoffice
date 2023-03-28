import express from "express";

import User from "jc-shared/user/user.js";
import { Mailingliste } from "jc-shared/user/users.js";
import Message from "jc-shared/mail/message.js";

import mailstore from "../lib/mailsender/mailstore.js";
import MailRule from "jc-shared/mail/mailRule.js";
import { resToJson } from "../lib/commons/replies.js";
import mailtransport from "../lib/mailsender/mailtransport.js";
import store from "../lib/users/userstore.js";

const app = express();

app.get("/mailrule", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  const rules = await mailstore.all();
  const result = rules?.map((r) => r.toJSON());
  resToJson(res, result);
});

app.post("/mailrule", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  const ruleToSave = new MailRule(req.body);
  await mailstore.save(ruleToSave);
  resToJson(res, ruleToSave);
});

app.delete("/mailrule", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  await mailstore.removeById(req.body.id);
  resToJson(res);
});

// Mailinglisten und Senden

app.post("/rundmail", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  const message = Message.fromJSON(req.body);
  await mailtransport.sendMail(message);
  resToJson(res);
});

app.delete("/mailingliste", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  const listname = req.body.name;
  const users = await store.allUsers();
  users?.forEach((u) => u.unsubscribeFromList(listname));
  await store.saveAll(users || []);
  resToJson(res);
});

app.post("/mailingliste", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  const list = new Mailingliste(req.body.name, req.body.users, req.body.originalName);
  const users = await store.allUsers();
  users?.forEach((u) => u.unsubscribeFromList(list.originalName));
  const selectedUsers = users?.filter((u) => list.users.map((lu) => lu.id).includes(u.id));
  selectedUsers?.forEach((u) => u.subscribeList(list.name));
  await store.saveAll(users || []);
  resToJson(res);
});

export default app;
