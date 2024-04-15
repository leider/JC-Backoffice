import express, { Request, Response } from "express";

import User from "jc-shared/user/user.js";

import service from "../lib/users/usersService.js";
import store from "../lib/users/userstore.js";
import { reply, resToJson } from "../lib/commons/replies.js";
import { checkCanEditUser, checkSuperuser } from "./checkAccessHandlers.js";

const app = express();

app.get("/users/current", (req, res) => {
  if (req.user) {
    return reply(res, undefined, new User(req.user).toJSONWithoutPass());
  }
  res.sendStatus(401);
});

app.get("/users", (req, res) => {
  const users = store.allUsers();
  resToJson(res, { users: users.map((u) => u.toJSONWithoutPass()) });
});

app.post("/user/changePassword", [checkCanEditUser], (req: Request, res: Response) => {
  const user = new User(req.body);
  service.changePassword(user, req.user as User);
  resToJson(res, user);
});

app.post("/user", [checkCanEditUser], (req: Request, res: Response) => {
  const user = new User(req.body);
  const existingUser = store.forId(user.id);
  if (!existingUser) {
    throw new Error("user not found");
  }
  user.hashedPassword = existingUser.hashedPassword;
  user.salt = existingUser.salt;
  store.save(user, req.user as User);
  resToJson(res, user);
});

app.put("/user", [checkSuperuser], (req: Request, res: Response) => {
  const user = new User(req.body);
  service.saveNewUserWithPassword(user, req.user as User);
  resToJson(res, user);
});

app.delete("/user", [checkSuperuser], (req: Request, res: Response) => {
  const userToDelete = new User(req.body);
  store.deleteUser(userToDelete.id, req.user as User);
  resToJson(res, userToDelete);
});

export default app;
