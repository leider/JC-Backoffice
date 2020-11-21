import express from "express";

import service from "../lib/users/usersService";
import store from "../lib/users/userstore";
import User from "../../shared/user/user";
import { reply } from "../lib/commons/replies";

const app = express();

app.get("/users/current", (req, res) => {
  reply(res, undefined, req.user);
});

app.get("/users", (req, res) => {
  store.allUsers((err?: Error, users?: User[]) => {
    reply(res, err, { users: users?.map((u) => u.toJSON()) });
  });
});

app.post("/user/changePassword", (req, res) => {
  const user = new User(req.body);
  if (!res.locals.accessrights.canEditUser(user.id)) {
    return res.sendStatus(403);
  }
  service.changePassword(user, (err?: Error, message?: string) => {
    reply(res, err || new Error(message));
  });
});

app.post("/user", (req, res) => {
  const user = new User(req.body);
  if (!res.locals.accessrights.canEditUser(user.id)) {
    return res.sendStatus(403);
  }
  store.save(user, (err?: Error) => {
    reply(res, err, user);
  });
});

app.put("/user", (req, res) => {
  const user = new User(req.body);
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  service.saveNewUserWithPassword(user, (err?: Error, message?: string) => {
    reply(res, err || new Error(message));
  });
});

app.delete("/user", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }
  const user = new User(req.body);
  store.deleteUser(user.id, (err?: Error, message?: string) => {
    reply(res, err || new Error(message));
  });
});

export default app;
