import express from "express";

import mailstore from "../lib/mailsender/mailstore";
import MailRule from "../../shared/mail/mailRule";
import { reply } from "../lib/commons/replies";
import Message from "../../shared/mail/message";
import mailtransport from "../lib/mailsender/mailtransport";
import store from "../lib/users/userstore";
import User from "../../shared/user/user";
import { Mailingliste } from "../../shared/user/users";

const app = express();

app.get("/mailrule", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  return mailstore.all((err?: Error, rules?: MailRule[]) => {
    const result = rules?.map((r) => r.toJSON());
    reply(res, err, result);
  });
});

app.post("/mailrule", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  const ruleToSave = new MailRule(req.body);
  mailstore.save(ruleToSave, (err1?: Error) => {
    reply(res, err1, ruleToSave);
  });
});

app.delete("/mailrule", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  mailstore.removeById(req.body.id, (err1?: Error) => {
    reply(res, err1);
  });
});

// Mailinglisten und Senden

app.post("/rundmail", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  const message = Message.fromJSON(req.body);
  return mailtransport.sendMail(message, (err: Error | null) => {
    reply(res, err);
  });
});

app.delete("/mailingliste", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  const listname = req.body.name;
  store.allUsers((err?: Error, users?: User[]) => {
    if (err) {
      return res.status(500).send(err);
    }
    users?.forEach((u) => u.unsubscribeFromList(listname));
    store.saveAll(users || [], (err1?: Error) => {
      reply(res, err1);
    });
  });
});

app.post("/mailingliste", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  const list = new Mailingliste(req.body.name, req.body.users, req.body.originalName);
  store.allUsers((err?: Error, users?: User[]) => {
    if (err) {
      return res.status(500).send(err);
    }
    users?.forEach((u) => u.unsubscribeFromList(list.originalName));
    const selectedUsers = users?.filter((u) => list.users.map((lu) => lu.id).includes(u.id));
    selectedUsers?.forEach((u) => u.subscribeList(list.name));
    store.saveAll(users || [], (err1?: Error) => {
      reply(res, err1);
    });
  });
});

export default app;
