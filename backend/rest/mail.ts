import express from "express";

import User from "jc-shared/user/user.js";
import { Mailingliste } from "jc-shared/user/users.js";
import Message from "jc-shared/mail/message.js";

import mailstore from "../lib/mailsender/mailstore.js";
import MailRule from "jc-shared/mail/mailRule.js";
import { resToJson } from "../lib/commons/replies.js";
import mailtransport from "../lib/mailsender/mailtransport.js";
import userstore from "../lib/users/userstore.js";
import misc from "jc-shared/commons/misc.js";
import { calculateChangedAndDeleted } from "jc-shared/commons/compareObjects.js";

const app = express();

app.get("/mailrule", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  const rules = await mailstore.all();
  const result = rules?.map((r) => r.toJSON());
  resToJson(res, result);
});

app.post("/mailrules", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  const oldRules = await mailstore.all();
  const newRules = misc.toObjectList<MailRule>(MailRule, req.body);
  const { changed, deletedIds } = calculateChangedAndDeleted(
    newRules.map((r) => r.toJSON()),
    oldRules.map((r) => r.toJSON()),
  );

  await mailstore.saveAll(changed);
  await mailstore.removeAll(deletedIds);
  resToJson(res, await mailstore.all());
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

app.post("/mailinglisten", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  const users = await userstore.allUsers();
  const newLists = req.body as Mailingliste[];

  users?.forEach((u) => (u.mailinglisten = []));

  newLists.forEach((list) => {
    const selectedUsers = users?.filter((u) => list.users.includes(u.id));
    selectedUsers?.forEach((u) => u.subscribeList(list.name));
  });

  await userstore.saveAll(users || []);
  resToJson(res, users);
});

export default app;
