import express, { Request, Response } from "express";

import User from "jc-shared/user/user.js";

import service from "../lib/users/usersService.js";
import store from "../lib/users/userstore.js";
import { resToJson } from "../lib/commons/replies.js";
import { checkCanEditUser, checkSuperuser } from "./checkAccessHandlers.js";
import map from "lodash/map.js";

const app = express();

app.get("/users/current", (req, res) => {
  if (req.user) {
    return resToJson(res, new User(req.user).withoutPass);
  }
  res.sendStatus(401);
});

app.get("/users", (req, res) => {
  const users = store.allUsers();
  resToJson(res, map(users, "withoutPass"));
});

app.post("/user/changePassword", [checkCanEditUser], (req: Request, res: Response) => {
  const user = new User(req.body);
  service.changePassword(user, req.user as User);
  resToJson(res, user.withoutPass);
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
  resToJson(res, user.withoutPass);
});

app.put("/user", [checkSuperuser], (req: Request, res: Response) => {
  const user = new User(req.body);
  service.saveNewUserWithPassword(user, req.user as User);
  resToJson(res, user.withoutPass);
});

app.delete("/user", [checkSuperuser], (req: Request, res: Response) => {
  const userToDelete = new User(req.body);
  store.deleteUser(userToDelete.id, req.user as User);
  resToJson(res, userToDelete.withoutPass);
});

export default app;
