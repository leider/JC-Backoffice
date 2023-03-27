import express from "express";

import User from "jc-shared/user/user.js";

import service from "../lib/users/usersService.js";
import store from "../lib/users/userstore.js";
import { reply, resToJson } from "../lib/commons/replies.js";

const app = express();

app.get("/users/current", (req, res) => {
  if (req.user) {
    return reply(res, undefined, new User(req.user).toJSONWithoutPass());
  }
  res.sendStatus(401);
});

app.get("/users", async (req, res) => {
  const users = await store.allUsers();
  resToJson(res, { users: users?.map((u) => u.toJSONWithoutPass()) });
});

app.post("/user/changePassword", async (req, res) => {
  const user = new User(req.body);
  if (!(req.user as User)?.accessrights?.canEditUser(user.id)) {
    return res.sendStatus(403);
  }
  await service.changePassword(user);
  resToJson(res, user);
});

app.post("/user", async (req, res) => {
  const user = new User(req.body);
  if (!(req.user as User)?.accessrights?.canEditUser(user.id)) {
    return res.sendStatus(403);
  }
  const existingUser = await store.forId(user.id);
  if (!existingUser) {
    throw new Error("user not found");
  }
  user.hashedPassword = existingUser.hashedPassword;
  user.salt = existingUser.salt;
  await store.save(user);
  resToJson(res, user);
});

app.put("/user", async (req, res) => {
  const user = new User(req.body);
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  await service.saveNewUserWithPassword(user);
  resToJson(res, user);
});

app.delete("/user", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }
  const user = new User(req.body);
  await store.deleteUser(user.id);
  resToJson(res, user);
});

export default app;
