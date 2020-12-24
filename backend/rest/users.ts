import express from "express";

import User from "../../shared/user/user";

import service from "../lib/users/usersService";
import store from "../lib/users/userstore";
import { reply } from "../lib/commons/replies";

const app = express();

app.get("/users/current", (req, res) => {
  if (req.user) {
    return reply(res, undefined, new User(req.user).toJSONWithoutPass());
  }
  res.sendStatus(401);
});

app.get("/users", (req, res) => {
  store.allUsers((err?: Error, users?: User[]) => {
    reply(res, err, { users: users?.map((u) => u.toJSONWithoutPass()) });
  });
});

app.post("/user/changePassword", (req, res) => {
  const user = new User(req.body);
  if (!(req.user as User)?.accessrights?.canEditUser(user.id)) {
    return res.sendStatus(403);
  }
  service.changePassword(user, (err?: Error) => {
    reply(res, err);
  });
});

app.post("/user", (req, res) => {
  const user = new User(req.body);
  if (!(req.user as User)?.accessrights?.canEditUser(user.id)) {
    return res.sendStatus(403);
  }
  store.forId(user.id, (err?: Error, existingUser?: User) => {
    if (err || !existingUser) {
      return reply(res, err || new Error("user not found"));
    }
    user.hashedPassword = existingUser.hashedPassword;
    user.salt = existingUser.salt;
    store.save(user, (err?: Error) => {
      reply(res, err, user);
    });
  });
});

app.put("/user", (req, res) => {
  const user = new User(req.body);
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  service.saveNewUserWithPassword(user, (err?: Error) => {
    reply(res, err);
  });
});

app.delete("/user", (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  const user = new User(req.body);
  store.deleteUser(user.id, (err?: Error) => {
    reply(res, err);
  });
});

export default app;
